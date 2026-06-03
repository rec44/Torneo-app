<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TorneoResource;
use App\Http\Resources\UsuarioPerfilResource;
use App\Http\Resources\UsuarioResource;
use App\Models\Partido;
use App\Models\Torneo;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        $usuarios = Usuario::select('id', 'nombre', 'email', 'elo', 'rol', 'created_at')->paginate(20);

        return UsuarioResource::collection($usuarios)->response();
    }

    public function show(Usuario $usuario): JsonResponse|JsonResource
    {
        $usuario->load('elosDeporte.deporte');

        $relacionTorneos = fn ($q) => $q
            ->with(['deporte', 'creadoPor:id,nombre'])
            ->withCount(['equipos as equipos_count' => fn ($q) => $q->where('bloqueado', true)]);

        $torneosCreados = Torneo::where('creado_por', $usuario->id)
            ->tap($relacionTorneos)
            ->get();

        $torneosInscritos = Torneo::whereHas('equipos', fn ($q) =>
            $q->whereHas('miembros', fn ($q2) => $q2->where('usuarios.id', $usuario->id))
        )->tap($relacionTorneos)->get();

        $torneosGanados = Partido::where('estado', 'finalizado')
            ->whereNotNull('ganador_equipo_id')
            ->whereHas('ganadorEquipo', fn ($q) => $q->where('capitan_id', $usuario->id))
            ->whereHas('torneo', fn ($q) => $q->where('estado', 'finalizado'))
            ->select('torneo_id')
            ->distinct()
            ->count();

        return new UsuarioPerfilResource($usuario, [
            'elosDeporte'       => \App\Http\Resources\EloDeporteResource::collection($usuario->getRelation('elosDeporte')),
            'torneos_creados'   => TorneoResource::collection($torneosCreados),
            'torneos_inscritos' => TorneoResource::collection($torneosInscritos),
            'torneos_ganados'   => $torneosGanados,
        ]);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse|JsonResource
    {
        if ($request->user()->id !== $usuario->id && $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'nombre'     => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:usuarios,email,' . $usuario->id,
            'contrasena' => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($data['contrasena'])) {
            $data['contrasena'] = bcrypt($data['contrasena']);
        }

        $usuario->update($data);

        return new UsuarioResource($usuario->fresh());
    }

    public function destroy(Request $request, Usuario $usuario): JsonResponse
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($usuario->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes banearte a ti mismo.'], 422);
        }

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(['message' => 'Usuario baneado correctamente.']);
    }

    public function desbanear(Request $request, int $id): JsonResponse
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $usuario = Usuario::withTrashed()->findOrFail($id);

        if (! $usuario->trashed()) {
            return response()->json(['message' => 'El usuario no está baneado.'], 422);
        }

        $usuario->restore();

        return response()->json([
            'message' => 'Usuario desbaneado correctamente.',
            'usuario' => new UsuarioResource($usuario),
        ]);
    }
}
