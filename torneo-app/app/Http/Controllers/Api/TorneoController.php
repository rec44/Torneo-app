<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTorneoRequest;
use App\Http\Requests\UpdateTorneoRequest;
use App\Models\Torneo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TorneoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $torneos = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount('equipos')
            ->when(
                $request->filled('estado'),
                fn($q) => $q->where('estado', $request->estado),
                fn($q) => $q->whereNotIn('estado', ['finalizado', 'cancelado'])
            )
            ->when($request->deporte_id, fn($q, $v) => $q->where('deporte_id', $v))
            ->paginate(15);

        return response()->json($torneos);
    }

    public function store(StoreTorneoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['creado_por'] = $request->user()->id;

        $torneo = Torneo::create($data);

        return response()->json($torneo->load('deporte'), 201);
    }

    public function show(Torneo $torneo): JsonResponse
    {
        $torneo->load([
            'deporte',
            'creadoPor:id,nombre',
            'equipos.capitan:id,nombre',
            'equipos.miembros:id,nombre,elo',
            'partidos.equipo1:id,nombre',
            'partidos.equipo2:id,nombre',
            'partidos.ganadorEquipo:id,nombre',
        ]);

        return response()->json($torneo);
    }

    public function update(UpdateTorneoRequest $request, Torneo $torneo): JsonResponse
    {
        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'Solo se puede editar un torneo abierto.'], 422);
        }

        $torneo->update($request->validated());

        return response()->json($torneo->fresh());
    }

    public function destroy(Request $request, Torneo $torneo): JsonResponse
    {
        if ($request->user()->id !== $torneo->creado_por && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $torneo->delete();

        return response()->json(null, 204);
    }

    public function misTorneos(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $creados = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount('equipos')
            ->where('creado_por', $usuario->id)
            ->get();

        $inscrito = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount('equipos')
            ->whereHas('equipos.miembros', fn($q) => $q->where('usuarios.id', $usuario->id))
            ->get();

        return response()->json([
            'creados'  => $creados,
            'inscrito' => $inscrito,
        ]);
    }

    public function iniciar(Request $request, Torneo $torneo): JsonResponse
    {
        if ($request->user()->id !== $torneo->creado_por && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está en estado abierto.'], 422);
        }

        $todosEquipos = $torneo->equipos()->get();
        $inscritos    = $todosEquipos->filter(fn($e) => $e->inscrito);
        $noInscritos  = $todosEquipos->filter(fn($e) => ! $e->inscrito);

        if ($inscritos->isEmpty()) {
            return response()->json(['message' => 'No hay equipos inscritos (bloqueados) para iniciar el torneo.'], 422);
        }

        foreach ($noInscritos as $equipo) {
            $equipo->delete();
        }

        $inscritos->shuffle()->values()->each(function ($equipo, $index) {
            $equipo->update(['semilla' => $index + 1]);
        });

        $torneo->update(['estado' => 'en_curso']);

        $mensaje = 'Torneo iniciado correctamente.';
        if ($noInscritos->isNotEmpty()) {
            $nombres  = $noInscritos->pluck('nombre')->join(', ');
            $mensaje .= " Los siguientes equipos fueron retirados por no haberse inscrito: {$nombres}.";
        }

        return response()->json([
            'message' => $mensaje,
            'torneo'  => $torneo->fresh()->load('equipos'),
        ]);
    }
}
