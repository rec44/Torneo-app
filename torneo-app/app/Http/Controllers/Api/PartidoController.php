<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartidoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $partidos = Partido::with('jugador1:id,nombre', 'jugador2:id,nombre', 'ganador:id,nombre', 'torneo:id,nombre')
            ->when($request->torneo_id, fn($q, $v) => $q->where('torneo_id', $v))
            ->when($request->estado, fn($q, $v) => $q->where('estado', $v))
            ->paginate(20);

        return response()->json($partidos);
    }

    public function show(Partido $partido): JsonResponse
    {
        $partido->load('jugador1:id,nombre', 'jugador2:id,nombre', 'ganador:id,nombre', 'torneo:id,nombre');
        return response()->json($partido);
    }

    public function update(Request $request, Partido $partido): JsonResponse
    {
        $user = $request->user();
        $esOrganizador = $user->id === $partido->torneo->creado_por || $user->rol === 'admin';

        if (! $esOrganizador) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'programado_en' => 'nullable|date',
            'estado'        => 'sometimes|in:pendiente,en_curso,cancelado',
        ]);

        $partido->update($data);

        return response()->json($partido->fresh());
    }

    public function destroy(Request $request, Partido $partido): JsonResponse
    {
        $user = $request->user();
        if ($user->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $partido->delete();

        return response()->json(null, 204);
    }

    public function registrarResultado(Request $request, Partido $partido): JsonResponse
    {
        $user = $request->user();
        $torneo = $partido->torneo()->with('creadoPor')->first();
        $esOrganizador = $user->id === $torneo->creado_por || $user->rol === 'admin';

        if (! $esOrganizador) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($partido->estado === 'finalizado') {
            return response()->json(['message' => 'El partido ya está finalizado.'], 422);
        }

        $data = $request->validate([
            'resultado_j1' => 'required|string|max:50',
            'resultado_j2' => 'required|string|max:50',
            'ganador_id'   => 'required|exists:usuarios,id',
        ]);

        if ($data['ganador_id'] !== $partido->jugador1_id && $data['ganador_id'] !== $partido->jugador2_id) {
            return response()->json(['message' => 'El ganador debe ser uno de los jugadores del partido.'], 422);
        }

        $partido->update([
            'resultado_j1' => $data['resultado_j1'],
            'resultado_j2' => $data['resultado_j2'],
            'ganador_id'   => $data['ganador_id'],
            'estado'       => 'finalizado',
        ]);

        return response()->json($partido->load('jugador1:id,nombre', 'jugador2:id,nombre', 'ganador:id,nombre'));
    }
}
