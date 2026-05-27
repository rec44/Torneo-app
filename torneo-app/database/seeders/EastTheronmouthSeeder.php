<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Crea el torneo "East Theronmouth Open" — single elimination en_curso.
 * Ronda 1 generada con equipos reales; rondas 2 y 3 como TBD.
 * Compatible con migrate:fresh --seed (no depende de IDs previos).
 */
class EastTheronmouthSeeder extends Seeder
{
    public function run(): void
    {
        $creadorId = 1; // admin, siempre ID 1 tras UsuarioSeeder

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'East Theronmouth Open',
            'deporte_id'    => 2,   // Baloncesto
            'creado_por'    => $creadorId,
            'elo_minimo'    => 0,
            'elo_maximo'    => 2000,
            'max_jugadores' => 8,
            'min_miembros'  => 1,
            'max_miembros'  => 1,
            'fecha_inicio'  => now()->subDay()->toDateTimeString(),
            'fecha_fin'     => now()->addDays(7)->toDateTimeString(),
            'formato'       => 'eliminacion_simple',
            'estado'        => 'en_curso',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // 8 participantes: los 8 usuarios con mayor ELO distintos del creador
        $participantes = DB::table('usuarios')
            ->where('id', '!=', $creadorId)
            ->orderByDesc('elo')
            ->limit(8)
            ->get(['id', 'elo']);

        $teamNames = [
            'East Thunder',
            'Theronmouth FC',
            'Desert Hawks',
            'Iron Wolves',
            'Storm Riders',
            'Silent Vipers',
            'Golden Eagles',
            'Night Falcons',
        ];

        $seedToEquipoId = [];

        foreach ($participantes as $i => $u) {
            $seed = $i + 1; // seed 1 = mayor ELO

            $eqId = DB::table('equipos')->insertGetId([
                'torneo_id'  => $torneoId,
                'nombre'     => $teamNames[$i],
                'capitan_id' => $u->id,
                'semilla'    => $seed,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('equipo_usuarios')->insert([
                'equipo_id'     => $eqId,
                'usuario_id'    => $u->id,
                'elo_al_unirse' => $u->elo,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $seedToEquipoId[$seed] = $eqId;
        }

        // Bracket single elimination 8 equipos
        // Ronda 1 (Cuartos): 1v8, 4v5, 3v6, 2v7 — pendiente con equipos asignados
        $cuartos = [
            [$seedToEquipoId[1], $seedToEquipoId[8]],
            [$seedToEquipoId[4], $seedToEquipoId[5]],
            [$seedToEquipoId[3], $seedToEquipoId[6]],
            [$seedToEquipoId[2], $seedToEquipoId[7]],
        ];

        foreach ($cuartos as $c) {
            DB::table('partidos')->insert([
                'torneo_id'         => $torneoId,
                'equipo1_id'        => $c[0],
                'equipo2_id'        => $c[1],
                'ganador_equipo_id' => null,
                'resultado_e1'      => null,
                'resultado_e2'      => null,
                'estado'            => 'pendiente',
                'ronda'             => 1,
                'programado_en'     => now()->addDays(1)->toDateTimeString(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // Ronda 2 (Semis) y Ronda 3 (Final): slots TBD
        foreach ([2, 2, 3] as $ronda) {
            DB::table('partidos')->insert([
                'torneo_id'         => $torneoId,
                'equipo1_id'        => null,
                'equipo2_id'        => null,
                'ganador_equipo_id' => null,
                'resultado_e1'      => null,
                'resultado_e2'      => null,
                'estado'            => 'pendiente',
                'ronda'             => $ronda,
                'programado_en'     => null,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
    }
}
