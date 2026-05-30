<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return response()->view('admin.acceso-denegado', [
                'mensaje' => 'Accede al panel desde la aplicación principal con una cuenta de administrador.',
            ], 403);
        }

        if (Auth::user()->rol !== 'admin') {
            Auth::logout();
            return response()->view('admin.acceso-denegado', [
                'mensaje' => 'Tu cuenta no tiene permisos de administrador.',
            ], 403);
        }

        return $next($request);
    }
}
