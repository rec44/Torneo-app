<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegistrarResultadoRequest;
use App\Http\Requests\UpdatePartidoRequest;
use App\Mail\ResultadoRegistrado;
use App\Mail\TorneoFinalizado;
use App\Models\Partido;
use App\Services\EloService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

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

        $data = $request->validated();

        if (! empty($data['programado_en'])) {
            $nuevaFecha = new \Carbon\Carbon($data['programado_en']);
            $ronda      = $partido->ronda;
            $torneoId   = $partido->torneo_id;
            $maxRonda   = Partido::where('torneo_id', $torneoId)->max('ronda');

            $labelRonda = match (true) {
                $ronda === $maxRonda     => 'la final',
                $ronda === $maxRonda - 1 => 'las semifinales',
                $ronda === $maxRonda - 2 => 'los cuartos de final',
                default                  => "la ronda {$ronda}",
            };

            if ($ronda > 1) {
                $maxAnterior = Partido::where('torneo_id', $torneoId)
                    ->where('ronda', $ronda - 1)
                    ->whereNotNull('programado_en')
                    ->max('programado_en');

                if ($maxAnterior && $nuevaFecha->lt($maxAnterior)) {
                    $labelAnterior = match (true) {
                        $ronda - 1 === $maxRonda - 1 => 'las semifinales',
                        $ronda - 1 === $maxRonda - 2 => 'los cuartos de final',
                        default                      => "la ronda " . ($ronda - 1),
                    };
                    return response()->json([
                        'message' => "La fecha de {$labelRonda} no puede ser anterior a {$labelAnterior}.",
                    ], 422);
                }
            }

            $minSiguiente = Partido::where('torneo_id', $torneoId)
                ->where('ronda', $ronda + 1)
                ->whereNotNull('programado_en')
                ->min('programado_en');

            if ($minSiguiente && $nuevaFecha->gt($minSiguiente)) {
                $labelSiguiente = match (true) {
                    $ronda + 1 === $maxRonda     => 'la final',
                    $ronda + 1 === $maxRonda - 1 => 'las semifinales',
                    default                      => "la ronda " . ($ronda + 1),
                };
                return response()->json([
                    'message' => "La fecha de {$labelRonda} no puede ser posterior a {$labelSiguiente}.",
                ], 422);
            }
        }

        $partido->update($data);

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

        if ($torneo->estado === 'programacion') {
            return response()->json(['message' => 'No se pueden registrar resultados mientras el torneo está en fase de programación.'], 422);
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

        // Email de resultado a los miembros de ambos equipos
        $historial = $fresco->historialElo()->get()->keyBy('usuario_id');
        foreach ([$fresco->equipo1, $fresco->equipo2] as $equipo) {
            if (! $equipo) continue;
            foreach ($equipo->miembros as $miembro) {
                $delta = $historial[$miembro->id]->delta ?? 0;
                Mail::to($miembro->email)->queue(
                    new ResultadoRegistrado($fresco->load('torneo', 'equipo1', 'equipo2', 'ganadorEquipo'), $miembro->nombre, $delta)
                );
            }
        }

        // Finalizar el torneo automáticamente si ya no quedan partidos pendientes
        $hayPendientes = Partido::where('torneo_id', $torneo->id)
            ->where('estado', '!=', 'finalizado')
            ->exists();

        if (! $hayPendientes) {
            $torneo->update(['estado' => 'finalizado']);

            // Email de torneo finalizado a todos los participantes
            $campeon = $fresco->ganadorEquipo?->nombre ?? '—';
            $torneo->load('deporte');
            $participantes = DB::table('usuarios')
                ->join('equipo_usuarios', 'usuarios.id', '=', 'equipo_usuarios.usuario_id')
                ->join('equipos', 'equipo_usuarios.equipo_id', '=', 'equipos.id')
                ->where('equipos.torneo_id', $torneo->id)
                ->select('usuarios.email', 'usuarios.nombre')
                ->distinct()
                ->get();

            foreach ($participantes as $u) {
                Mail::to($u->email)->queue(new TorneoFinalizado($torneo, $u->nombre, $campeon));
            }
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
