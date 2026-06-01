<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CrearInvitacionRequest;
use App\Http\Requests\StoreEquipoRequest;
use App\Http\Requests\UnirsePorCodigoRequest;
use App\Models\Equipo;
use App\Models\InvitacionTorneo;
use App\Models\Torneo;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EquipoController extends Controller
{
    public function index(Torneo $torneo): JsonResponse
    {
        $equipos = $torneo->equipos()
            ->with('capitan:id,nombre', 'miembros:id,nombre,elo')
            ->withCount('miembros')
            ->get();

        return response()->json($equipos);
    }

    public function store(StoreEquipoRequest $request, Torneo $torneo): JsonResponse
    {
        $usuario     = $request->user();
        $esDueno     = $usuario->id === $torneo->creado_por || $usuario->rol === 'admin';

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está abierto para inscripciones.'], 422);
        }

        $equiposBloqueados = $torneo->equipos()->where('bloqueado', true)->count();

        if ($equiposBloqueados >= $torneo->max_jugadores) {
            return response()->json(['message' => 'El torneo ya tiene el máximo de equipos confirmados. No se pueden añadir más.'], 422);
        }

        $yaEnEquipo = Equipo::where('torneo_id', $torneo->id)
            ->whereHas('miembros', fn($q) => $q->where('usuario_id', $usuario->id))
            ->exists();

        if (! $esDueno && $yaEnEquipo) {
            return response()->json(['message' => 'Ya estás en un equipo de este torneo.'], 422);
        }

        $equipo = Equipo::create([
            'torneo_id'  => $torneo->id,
            'nombre'     => $request->validated()['nombre'],
            'capitan_id' => $usuario->id,
        ]);

        // Se une como capitán si todavía no pertenece a ningún equipo del torneo
        if (! $yaEnEquipo) {
            $elo = $this->eloEfectivo($usuario, $torneo);

            if (! $esDueno) {
                if ($msg = $this->mensajeEloInvalido($elo, $torneo)) {
                    $equipo->delete();
                    return response()->json(['message' => $msg], 422);
                }
            }

            $equipo->miembros()->attach($usuario->id, ['elo_al_unirse' => $elo]);
        }

        return response()->json(
            $equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo'),
            201
        );
    }

    public function show(Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo');

        return response()->json($equipo);
    }

    public function destroy(Request $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno   = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($esCapitan && ! $esDueno && $torneo->estado !== 'abierto') {
            return response()->json(['message' => 'Solo puedes retirar tu equipo mientras el torneo esté abierto.'], 422);
        }

        $equipo->delete();

        return response()->json(null, 204);
    }

    public function update(Request $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno  = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre' => 'required|string|max:100',
        ]);

        $equipo->update($data);

        return response()->json($equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo'));
    }

    public function unirse(Request $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        $usuario = $request->user();

        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está abierto.'], 422);
        }

        if ($equipo->bloqueado) {
            return response()->json(['message' => 'El equipo está bloqueado y no acepta nuevos miembros.'], 422);
        }

        $yaEnEquipo = Equipo::where('torneo_id', $torneo->id)
            ->whereHas('miembros', fn($q) => $q->where('usuario_id', $usuario->id))
            ->exists();

        if ($yaEnEquipo) {
            return response()->json(['message' => 'Ya estás en un equipo de este torneo.'], 422);
        }

        $numMiembros = $equipo->miembros()->count();

        if ($torneo->max_miembros && $numMiembros >= $torneo->max_miembros) {
            return response()->json(['message' => 'El equipo ya tiene el número máximo de miembros.'], 422);
        }

        $elo = $this->eloEfectivo($usuario, $torneo);

        if ($msg = $this->mensajeEloInvalido($elo, $torneo)) {
            return response()->json(['message' => $msg], 422);
        }

        $equipo->miembros()->attach($usuario->id, ['elo_al_unirse' => $elo]);

        if ($torneo->max_miembros && ($numMiembros + 1) >= $torneo->max_miembros) {
            $equipo->update(['bloqueado' => true, 'inscrito' => true]);
        }

        return response()->json(['message' => 'Te has unido al equipo correctamente.']);
    }

    public function infoInvitacion(string $codigo): JsonResponse
    {
        $invitacion = InvitacionTorneo::with([
            'torneo:id,nombre,estado,deporte_id',
            'torneo.deporte:id,nombre',
            'equipo:id,nombre,torneo_id',
            'equipo.miembros:id',
        ])->where('codigo', strtoupper($codigo))->first();

        if (! $invitacion) {
            return response()->json(['message' => 'Invitación no encontrada.'], 404);
        }

        return response()->json([
            'codigo'  => $invitacion->codigo,
            'vigente' => $invitacion->estaVigente(),
            'torneo'  => $invitacion->torneo,
            'equipo'  => [
                'id'             => $invitacion->equipo->id,
                'nombre'         => $invitacion->equipo->nombre,
                'miembros_count' => $invitacion->equipo->miembros->count(),
            ],
        ]);
    }

    public function mostrarInvitacion(Request $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno   = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $invitacion = InvitacionTorneo::where('torneo_id', $torneo->id)
            ->where('equipo_id', $equipo->id)
            ->get()
            ->first(fn($inv) => $inv->estaVigente());

        if (! $invitacion) {
            return response()->json(null, 204);
        }

        return response()->json($invitacion);
    }

    public function crearInvitacion(CrearInvitacionRequest $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno   = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validated();

        $invitacion = InvitacionTorneo::create([
            'torneo_id' => $torneo->id,
            'equipo_id' => $equipo->id,
            'codigo'    => strtoupper(Str::random(8)),
            'max_usos'  => $data['max_usos'] ?? null,
            'expira_en' => $data['expira_en'] ?? null,
        ]);

        return response()->json($invitacion, 201);
    }

    public function expulsarMiembro(Request $request, Torneo $torneo, Equipo $equipo, Usuario $miembro): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno   = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($miembro->id === $equipo->capitan_id) {
            return response()->json(['message' => 'No puedes expulsar al capitán. Usa "Retirar equipo" para disolver el equipo.'], 422);
        }

        $equipo->miembros()->detach($miembro->id);

        return response()->json(
            $equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo')
        );
    }

    public function toggleLock(Request $request, Torneo $torneo, Equipo $equipo): JsonResponse
    {
        if ($equipo->torneo_id !== $torneo->id) {
            return response()->json(['message' => 'El equipo no pertenece a este torneo.'], 404);
        }

        $esDueno   = $request->user()->id === $torneo->creado_por || $request->user()->rol === 'admin';
        $esCapitan = $request->user()->id === $equipo->capitan_id;

        if (! $esDueno && ! $esCapitan) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $bloqueando = ! $equipo->bloqueado;

        if ($bloqueando) {
            $numMiembros = $equipo->miembros()->count();
            $minMiembros = $torneo->min_miembros;

            if ($minMiembros && $numMiembros < $minMiembros) {
                return response()->json([
                    'message' => "El equipo necesita al menos {$minMiembros} miembro(s) para bloquearse. Actualmente tiene {$numMiembros}.",
                ], 422);
            }

            $equipo->update(['bloqueado' => true, 'inscrito' => true]);
        } else {
            $equipo->update(['bloqueado' => false]);
        }

        return response()->json($equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo'));
    }

    public function unirsePorCodigo(UnirsePorCodigoRequest $request): JsonResponse
    {
        $data = $request->validated();

        $invitacion = InvitacionTorneo::with('torneo', 'equipo')
            ->where('codigo', strtoupper($data['codigo']))
            ->first();

        if (! $invitacion || ! $invitacion->estaVigente()) {
            return response()->json(['message' => 'Código de invitación inválido o expirado.'], 422);
        }

        $torneo  = $invitacion->torneo;
        $equipo  = $invitacion->equipo;
        $usuario = $request->user();

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo ya no está abierto.'], 422);
        }

        if ($equipo->bloqueado) {
            return response()->json(['message' => 'El equipo está bloqueado y no acepta nuevos miembros.'], 422);
        }

        $yaEnEquipo = Equipo::where('torneo_id', $torneo->id)
            ->whereHas('miembros', fn($q) => $q->where('usuario_id', $usuario->id))
            ->exists();

        if ($yaEnEquipo) {
            return response()->json(['message' => 'Ya estás en un equipo de este torneo.'], 422);
        }

        $numMiembros = $equipo->miembros()->count();

        if ($torneo->max_miembros && $numMiembros >= $torneo->max_miembros) {
            return response()->json(['message' => 'El equipo ya tiene el número máximo de miembros.'], 422);
        }

        $elo = $this->eloEfectivo($usuario, $torneo);

        if ($msg = $this->mensajeEloInvalido($elo, $torneo)) {
            return response()->json(['message' => $msg], 422);
        }

        $equipo->miembros()->attach($usuario->id, ['elo_al_unirse' => $elo]);
        $invitacion->increment('usos_actuales');

        if ($torneo->max_miembros && ($numMiembros + 1) >= $torneo->max_miembros) {
            $equipo->update(['bloqueado' => true, 'inscrito' => true]);
        }

        return response()->json([
            'message' => 'Te has unido al equipo mediante invitación.',
            'equipo'  => $equipo->load('capitan:id,nombre', 'miembros:id,nombre,elo'),
        ]);
    }

    // Devuelve el ELO del usuario específico para el deporte del torneo.
    // Si no tiene historial en ese deporte, usa el ELO global.
    private function eloEfectivo(Usuario $usuario, Torneo $torneo): int
    {
        $eloDeporte = DB::table('elo_usuario_deporte')
            ->where('usuario_id', $usuario->id)
            ->where('deporte_id', $torneo->deporte_id)
            ->value('elo');

        return $eloDeporte ?? 500;
    }

    private function mensajeEloInvalido(int $elo, Torneo $torneo): ?string
    {
        if ($torneo->elo_minimo !== null && $elo < $torneo->elo_minimo) {
            return "Tu ELO en este deporte ({$elo}) es inferior al mínimo requerido ({$torneo->elo_minimo}).";
        }

        if ($torneo->elo_maximo !== null && $elo > $torneo->elo_maximo) {
            return "Tu ELO en este deporte ({$elo}) supera el máximo permitido ({$torneo->elo_maximo}).";
        }

        return null;
    }
}
