<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IniciarTorneoRequest;
use App\Http\Requests\StoreTorneoRequest;
use App\Http\Requests\UpdateTorneoRequest;
use App\Http\Resources\TorneoResource;
use App\Mail\CalendarioConfirmado;
// use App\Mail\TorneoIniciado;
// use App\Mail\TorneoFinalizado;
use App\Models\Partido;
use App\Models\Torneo;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class TorneoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $torneos = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount(['equipos as equipos_count' => fn ($q) => $q->where('bloqueado', true)])
            ->when(
                $request->filled('estado'),
                fn ($q) => $q->where('estado', $request->estado),
                fn ($q) => $q->where('estado', '!=', 'finalizado')
            )
            ->when($request->deporte_id,  fn ($q, $v) => $q->where('deporte_id', $v))
            ->when($request->fecha_desde, fn ($q, $v) => $q->whereDate('fecha_inicio', '>=', $v))
            ->when($request->fecha_hasta, fn ($q, $v) => $q->whereDate('fecha_inicio', '<=', $v))
            ->when($request->elo_min,     fn ($q, $v) => $q->where('elo_minimo', '>=', $v))
            ->when($request->elo_max,     fn ($q, $v) => $q->where('elo_maximo', '<=', $v))
            ->orderBy('fecha_inicio', 'asc')
            ->paginate(9);

        return TorneoResource::collection($torneos)->response();
    }

    public function store(StoreTorneoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['creado_por'] = $request->user()->id;

        $torneo = Torneo::create($data);

        return (new TorneoResource($torneo->load('deporte')))->response()->setStatusCode(201);
    }

    public function show(Torneo $torneo): JsonResponse|JsonResource
    {
        $torneo->load([
            'deporte',
            'creadoPor:id,nombre',
            'equipos.capitan:id,nombre',
            'equipos.miembros:id,nombre,elo',
            'partidos.equipo1:id,nombre,escudo',
            'partidos.equipo2:id,nombre,escudo',
            'partidos.ganadorEquipo:id,nombre,escudo',
            'partidos.historialElo:id,partido_id,usuario_id,elo_antes,elo_despues,delta',
        ]);

        return new TorneoResource($torneo);
    }

    public function update(UpdateTorneoRequest $request, Torneo $torneo): JsonResponse|JsonResource
    {
        $this->authorize('update', $torneo);

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'Solo se puede editar un torneo abierto.'], 422);
        }

        $torneo->update($request->validated());

        return new TorneoResource($torneo->fresh());
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
            ->withCount(['equipos as equipos_count' => fn ($q) => $q->where('bloqueado', true)])
            ->where('creado_por', $usuario->id)
            ->get();

        $inscrito = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount(['equipos as equipos_count' => fn ($q) => $q->where('bloqueado', true)])
            ->whereHas('equipos.miembros', fn ($q) => $q->where('usuarios.id', $usuario->id))
            ->get();

        return response()->json([
            'creados'  => TorneoResource::collection($creados),
            'inscrito' => TorneoResource::collection($inscrito),
        ]);
    }

    public function iniciar(Request $request, Torneo $torneo): JsonResponse
    {
        $this->authorize('iniciar', $torneo);

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está en estado abierto.'], 422);
        }

        $todosEquipos  = $torneo->equipos()->get();
        $confirmados   = $todosEquipos->filter(fn ($e) => $e->bloqueado);
        $noConfirmados = $todosEquipos->filter(fn ($e) => ! $e->bloqueado);

        $minEquipos = (int) floor($torneo->max_jugadores / 2) + 1;

        if ($confirmados->count() < $minEquipos) {
            return response()->json([
                'message' => "Se necesitan al menos {$minEquipos} equipos confirmados para iniciar (más de la mitad de {$torneo->max_jugadores}). Ahora hay {$confirmados->count()}.",
            ], 422);
        }

        foreach ($noConfirmados as $equipo) {
            $equipo->delete();
        }

        $confirmados->shuffle()->values()->each(function ($equipo, $index) {
            $equipo->update(['semilla' => $index + 1]);
        });

        // Resnapshotar el ELO de cada participante con su valor actual al arrancar el torneo
        $confirmados->load('miembros');
        foreach ($confirmados as $equipo) {
            foreach ($equipo->miembros as $miembro) {
                $equipo->miembros()->updateExistingPivot($miembro->id, ['elo_al_unirse' => $miembro->elo]);
            }
        }

        $torneo->update(['estado' => 'programacion']);

        if ($torneo->formato === 'eliminacion_simple') {
            $this->generarBracketEliminacionSimple($torneo, $confirmados->values());
        }

        // Mail::to(...)->queue(new TorneoIniciado(...)); // TODO: activar cuando tengamos el template

        $mensaje = 'Bracket generado. Asigna fechas a los partidos en la pestaña Calendario y confirma el inicio.';
        if ($noConfirmados->isNotEmpty()) {
            $nombres  = $noConfirmados->pluck('nombre')->join(', ');
            $mensaje .= " Los siguientes equipos fueron retirados por no estar confirmados: {$nombres}.";
        }

        return response()->json([
            'message' => $mensaje,
            'torneo'  => new TorneoResource(
                $torneo->fresh()->load('equipos', 'partidos.equipo1', 'partidos.equipo2', 'partidos.ganadorEquipo')
            ),
        ]);
    }

    public function confirmar(Torneo $torneo): JsonResponse
    {
        $this->authorize('iniciar', $torneo);

        if ($torneo->estado !== 'programacion') {
            return response()->json(['message' => 'El torneo no está en fase de programación.'], 422);
        }

        $sinFecha = $torneo->partidos()
            ->whereNull('programado_en')
            ->where('estado', '!=', 'finalizado')
            ->count();

        if ($sinFecha > 0) {
            return response()->json([
                'message' => "Faltan fechas en {$sinFecha} partido(s). Asigna fecha y hora a todos antes de confirmar.",
            ], 422);
        }

        $torneo->update(['estado' => 'en_curso']);

        $torneoConDatos = $torneo->fresh()->load('deporte', 'partidos.equipo1', 'partidos.equipo2');
        $participantes  = $this->participantes($torneo);

        foreach ($participantes as $i => $participante) {
            Mail::to($participante->email)
                ->later(now()->addSeconds($i * 12), new CalendarioConfirmado($torneoConDatos, $participante->nombre));
        }

        return response()->json([
            'message' => 'Torneo en curso.',
            'torneo'  => new TorneoResource(
                $torneo->fresh()->load('equipos', 'partidos.equipo1', 'partidos.equipo2', 'partidos.ganadorEquipo')
            ),
        ]);
    }

    private function generarBracketEliminacionSimple(Torneo $torneo, \Illuminate\Support\Collection $equipos): void
    {
        $n = $equipos->count();
        if ($n < 2) return;

        $slots = 1;
        while ($slots < $n) $slots *= 2;
        $rounds = (int) log($slots, 2);

        $order = $this->bracketOrder($slots);

        for ($i = 0; $i < $slots / 2; $i++) {
            $seed1 = $order[$i * 2];
            $seed2 = $order[$i * 2 + 1];
            $eq1   = $seed1 <= $n ? $equipos->firstWhere('semilla', $seed1) : null;
            $eq2   = $seed2 <= $n ? $equipos->firstWhere('semilla', $seed2) : null;

            $esBye   = ($eq1 && !$eq2) || (!$eq1 && $eq2);
            $ganador = $esBye ? ($eq1 ?? $eq2) : null;

            Partido::create([
                'torneo_id'         => $torneo->id,
                'equipo1_id'        => $eq1?->id,
                'equipo2_id'        => $eq2?->id,
                'ganador_equipo_id' => $ganador?->id,
                'estado'            => $esBye ? 'finalizado' : 'pendiente',
                'ronda'             => 1,
                'programado_en'     => null,
            ]);
        }

        for ($round = 2; $round <= $rounds; $round++) {
            $count = $slots / (int) pow(2, $round);
            for ($i = 0; $i < $count; $i++) {
                Partido::create([
                    'torneo_id'     => $torneo->id,
                    'estado'        => 'pendiente',
                    'ronda'         => $round,
                    'programado_en' => null,
                ]);
            }
        }

        $idsRonda1 = Partido::where('torneo_id', $torneo->id)
            ->where('ronda', 1)
            ->orderBy('id')
            ->pluck('id');

        $byes = Partido::where('torneo_id', $torneo->id)
            ->where('ronda', 1)
            ->where('estado', 'finalizado')
            ->get();

        foreach ($byes as $bye) {
            $posicion  = $idsRonda1->search($bye->id);
            if ($posicion === false) continue;

            $siguiente = Partido::where('torneo_id', $torneo->id)
                ->where('ronda', 2)
                ->orderBy('id')
                ->skip(intdiv($posicion, 2))
                ->first();

            if (! $siguiente) continue;

            $siguiente->update($posicion % 2 === 0
                ? ['equipo1_id' => $bye->ganador_equipo_id]
                : ['equipo2_id' => $bye->ganador_equipo_id]
            );
        }
    }

    private function participantes(Torneo $torneo)
    {
        return DB::table('usuarios')
            ->join('equipo_usuarios', 'usuarios.id', '=', 'equipo_usuarios.usuario_id')
            ->join('equipos', 'equipo_usuarios.equipo_id', '=', 'equipos.id')
            ->where('equipos.torneo_id', $torneo->id)
            ->select('usuarios.id', 'usuarios.email', 'usuarios.nombre')
            ->distinct()
            ->get();
    }

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
