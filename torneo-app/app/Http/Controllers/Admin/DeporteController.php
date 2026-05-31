<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deporte;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeporteController extends Controller
{
    public function index()
    {
        $deportes = Deporte::withCount('torneos')->orderBy('nombre')->paginate(15);
        return view('admin.deportes.index', compact('deportes'));
    }

    public function create()
    {
        return view('admin.deportes.create');
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                'nombre' => [
                    'required', 'string', 'max:100',
                    Rule::unique('deportes', 'nombre')->whereNull('deleted_at'),
                ],
            ],
            [
                'nombre.required' => 'El nombre del deporte es obligatorio.',
                'nombre.max'      => 'El nombre no puede superar los 100 caracteres.',
                'nombre.unique'   => 'Ya existe un deporte con ese nombre.',
            ]
        );

        $trashed = Deporte::onlyTrashed()->where('nombre', $request->nombre)->first();

        if ($trashed) {
            $trashed->restore();
            return redirect()->route('admin.deportes.index')
                ->with('success', "Deporte \"{$request->nombre}\" restaurado correctamente.");
        }

        Deporte::create($request->only('nombre'));

        return redirect()->route('admin.deportes.index')->with('success', 'Deporte creado correctamente.');
    }

    public function edit(Deporte $deporte)
    {
        return view('admin.deportes.edit', compact('deporte'));
    }

    public function update(Request $request, Deporte $deporte)
    {
        $request->validate(
            ['nombre' => 'required|string|max:100|unique:deportes,nombre,' . $deporte->id],
            [
                'nombre.required' => 'El nombre del deporte es obligatorio.',
                'nombre.max'      => 'El nombre no puede superar los 100 caracteres.',
                'nombre.unique'   => 'Ya existe un deporte con ese nombre.',
            ]
        );

        $deporte->update($request->only('nombre'));

        return redirect()->route('admin.deportes.index')->with('success', 'Deporte actualizado correctamente.');
    }

    public function destroy(Deporte $deporte)
    {
        $deporte->delete();
        return redirect()->route('admin.deportes.index')->with('success', 'Deporte eliminado correctamente.');
    }
}
