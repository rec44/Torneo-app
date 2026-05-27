<?php

namespace App\Services;

use App\Models\Partido;
use Illuminate\Support\Facades\DB;

class EloService
{
    /**
     * Actualiza el ELO de todos los miembros de ambos equipos tras un partido.
     * Solo debe llamarse la primera vez que el partido se finaliza.
     */
    public function actualizarPorPartido(Partido $partido): void
    {
        $equipo1 = $partido->equipo1()->with('miembros')->first();
        $equipo2 = $partido->equipo2()->with('miembros')->first();

        if (! $equipo1 || ! $equipo2) return;

        $miembros1 = $equipo1->miembros;
        $miembros2 = $equipo2->miembros;

        if ($miembros1->isEmpty() || $miembros2->isEmpty()) return;

        $eloTeam1 = $miembros1->avg('elo');
        $eloTeam2 = $miembros2->avg('elo');

        $mediaEloTorneo = $this->mediaEloTorneo($partido->torneo_id);
        $maxRonda       = Partido::where('torneo_id', $partido->torneo_id)->max('ronda') ?? 1;
        $k              = $this->kFactor($partido->ronda ?? 1, $maxRonda, $mediaEloTorneo);

        // Probabilidades esperadas
        $e1 = 1 / (1 + pow(10, ($eloTeam2 - $eloTeam1) / 400));
        $e2 = 1 - $e1;

        $resultado1 = $partido->ganador_equipo_id === $equipo1->id ? 1.0 : 0.0;
        $resultado2 = 1.0 - $resultado1;

        $delta1 = (int) round($k * ($resultado1 - $e1));
        $delta2 = (int) round($k * ($resultado2 - $e2));

        foreach ($miembros1 as $u) {
            $u->increment('elo', $delta1);
        }
        foreach ($miembros2 as $u) {
            $u->increment('elo', $delta2);
        }
    }

    /**
     * K-factor base según la distancia a la final, multiplicado por el prestigio del torneo.
     */
    private function kFactor(int $ronda, int $maxRonda, float $mediaElo): float
    {
        $distanciaFinal = $maxRonda - $ronda;

        $kBase = match (true) {
            $distanciaFinal === 0 => 32,   // Final
            $distanciaFinal === 1 => 26,   // Semis
            $distanciaFinal === 2 => 20,   // Cuartos
            default               => 16,   // Rondas anteriores
        };

        // Torneos con mayor ELO medio dan más puntos en juego
        $prestigio = 1 + ($mediaElo / 2000);

        return $kBase * $prestigio;
    }

    /**
     * ELO medio del torneo basado en el elo_al_unirse de todos los participantes.
     */
    private function mediaEloTorneo(int $torneoId): float
    {
        return (float) DB::table('equipo_usuarios')
            ->join('equipos', 'equipo_usuarios.equipo_id', '=', 'equipos.id')
            ->where('equipos.torneo_id', $torneoId)
            ->avg('equipo_usuarios.elo_al_unirse') ?? 1000.0;
    }
}
