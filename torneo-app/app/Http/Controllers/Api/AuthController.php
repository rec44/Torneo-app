<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        ]);

        $usuario = Usuario::create([
            'nombre'    => $data['nombre'],
            'email'     => $data['email'],
            'contrasena'=> $data['contrasena'],
        ]);

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'     => 'required|email',
            'contrasena'=> 'required|string',
        ]);

        $usuario = Usuario::where('email', $data['email'])->first();

        if (! $usuario || ! Hash::check($data['contrasena'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $token = $usuario->createToken('api-token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
