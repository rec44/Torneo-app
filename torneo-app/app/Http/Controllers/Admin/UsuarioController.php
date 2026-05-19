<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = Usuario::orderBy('nombre')->paginate(20);
        return view('admin.usuarios.index', compact('usuarios'));
    }

    public function create()
    {
        return view('admin.usuarios.create');
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                'nombre'     => 'required|string|max:255',
                'email'      => 'required|email|unique:usuarios,email',
                'contrasena' => 'required|string|min:8|confirmed',
                'elo'        => 'nullable|integer|min:0',
                'rol'        => 'required|in:user,admin',
            ],
            [
                'nombre.required'      => 'El nombre del usuario es obligatorio.',
                'nombre.max'           => 'El nombre no puede superar los 255 caracteres.',
                'email.required'       => 'El email es obligatorio.',
                'email.email'          => 'El email no tiene un formato válido.',
                'email.unique'         => 'Ya existe un usuario registrado con ese email.',
                'contrasena.required'  => 'La contraseña es obligatoria.',
                'contrasena.min'       => 'La contraseña debe tener al menos 8 caracteres.',
                'contrasena.confirmed' => 'Las contraseñas no coinciden.',
                'elo.integer'          => 'El ELO debe ser un número entero.',
                'elo.min'              => 'El ELO no puede ser negativo.',
                'rol.required'         => 'El rol es obligatorio.',
                'rol.in'               => 'El rol debe ser "usuario" o "administrador".',
            ]
        );

        Usuario::create([
            'nombre'     => $request->nombre,
            'email'      => $request->email,
            'contrasena' => $request->contrasena,
            'elo'        => $request->elo ?? 500,
            'rol'        => $request->rol,
        ]);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuario creado correctamente.');
    }

    public function edit(Usuario $usuario)
    {
        return view('admin.usuarios.edit', compact('usuario'));
    }

    public function update(Request $request, Usuario $usuario)
    {
        $request->validate(
            [
                'nombre'     => 'required|string|max:255',
                'email'      => 'required|email|unique:usuarios,email,' . $usuario->id,
                'contrasena' => 'nullable|string|min:8|confirmed',
                'elo'        => 'nullable|integer|min:0',
                'rol'        => 'required|in:user,admin',
            ],
            [
                'nombre.required'      => 'El nombre del usuario es obligatorio.',
                'nombre.max'           => 'El nombre no puede superar los 255 caracteres.',
                'email.required'       => 'El email es obligatorio.',
                'email.email'          => 'El email no tiene un formato válido.',
                'email.unique'         => 'Ya existe un usuario registrado con ese email.',
                'contrasena.min'       => 'La contraseña debe tener al menos 8 caracteres.',
                'contrasena.confirmed' => 'Las contraseñas no coinciden.',
                'elo.integer'          => 'El ELO debe ser un número entero.',
                'elo.min'              => 'El ELO no puede ser negativo.',
                'rol.required'         => 'El rol es obligatorio.',
                'rol.in'               => 'El rol debe ser "usuario" o "administrador".',
            ]
        );

        $data = $request->only(['nombre', 'email', 'elo', 'rol']);

        if ($request->filled('contrasena')) {
            $data['contrasena'] = $request->contrasena;
        }

        $usuario->update($data);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return redirect()->route('admin.usuarios.index')->with('success', 'Usuario eliminado correctamente.');
    }
}
