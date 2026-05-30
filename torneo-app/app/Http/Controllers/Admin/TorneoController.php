<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deporte;
use App\Models\Torneo;
use App\Models\Usuario;
use Illuminate\Http\Request;

class TorneoController extends Controller
{
    private array $formatos = [
        'eliminacion_simple' => 'Eliminación simple',
        'eliminacion_doble'  => 'Eliminación doble',
        'round_robin'        => 'Round Robin',
        'suizo'              => 'Sistema Suizo',
    ];

    private array $estados = [
        'abierto'    => 'Abierto',
        'en_curso'   => 'En curso',
        'finalizado' => 'Finalizado',
        'cancelado'  => 'Cancelado',
    ];

    public function index()
    {
        $torneos = Torneo::with('deporte', 'creadoPor:id,nombre')
            ->withCount('equipos')
            ->orderByDesc('created_at')
            ->paginate(15);

        return view('admin.torneos.index', compact('torneos'));
    }

    public function create()
    {
        return view('admin.torneos.create', [
            'deportes' => Deporte::orderBy('nombre')->get(),
            'usuarios' => Usuario::orderBy('nombre')->get(),
            'formatos' => $this->formatos,
            'estados'  => $this->estados,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->reglasValidacion(), $this->mensajesValidacion());

        Torneo::create($request->only([
            'nombre', 'deporte_id', 'creado_por', 'elo_minimo', 'elo_maximo',
            'max_jugadores', 'fecha_inicio', 'fecha_fin', 'formato', 'estado',
        ]));

        return redirect()->route('admin.torneos.index')->with('success', 'Torneo creado correctamente.');
    }

    public function edit(Torneo $torneo)
    {
        return view('admin.torneos.edit', [
            'torneo'   => $torneo,
            'deportes' => Deporte::orderBy('nombre')->get(),
            'usuarios' => Usuario::orderBy('nombre')->get(),
            'formatos' => $this->formatos,
            'estados'  => $this->estados,
        ]);
    }

    public function update(Request $request, Torneo $torneo)
    {
        $request->validate($this->reglasValidacion(), $this->mensajesValidacion());

        $torneo->update($request->only([
            'nombre', 'deporte_id', 'creado_por', 'elo_minimo', 'elo_maximo',
            'max_jugadores', 'fecha_inicio', 'fecha_fin', 'formato', 'estado',
        ]));

        return redirect()->route('admin.torneos.index')->with('success', 'Torneo actualizado correctamente.');
    }

    private function reglasValidacion(): array
    {
        return [
            'nombre'        => 'required|string|max:255',
            'deporte_id'    => 'required|exists:deportes,id',
            'creado_por'    => 'required|exists:usuarios,id',
            'elo_minimo'    => 'nullable|integer|min:0',
            'elo_maximo'    => 'nullable|integer|min:0|gte:elo_minimo',
            'max_jugadores' => 'required|integer|in:4,8,16,32,64',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'formato'       => 'required|in:eliminacion_simple,eliminacion_doble,round_robin,suizo',
            'estado'        => 'required|in:abierto,en_curso,finalizado,cancelado',
        ];
    }

    private function mensajesValidacion(): array
    {
        return [
            'nombre.required'           => 'El nombre del torneo es obligatorio.',
            'nombre.max'                => 'El nombre no puede superar los 255 caracteres.',
            'deporte_id.required'       => 'Debes seleccionar un deporte.',
            'deporte_id.exists'         => 'El deporte seleccionado no existe.',
            'creado_por.required'       => 'Debes seleccionar un organizador.',
            'creado_por.exists'         => 'El organizador seleccionado no existe.',
            'elo_minimo.integer'        => 'El ELO mínimo debe ser un número entero.',
            'elo_minimo.min'            => 'El ELO mínimo no puede ser negativo.',
            'elo_maximo.integer'        => 'El ELO máximo debe ser un número entero.',
            'elo_maximo.min'            => 'El ELO máximo no puede ser negativo.',
            'elo_maximo.gte'            => 'El ELO máximo debe ser mayor o igual al ELO mínimo.',
            'max_jugadores.required'    => 'El número máximo de jugadores es obligatorio.',
            'max_jugadores.in'          => 'El número de jugadores debe ser 4, 8, 16, 32 o 64.',
            'fecha_inicio.required'     => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date'         => 'La fecha de inicio no tiene un formato válido.',
            'fecha_fin.date'            => 'La fecha de fin no tiene un formato válido.',
            'fecha_fin.after_or_equal'  => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'formato.required'          => 'Debes seleccionar un formato de torneo.',
            'formato.in'                => 'El formato seleccionado no es válido.',
            'estado.required'           => 'Debes seleccionar el estado del torneo.',
            'estado.in'                 => 'El estado seleccionado no es válido.',
        ];
    }

    public function destroy(Torneo $torneo)
    {
        $torneo->delete();
        return redirect()->route('admin.torneos.index')->with('success', 'Torneo eliminado correctamente.');
    }
}
