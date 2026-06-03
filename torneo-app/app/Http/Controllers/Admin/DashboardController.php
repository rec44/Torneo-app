<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Torneo;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return view('admin.dashboard', [
            // contadores rápidos del header
            'torneosEnCurso'      => Torneo::where('estado', 'en_curso')->count(),
            'torneosAbiertos'     => Torneo::where('estado', 'abierto')->count(),
            'torneosProgramacion' => Torneo::where('estado', 'programacion')->count(),
            'usuariosEstaSemanana' => DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\Usuario')
                ->where('created_at', '>=', now()->startOfWeek())
                ->distinct('tokenable_id')
                ->count('tokenable_id'),
            'jobsFallidos'        => DB::table('failed_jobs')->count(),

            // baneados recientes
            'usuariosBaneados' => Usuario::onlyTrashed()
                ->orderByDesc('deleted_at')
                ->limit(5)
                ->get(['id', 'nombre', 'email', 'deleted_at']),

            // torneos por formato
            'torneosPorFormato' => Torneo::select('formato', DB::raw('count(*) as total'))
                ->groupBy('formato')
                ->get(),
        ]);
    }
}
