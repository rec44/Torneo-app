<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partido;
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
            'usuariosEstaSemanana' => Usuario::where('created_at', '>=', now()->startOfWeek())->count(),
            'jobsFallidos'        => DB::table('failed_jobs')->count(),

            // torneos que necesitan acción del admin
            'torneosParaConfirmar' => Torneo::where('estado', 'programacion')
                ->with('creadoPor:id,nombre', 'deporte:id,nombre')
                ->withCount([
                    'partidos',
                    'partidos as partidos_sin_fecha' => fn ($q) => $q->whereNull('programado_en')->where('estado', '!=', 'finalizado'),
                ])
                ->latest()
                ->get(),

            'torneosListosParaIniciar' => Torneo::where('estado', 'abierto')
                ->with('deporte:id,nombre', 'creadoPor:id,nombre')
                ->withCount([
                    'equipos as equipos_confirmados' => fn ($q) => $q->where('bloqueado', true),
                ])
                ->get()
                ->filter(fn ($t) => $t->equipos_confirmados >= ceil($t->max_jugadores / 2) + 1)
                ->values(),

            // próximos 8 partidos
            'proximosPartidos' => Partido::where('estado', 'pendiente')
                ->whereNotNull('programado_en')
                ->where('programado_en', '>=', now())
                ->with('torneo:id,nombre', 'equipo1:id,nombre', 'equipo2:id,nombre')
                ->orderBy('programado_en')
                ->limit(8)
                ->get(),

            // top ELO
            'topJugadores' => Usuario::orderByDesc('elo')
                ->limit(8)
                ->get(['id', 'nombre', 'elo', 'rol']),

            // baneados recientes
            'usuariosBaneados' => Usuario::onlyTrashed()
                ->orderByDesc('deleted_at')
                ->limit(5)
                ->get(['id', 'nombre', 'email', 'deleted_at']),
        ]);
    }
}
