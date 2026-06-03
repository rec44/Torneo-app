<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'    => 'required|string|max:255',
            'email'     => 'required|email|unique:usuarios,email',
            'contrasena'=> 'required|string|min:8|confirmed',
        ], [
            'nombre.required'      => 'El nombre es obligatorio.',
            'nombre.max'           => 'El nombre no puede superar los 255 caracteres.',
            'email.required'       => 'El email es obligatorio.',
            'email.email'          => 'El email no tiene un formato válido.',
            'email.unique'         => 'Este email ya está registrado.',
            'contrasena.required'  => 'La contraseña es obligatoria.',
            'contrasena.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $usuario = Usuario::create([
            'nombre'    => $data['nombre'],
            'email'     => $data['email'],
            'contrasena'=> $data['contrasena'],
        ]);

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'     => 'required|email',
            'contrasena'=> 'required|string',
        ], [
            'email.required'      => 'El email es obligatorio.',
            'email.email'         => 'El email no tiene un formato válido.',
            'contrasena.required' => 'La contraseña es obligatoria.',
        ]);

        $usuario = Usuario::withTrashed()->where('email', $data['email'])->first();

        if ($usuario && $usuario->trashed()) {
            return response()->json(['message' => 'Tu cuenta ha sido baneada.'], 403);
        }

        if (! $usuario || ! Hash::check($data['contrasena'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): JsonResponse|JsonResource
    {
        return new UsuarioResource($request->user());
    }
}
