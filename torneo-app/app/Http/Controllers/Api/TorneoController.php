<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CrearInvitacionRequest;
use App\Http\Requests\StoreTorneoRequest;
use App\Http\Requests\UnirsePorCodigoRequest;
use App\Http\Requests\UpdateTorneoRequest;
use App\Models\InvitacionTorneo;
use App\Models\Torneo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TorneoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $torneos = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->when($request->estado, fn($q, $v) => $q->where('estado', $v))
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
        $torneo->load('deporte', 'creadoPor:id,nombre', 'jugadores:id,nombre,elo', 'partidos');
        return response()->json($torneo);
    }

    public function update(UpdateTorneoRequest $request, Torneo $torneo): JsonResponse
    {
        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'Solo se puede editar un torneo abierto.'], 422);
        }

        $data = $request->validated();

        $torneo->update($data);

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

    public function unirse(Request $request, Torneo $torneo): JsonResponse
    {
        $usuario = $request->user();

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está abierto para inscripciones.'], 422);
        }

        if ($torneo->jugadores()->where('usuario_id', $usuario->id)->exists()) {
            return response()->json(['message' => 'Ya estás inscrito en este torneo.'], 422);
        }

        if ($torneo->jugadores()->count() >= $torneo->max_jugadores) {
            return response()->json(['message' => 'El torneo está lleno.'], 422);
        }

        $eloUsuario = $usuario->elo;
        if ($torneo->elo_minimo && $eloUsuario < $torneo->elo_minimo) {
            return response()->json(['message' => 'Tu ELO es insuficiente para este torneo.'], 422);
        }
        if ($torneo->elo_maximo && $eloUsuario > $torneo->elo_maximo) {
            return response()->json(['message' => 'Tu ELO supera el máximo de este torneo.'], 422);
        }

        $torneo->jugadores()->attach($usuario->id, ['elo_al_unirse' => $eloUsuario]);

        return response()->json(['message' => 'Inscrito correctamente en el torneo.']);
    }

    public function iniciar(Request $request, Torneo $torneo): JsonResponse
    {
        if ($request->user()->id !== $torneo->creado_por && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($torneo->estado !== 'abierto') {
            return response()->json(['message' => 'El torneo no está en estado abierto.'], 422);
        }

        $torneo->update(['estado' => 'en_curso']);

        return response()->json(['message' => 'Torneo iniciado correctamente.', 'torneo' => $torneo->fresh()]);
    }

    public function crearInvitacion(CrearInvitacionRequest $request, Torneo $torneo): JsonResponse
    {
        $data = $request->validated();

        $invitacion = InvitacionTorneo::create([
            'torneo_id'  => $torneo->id,
            'codigo'     => strtoupper(Str::random(8)),
            'max_usos'   => $data['max_usos'] ?? null,
            'expira_en'  => $data['expira_en'] ?? null,
        ]);

        return response()->json($invitacion, 201);
    }

    public function unirsePorCodigo(UnirsePorCodigoRequest $request): JsonResponse
    {
        $data = $request->validated();

        $invitacion = InvitacionTorneo::where('codigo', strtoupper($data['codigo']))->first();

        if (! $invitacion || ! $invitacion->estaVigente()) {
            return response()->json(['message' => 'Código de invitación inválido o expirado.'], 422);
        }

        $torneo = $invitacion->torneo;
        $usuario = $request->user();

        if ($torneo->jugadores()->where('usuario_id', $usuario->id)->exists()) {
            return response()->json(['message' => 'Ya estás inscrito en este torneo.'], 422);
        }

        if ($torneo->jugadores()->count() >= $torneo->max_jugadores) {
            return response()->json(['message' => 'El torneo está lleno.'], 422);
        }

        $torneo->jugadores()->attach($usuario->id, ['elo_al_unirse' => $usuario->elo]);
        $invitacion->increment('usos_actuales');

        return response()->json(['message' => 'Te has unido al torneo mediante invitación.', 'torneo' => $torneo]);
    }
}
