<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deporte;
use App\Models\Partido;
use App\Models\Torneo;
use App\Models\Usuario;

class DashboardController extends Controller
{
    public function index()
    {
        return view('admin.dashboard', [
            'totalDeportes' => Deporte::count(),
            'totalUsuarios' => Usuario::count(),
            'totalTorneos'  => Torneo::count(),
            'totalPartidos' => Partido::count(), 
            'torneosPorEstado' => Torneo::selectRaw('estado, count(*) as total')
                ->groupBy('estado')
                ->get()
                ->pluck('total', 'estado')
                ->toArray(),
        ]);
    }
}
