<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUsuarioRequest;
use App\Http\Requests\Admin\UpdateUsuarioRequest;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = Usuario::withTrashed()->orderBy('nombre')->paginate(20);
        return view('admin.usuarios.index', compact('usuarios'));
    }

    public function create()
    {
        return view('admin.usuarios.create');
    }

    public function store(StoreUsuarioRequest $request)
    {
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

    public function update(UpdateUsuarioRequest $request, Usuario $usuario)
    {
        $data = $request->only(['nombre', 'email', 'elo', 'rol']);

        if ($request->filled('contrasena')) {
            $data['contrasena'] = $request->contrasena;
        }

        $usuario->update($data);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->tokens()->delete();
        $usuario->delete();
        return redirect()->route('admin.usuarios.index')->with('success', "Usuario \"{$usuario->nombre}\" baneado correctamente.");
    }

    public function desbanear(int $id)
    {
        $usuario = Usuario::withTrashed()->findOrFail($id);
        $usuario->restore();
        return redirect()->route('admin.usuarios.index')->with('success', "Usuario \"{$usuario->nombre}\" desbaneado correctamente.");
    }
}
