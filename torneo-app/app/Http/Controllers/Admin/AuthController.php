<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check() && Auth::user()->rol === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'      => 'required|email',
            'contrasena' => 'required|string',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->contrasena], $request->boolean('recordar'))) {
            if (Auth::user()->rol !== 'admin') {
                Auth::logout();
                return back()->withErrors(['email' => 'Acceso restringido a administradores.']);
            }

            $request->session()->regenerate();
            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors(['email' => 'Credenciales incorrectas.'])->withInput($request->only('email'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    public function showRegister()
    {
        if (Auth::check() && Auth::user()->rol === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'nombre'     => 'required|string|max:255',
            'email'      => 'required|email|unique:usuarios,email',
            'contrasena' => 'required|string|min:8|confirmed',
        ]);

        Usuario::create([
            'nombre'     => $request->nombre,
            'email'      => $request->email,
            'contrasena' => $request->contrasena,
            'rol'        => 'user',
        ]);

        return redirect()->route('admin.login')->with('success', 'Cuenta creada. Ya puedes iniciar sesión.');
    }
}
