<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegistrarResultadoRequest;
use App\Http\Requests\UpdatePartidoRequest;
use App\Models\Partido;
use App\Services\EloService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartidoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $partidos = Partido::with(
            'equipo1:id,nombre',
            'equipo2:id,nombre',
            'ganadorEquipo:id,nombre',
            'torneo:id,nombre'
        )
            ->when($request->torneo_id, fn($q, $v) => $q->where('torneo_id', $v))
            ->when($request->estado, fn($q, $v) => $q->where('estado', $v))
            ->paginate(20);

        return response()->json($partidos);
    }

    public function show(Partido $partido): JsonResponse
    {
        $partido->load(
            'equipo1:id,nombre',
            'equipo2:id,nombre',
            'ganadorEquipo:id,nombre',
            'torneo:id,nombre'
        );

        return response()->json($partido);
    }

    public function update(UpdatePartidoRequest $request, Partido $partido): JsonResponse
    {
        $user = $request->user();
        $esOrganizador = $user->id === $partido->torneo->creado_por || $user->rol === 'admin';

        if (! $esOrganizador) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $partido->update($request->validated());

        return response()->json($partido->fresh());
    }

    public function destroy(Request $request, Partido $partido): JsonResponse
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $partido->delete();

        return response()->json(null, 204);
    }

    public function registrarResultado(RegistrarResultadoRequest $request, Partido $partido): JsonResponse
    {
        $user   = $request->user();
        $torneo = $partido->torneo()->first();
        $esOrganizador = $user->id === $torneo->creado_por || $user->rol === 'admin';

        if (! $esOrganizador) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validated();

        if ($data['ganador_equipo_id'] !== $partido->equipo1_id
            && $data['ganador_equipo_id'] !== $partido->equipo2_id) {
            return response()->json(['message' => 'El ganador debe ser uno de los equipos del partido.'], 422);
        }

        $eraFinalizado   = $partido->estado === 'finalizado';
        $ganadorAnterior = $partido->ganador_equipo_id;

        $partido->update([
            'resultado_e1'      => $data['resultado_e1'],
            'resultado_e2'      => $data['resultado_e2'],
            'ganador_equipo_id' => $data['ganador_equipo_id'],
            'estado'            => 'finalizado',
        ]);

        $fresco     = $partido->fresh();
        $eloService = app(EloService::class);

        $this->procesarAvanceBracket($fresco);

        if ($eraFinalizado && $ganadorAnterior !== (int) $data['ganador_equipo_id']) {
            $eloService->revertirPorPartido($fresco, $ganadorAnterior);
            $eloService->actualizarPorPartido($fresco);
        } elseif (! $eraFinalizado) {
            $eloService->actualizarPorPartido($fresco);
        }

        // Finalizar el torneo automáticamente si ya no quedan partidos pendientes
        $hayPendientes = Partido::where('torneo_id', $torneo->id)
            ->where('estado', '!=', 'finalizado')
            ->exists();

        if (! $hayPendientes) {
            $torneo->update(['estado' => 'finalizado']);
        }

        return response()->json(
            $partido->load('equipo1:id,nombre', 'equipo2:id,nombre', 'ganadorEquipo:id,nombre')
        );
    }

    private function procesarAvanceBracket(Partido $partido): void
    {
        [$siguiente, $esEquipo1] = $this->siguienteEnBracket($partido);
        if (!$siguiente) return;

        $nuevoGanador = (int) $partido->ganador_equipo_id;
        $slotActual   = (int) ($esEquipo1 ? $siguiente->equipo1_id : $siguiente->equipo2_id);

        $update = $esEquipo1
            ? ['equipo1_id' => $nuevoGanador]
            : ['equipo2_id' => $nuevoGanador];

        if ($slotActual !== $nuevoGanador && $siguiente->estado !== 'pendiente') {
            $update = array_merge($update, [
                'ganador_equipo_id' => null,
                'resultado_e1'      => null,
                'resultado_e2'      => null,
                'estado'            => 'pendiente',
            ]);
            $this->limpiarCascada($siguiente);
        }

        $siguiente->update($update);
    }

    private function limpiarCascada(Partido $partido): void
    {
        [$siguiente, $esEquipo1] = $this->siguienteEnBracket($partido);
        if (!$siguiente) return;

        $update = $esEquipo1
            ? ['equipo1_id' => null]
            : ['equipo2_id' => null];

        if ($siguiente->estado !== 'pendiente') {
            $update = array_merge($update, [
                'ganador_equipo_id' => null,
                'resultado_e1'      => null,
                'resultado_e2'      => null,
                'estado'            => 'pendiente',
            ]);
            $this->limpiarCascada($siguiente);
        }

        $siguiente->update($update);
    }

    private function siguienteEnBracket(Partido $partido): array
    {
        $ids = Partido::where('torneo_id', $partido->torneo_id)
            ->where('ronda', $partido->ronda)
            ->orderBy('id')
            ->pluck('id');

        $posicion = $ids->search($partido->id);
        if ($posicion === false) return [null, false];

        $siguiente = Partido::where('torneo_id', $partido->torneo_id)
            ->where('ronda', $partido->ronda + 1)
            ->orderBy('id')
            ->skip(intdiv($posicion, 2))
            ->first();

        return [$siguiente, $posicion % 2 === 0];
    }
}
