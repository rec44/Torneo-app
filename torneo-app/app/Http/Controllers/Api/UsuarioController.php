<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Usuario::select('id', 'nombre', 'email', 'elo', 'rol', 'created_at')->paginate(20));
    }

    public function show(Usuario $usuario): JsonResponse
    {
        $usuario->load('elosDeporte.deporte', 'torneosCreados');
        return response()->json($usuario);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
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

        return response()->json($usuario->fresh());
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

        return response()->json(['message' => 'Usuario desbaneado correctamente.', 'usuario' => $usuario]);
    }
}
