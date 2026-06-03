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

    // deshace el ELO si se corrige el resultado de un partido ya cerrado
    public function revertirPorPartido(Partido $partido, int $ganadorAnteriorId): void
    {
        $clon = clone $partido;
        $clon->ganador_equipo_id = $ganadorAnteriorId;

        [$delta1, $delta2, $miembros1, $miembros2, $deporteId] = $this->calcularDeltas($clon);

        if ($delta1 === null) return;

        // borramos el historial viejo antes de recalcular, si no se acumula basura
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

    // devuelve los deltas sin aplicar nada, o 5 nulls si faltan equipos o miembros
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

    // [kGanador, kPerdedor] — cuanto más lejos llegas antes de caer, menos ELO pierdes
    private function kFactor(int $ronda, int $maxRonda, float $mediaElo): array
    {
        $distanciaFinal = $maxRonda - $ronda;

        // la final vale más, lógico
        $kBase = match (true) {
            $distanciaFinal === 0 => 40,   // final
            $distanciaFinal === 1 => 32,   // semis
            $distanciaFinal === 2 => 28,   // cuartos
            default               => 24,   // rondas previas
        };

        // en rondas tempranas se penaliza más al perdedor; en la final casi nada
        $proteccionPerdedor = match (true) {
            $distanciaFinal === 0 => 0.30,  // final:   solo pierde el 30%
            $distanciaFinal === 1 => 0.50,  // semis:   50%
            $distanciaFinal === 2 => 0.75,  // cuartos: 75%
            default               => 1.00,  // el resto sin protección
        };

        // torneos de nivel alto compensan un poco (hasta +20%)
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
