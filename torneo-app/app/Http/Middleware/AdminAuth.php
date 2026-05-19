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
            return redirect()->route('admin.login');
        }

        if (Auth::user()->rol !== 'admin') {
            Auth::logout();
            return redirect()->route('admin.login')->withErrors(['email' => 'Acceso restringido a administradores.']);
        }

        return $next($request);
    }
}
