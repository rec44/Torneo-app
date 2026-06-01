<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDeporteRequest;
use App\Http\Requests\Admin\UpdateDeporteRequest;
use App\Models\Deporte;

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

    public function store(StoreDeporteRequest $request)
    {
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

    public function update(UpdateDeporteRequest $request, Deporte $deporte)
    {
        $deporte->update($request->only('nombre'));

        return redirect()->route('admin.deportes.index')->with('success', 'Deporte actualizado correctamente.');
    }

    public function destroy(Deporte $deporte)
    {
        $deporte->delete();
        return redirect()->route('admin.deportes.index')->with('success', 'Deporte eliminado correctamente.');
    }
}
