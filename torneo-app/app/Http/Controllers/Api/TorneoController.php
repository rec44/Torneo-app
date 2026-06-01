<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTorneoRequest;
use App\Http\Requests\UpdateTorneoRequest;
use App\Models\Partido;
use App\Models\Torneo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TorneoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $torneos = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount(['equipos as equipos_count' => fn($q) => $q->where('bloqueado', true)])
            ->when(
                $request->filled('estado'),
                fn($q) => $q->where('estado', $request->estado),
                fn($q) => $q->where('estado', '!=', 'finalizado')
            )
            ->when($request->deporte_id,   fn($q, $v) => $q->where('deporte_id', $v))
            ->when($request->fecha_desde,  fn($q, $v) => $q->whereDate('fecha_inicio', '>=', $v))
            ->when($request->fecha_hasta,  fn($q, $v) => $q->whereDate('fecha_inicio', '<=', $v))
            ->when($request->elo_min,      fn($q, $v) => $q->where('elo_minimo', '>=', $v))
            ->when($request->elo_max,      fn($q, $v) => $q->where('elo_maximo', '<=', $v))
            ->orderBy('fecha_inicio', 'asc')
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
            'partidos.historialElo:id,partido_id,usuario_id,elo_antes,elo_despues,delta',
        ]);

        return response()->json($torneo);
    }

    public function update(UpdateTorneoRequest $request, Torneo $torneo): JsonResponse
    {
        $this->authorize('update', $torneo);

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'Solo se puede editar un torneo abierto.'], 422);
        }

        $torneo->update($request->validated());

        return response()->json($torneo->fresh());
    }

    public function destroy(Request $request, Torneo $torneo): JsonResponse
    {
        $this->authorize('delete', $torneo);

        if ($torneo->estado === 'en_curso') {
            return response()->json(['message' => 'No se puede eliminar un torneo en curso.'], 422);
        }

        $torneo->delete();

        return response()->json(null, 204);
    }

    public function misTorneos(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $creados = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount(['equipos as equipos_count' => fn($q) => $q->where('bloqueado', true)])
            ->where('creado_por', $usuario->id)
            ->get();

        $inscrito = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount(['equipos as equipos_count' => fn($q) => $q->where('bloqueado', true)])
            ->whereHas('equipos.miembros', fn($q) => $q->where('usuarios.id', $usuario->id))
            ->get();

        return response()->json([
            'creados'  => $creados,
            'inscrito' => $inscrito,
        ]);
    }

    public function iniciar(Request $request, Torneo $torneo): JsonResponse
    {
        $this->authorize('iniciar', $torneo);

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está en estado abierto.'], 422);
        }

        $todosEquipos = $torneo->equipos()->get();
        $confirmados  = $todosEquipos->filter(fn($e) => $e->bloqueado);
        $noConfirmados = $todosEquipos->filter(fn($e) => ! $e->bloqueado);

        if ($confirmados->isEmpty()) {
            return response()->json(['message' => 'No hay equipos confirmados (bloqueados) para iniciar el torneo.'], 422);
        }

        foreach ($noConfirmados as $equipo) {
            $equipo->delete();
        }

        $confirmados->shuffle()->values()->each(function ($equipo, $index) {
            $equipo->update(['semilla' => $index + 1]);
        });

        $torneo->update(['estado' => 'en_curso']);

        if ($torneo->formato === 'eliminacion_simple') {
            $this->generarBracketEliminacionSimple($torneo, $confirmados->values());
        }

        $mensaje = 'Torneo iniciado correctamente.';
        if ($noConfirmados->isNotEmpty()) {
            $nombres  = $noConfirmados->pluck('nombre')->join(', ');
            $mensaje .= " Los siguientes equipos fueron retirados por no estar confirmados: {$nombres}.";
        }

        return response()->json([
            'message' => $mensaje,
            'torneo'  => $torneo->fresh()->load('equipos', 'partidos.equipo1', 'partidos.equipo2', 'partidos.ganadorEquipo'),
        ]);
    }

    private function generarBracketEliminacionSimple(Torneo $torneo, \Illuminate\Support\Collection $equipos): void
    {
        $n = $equipos->count();
        if ($n < 2) return;

        // Siguiente potencia de 2 >= N (para calcular slots con posibles byes)
        $slots = 1;
        while ($slots < $n) $slots *= 2;
        $rounds = (int) log($slots, 2);

        $order = $this->bracketOrder($slots);

        // Ronda 1: emparejar según semillas en orden de bracket
        for ($i = 0; $i < $slots / 2; $i++) {
            $seed1 = $order[$i * 2];
            $seed2 = $order[$i * 2 + 1];
            $eq1   = $seed1 <= $n ? $equipos->firstWhere('semilla', $seed1) : null;
            $eq2   = $seed2 <= $n ? $equipos->firstWhere('semilla', $seed2) : null;

            // Bye: si solo hay un equipo en el enfrentamiento, avanza automáticamente
            $esBye   = ($eq1 && !$eq2) || (!$eq1 && $eq2);
            $ganador = $esBye ? ($eq1 ?? $eq2) : null;

            Partido::create([
                'torneo_id'         => $torneo->id,
                'equipo1_id'        => $eq1?->id,
                'equipo2_id'        => $eq2?->id,
                'ganador_equipo_id' => $ganador?->id,
                'estado'            => $esBye ? 'finalizado' : 'pendiente',
                'ronda'             => 1,
                'programado_en'     => now()->addDay(),
            ]);
        }

        // Rondas siguientes: partidos vacíos (TBD), se rellenan conforme avancen equipos
        for ($round = 2; $round <= $rounds; $round++) {
            $count = $slots / (int) pow(2, $round);
            for ($i = 0; $i < $count; $i++) {
                Partido::create([
                    'torneo_id'     => $torneo->id,
                    'estado'        => 'pendiente',
                    'ronda'         => $round,
                    'programado_en' => now()->addDays($round),
                ]);
            }
        }
    }

    // Genera el orden estándar de bracket para N slots (N debe ser potencia de 2).
    // Ej: N=8 → [1,8,5,4,3,6,7,2] → emparejamientos: 1v8, 5v4, 3v6, 7v2
    private function bracketOrder(int $n): array
    {
        if ($n === 1) return [1];
        $half   = $this->bracketOrder(intdiv($n, 2));
        $result = [];
        foreach ($half as $seed) {
            $result[] = $seed;
            $result[] = $n + 1 - $seed;
        }
        return $result;
    }
}
