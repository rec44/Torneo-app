<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTorneoRequest;
use App\Http\Requests\Admin\UpdateTorneoRequest;
use App\Models\Deporte;
use App\Models\Torneo;
use App\Models\Usuario;

class TorneoController extends Controller
{
    private array $formatos = [
        'eliminacion_simple' => 'Eliminación simple'
    ];

    private array $estados = [
        'abierto'    => 'Abierto',
        'en_curso'   => 'En curso',
        'finalizado' => 'Finalizado',
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

    public function store(StoreTorneoRequest $request)
    {
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

    public function update(UpdateTorneoRequest $request, Torneo $torneo)
    {
        if ($torneo->estado === 'en_curso') {
            return redirect()->route('admin.torneos.index')
                ->with('error', 'No se puede editar un torneo en curso.');
        }

        $torneo->update($request->only([
            'nombre', 'deporte_id', 'creado_por', 'elo_minimo', 'elo_maximo',
            'max_jugadores', 'fecha_inicio', 'fecha_fin', 'formato', 'estado',
        ]));

        return redirect()->route('admin.torneos.index')->with('success', 'Torneo actualizado correctamente.');
    }

    public function destroy(Torneo $torneo)
    {
        if ($torneo->estado === 'en_curso') {
            return redirect()->route('admin.torneos.index')
                ->with('error', 'No se puede eliminar un torneo en curso.');
        }

        $torneo->delete();
        return redirect()->route('admin.torneos.index')->with('success', 'Torneo eliminado correctamente.');
    }
}
