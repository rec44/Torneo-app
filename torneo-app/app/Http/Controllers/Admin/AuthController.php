<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function authViaBearerToken(Request $request)
    {
        $raw = $request->input('token');

        if (! $raw) {
            return $this->accesoDenegado('No se proporcionó credencial de acceso.');
        }

        $accessToken = PersonalAccessToken::findToken($raw);

        if (! $accessToken) {
            return $this->accesoDenegado('La sesión no es válida o ha expirado. Inicia sesión de nuevo en la aplicación.');
        }

        $usuario = $accessToken->tokenable;

        if (! $usuario || $usuario->rol !== 'admin') {
            return $this->accesoDenegado('Tu cuenta no tiene permisos de administrador.');
        }

        Auth::login($usuario);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $url = (config('app.frontend_url') ?: 'http://localhost:5173') . '/login';

        return redirect()->away($url);
    }

    private function accesoDenegado(string $mensaje)
    {
        return response()->view('admin.acceso-denegado', ['mensaje' => $mensaje], 403);
    }
}
