<?php

namespace App\Services;

use App\Models\HistorialElo;
use App\Models\Partido;
use Illuminate\Support\Facades\DB;

class EloService
{
    public function actualizarPorPartido(Partido $partido): void
    {
        [$delta1, $delta2, $miembros1, $miembros2, $deporteId] = $this->calcularDeltas($partido);

        if ($delta1 === null) return;

        foreach ($miembros1 as $u) {
            $eloAntes = $u->elo;
            $u->increment('elo', $delta1);
            $this->actualizarEloDeporte($u->id, $deporteId, $delta1);
            $this->guardarHistorial($u->id, $partido->id, $eloAntes, $eloAntes + $delta1, $delta1);
        }
        foreach ($miembros2 as $u) {
            $eloAntes = $u->elo;
            $u->increment('elo', $delta2);
            $this->actualizarEloDeporte($u->id, $deporteId, $delta2);
            $this->guardarHistorial($u->id, $partido->id, $eloAntes, $eloAntes + $delta2, $delta2);
        }

        $partido->update(['delta_elo_e1' => $delta1, 'delta_elo_e2' => $delta2]);
    }

    // Revierte el ELO de un partido ya finalizado usando el ganador anterior.
    public function revertirPorPartido(Partido $partido, int $ganadorAnteriorId): void
    {
        $clon = clone $partido;
        $clon->ganador_equipo_id = $ganadorAnteriorId;

        [$delta1, $delta2, $miembros1, $miembros2, $deporteId] = $this->calcularDeltas($clon);

        if ($delta1 === null) return;

        // Borrar snapshots anteriores antes de revertir
        HistorialElo::where('partido_id', $partido->id)->delete();

        foreach ($miembros1 as $u) {
            $u->increment('elo', -$delta1);
            $this->actualizarEloDeporte($u->id, $deporteId, -$delta1);
        }
        foreach ($miembros2 as $u) {
            $u->increment('elo', -$delta2);
            $this->actualizarEloDeporte($u->id, $deporteId, -$delta2);
        }
    }

    private function guardarHistorial(int $usuarioId, int $partidoId, int $eloAntes, int $eloDespues, int $delta): void
    {
        HistorialElo::updateOrCreate(
            ['usuario_id' => $usuarioId, 'partido_id' => $partidoId],
            ['elo_antes'  => $eloAntes, 'elo_despues' => $eloDespues, 'delta' => $delta]
        );
    }

    // Calcula los deltas sin aplicarlos. Devuelve [delta1, delta2, miembros1, miembros2, deporteId]
    // o [null, null, null, null, null] si los datos no están completos.
    private function calcularDeltas(Partido $partido): array
    {
        $null = [null, null, null, null, null];

        $equipo1 = $partido->equipo1()->with('miembros')->first();
        $equipo2 = $partido->equipo2()->with('miembros')->first();

        if (! $equipo1 || ! $equipo2) return $null;

        $miembros1 = $equipo1->miembros;
        $miembros2 = $equipo2->miembros;

        if ($miembros1->isEmpty() || $miembros2->isEmpty()) return $null;

        $eloTeam1 = $miembros1->avg(fn($m) => $m->pivot->elo_al_unirse);
        $eloTeam2 = $miembros2->avg(fn($m) => $m->pivot->elo_al_unirse);

        $mediaEloTorneo = $this->mediaEloTorneo($partido->torneo_id);
        $maxRonda       = Partido::where('torneo_id', $partido->torneo_id)->max('ronda') ?? 1;
        [$kGanador, $kPerdedor] = $this->kFactor($partido->ronda ?? 1, $maxRonda, $mediaEloTorneo);

        $e1 = 1 / (1 + pow(10, ($eloTeam2 - $eloTeam1) / 400));
        $e2 = 1 - $e1;

        $resultado1 = $partido->ganador_equipo_id === $equipo1->id ? 1.0 : 0.0;
        $resultado2 = 1.0 - $resultado1;

        $esGanador1 = $resultado1 === 1.0;
        $k1 = $esGanador1 ? $kGanador : $kPerdedor;
        $k2 = $esGanador1 ? $kPerdedor : $kGanador;

        $delta1 = (int) round($k1 * ($resultado1 - $e1));
        $delta2 = (int) round($k2 * ($resultado2 - $e2));

        $deporteId = DB::table('torneos')->where('id', $partido->torneo_id)->value('deporte_id');

        return [$delta1, $delta2, $miembros1, $miembros2, $deporteId];
    }

    private function actualizarEloDeporte(int $usuarioId, int $deporteId, int $delta): void
    {
        $existe = DB::table('elo_usuario_deporte')
            ->where('usuario_id', $usuarioId)
            ->where('deporte_id', $deporteId)
            ->exists();

        if ($existe) {
            DB::table('elo_usuario_deporte')
                ->where('usuario_id', $usuarioId)
                ->where('deporte_id', $deporteId)
                ->update([
                    'elo'        => DB::raw("GREATEST(0, elo + {$delta})"),
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('elo_usuario_deporte')->insert([
                'usuario_id' => $usuarioId,
                'deporte_id' => $deporteId,
                'elo'        => max(0, 500 + $delta),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    // Devuelve [kGanador, kPerdedor].
    // El perdedor usa una K menor en rondas avanzadas: cuanto más lejos llegues, menos pierdes.
    private function kFactor(int $ronda, int $maxRonda, float $mediaElo): array
    {
        $distanciaFinal = $maxRonda - $ronda;

        $kBase = match (true) {
            $distanciaFinal === 0 => 32,   // Final
            $distanciaFinal === 1 => 28,   // Semis
            $distanciaFinal === 2 => 24,   // Cuartos
            default               => 20,   // Rondas anteriores
        };

        // Cuanto más avanzada la ronda, menor penalización para el perdedor.
        // En rondas tempranas es simétrico (factor 1.0).
        $proteccionPerdedor = match (true) {
            $distanciaFinal === 0 => 0.50,  // Final:   pierde la mitad
            $distanciaFinal === 1 => 0.65,  // Semis:   pierde el 65 %
            $distanciaFinal === 2 => 0.80,  // Cuartos: pierde el 80 %
            default               => 1.00,  // Sin protección en rondas tempranas
        };

        // Torneos de alto nivel dan hasta un 20 % más
        $prestigio = 1 + min($mediaElo / 5000, 0.2);

        return [
            $kBase * $prestigio,
            $kBase * $prestigio * $proteccionPerdedor,
        ];
    }

    private function mediaEloTorneo(int $torneoId): float
    {
        return (float) DB::table('equipo_usuarios')
            ->join('equipos', 'equipo_usuarios.equipo_id', '=', 'equipos.id')
            ->where('equipos.torneo_id', $torneoId)
            ->avg('equipo_usuarios.elo_al_unirse') ?? 1000.0;
    }
}
