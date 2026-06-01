<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Crea 3 torneos single elimination de demostración:
 *   1. "Valencia Cup"      — abierto,    inscripción completa, sin partidos
 *   2. "Riverside Masters" — en_curso,   cuartos terminados, semis pendientes
 *   3. "Highlands Open"    — finalizado, bracket completo con campeón
 *
 * Compatible con migrate:fresh --seed (no depende de IDs ni ELOs concretos).
 */
class TorneosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->torneo1_ValenciaCup();
        $this->torneo2_RiversideMasters();
        $this->torneo3_HighlandsOpen();
    }

    // -------------------------------------------------------------------------
    // Helper: crea 8 equipos para un torneo cogiendo los usuarios con mayor ELO
    // (excluye al creador). Devuelve [seed => equipo_id].
    // $bloqueadoSeeds: semillas que deben tener bloqueado = true.
    // -------------------------------------------------------------------------
    private function crearEquipos(int $torneoId, array $nombres, int $excluirId, array $bloqueadoSeeds = []): array
    {
        $participantes = DB::table('usuarios')
            ->where('id', '!=', $excluirId)
            ->orderByDesc('elo')
            ->limit(8)
            ->get(['id', 'elo']);

        $seedToId = [];
        foreach ($participantes as $i => $u) {
            $seed = $i + 1;
            $bloqueado = in_array($seed, $bloqueadoSeeds);
            $eqId = DB::table('equipos')->insertGetId([
                'torneo_id'  => $torneoId,
                'nombre'     => $nombres[$i],
                'capitan_id' => $u->id,
                'semilla'    => $seed,
                'bloqueado'  => $bloqueado,
                'inscrito'   => $bloqueado,
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
            $seedToId[$seed] = $eqId;
        }

        return $seedToId;
    }

    // -------------------------------------------------------------------------
    // Torneo 1 — Valencia Cup (abierto, a punto de empezar, sin partidos)
    // -------------------------------------------------------------------------
    private function torneo1_ValenciaCup(): void
    {
        $creadorId = 2; // usuario fijo "user", siempre ID 2 tras UsuarioSeeder

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'Valencia Cup',
            'deporte_id'    => 3,  // Tenis
            'creado_por'    => $creadorId,
            'elo_minimo'    => 400,
            'elo_maximo'    => 2000,
            'max_jugadores' => 8,
            'min_miembros'  => 1,
            'max_miembros'  => 1,
            'fecha_inicio'  => now()->addDays(2)->toDateTimeString(),
            'fecha_fin'     => now()->addDays(10)->toDateTimeString(),
            'formato'       => 'eliminacion_simple',
            'estado'        => 'abierto',
            'direccion'     => 'Av. de l\'Integració 1, Pabellón Municipal',
            'ciudad'        => 'Valencia',
            'provincia'     => 'Valencia',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Seeds 1, 3, 5 bloqueados: esos equipos cerraron sus inscripciones
        $this->crearEquipos($torneoId, [
            'Valencia Tigers',
            'Sun Kings',
            'Mediterranean FC',
            'Costa Aces',
            'Levante Storm',
            'Blue Waves',
            'Orange Crush',
            'Valencia Rovers',
        ], $creadorId, [1, 3, 5]);

        // Sin partidos: el bracket se genera cuando el torneo empiece
    }

    // -------------------------------------------------------------------------
    // Torneo 2 — Riverside Masters (en_curso, cuartos terminados, semis pendientes)
    // -------------------------------------------------------------------------
    private function torneo2_RiversideMasters(): void
    {
        $creadorId = 2; // user

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'Riverside Masters',
            'deporte_id'    => 4,  // Pádel
            'creado_por'    => $creadorId,
            'elo_minimo'    => 300,
            'elo_maximo'    => 2000,
            'max_jugadores' => 8,
            'min_miembros'  => 1,
            'max_miembros'  => 1,
            'fecha_inicio'  => now()->subDays(5)->toDateTimeString(),
            'fecha_fin'     => now()->addDays(5)->toDateTimeString(),
            'formato'       => 'eliminacion_simple',
            'estado'        => 'en_curso',
            'direccion'     => 'C. Gambo 5, Club de Pádel Benidorm',
            'ciudad'        => 'Benidorm',
            'provincia'     => 'Alicante',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Torneo en curso: todos los equipos bloqueados (nadie puede unirse ya)
        $s = $this->crearEquipos($torneoId, [
            'Riverside Lions',
            'River Stars',
            'Waterfront Storm',
            'Dock Warriors',
            'Current Vipers',
            'Rapid City',
            'Riverdale FC',
            'Bayou Squad',
        ], $creadorId, [1, 2, 3, 4, 5, 6, 7, 8]);

        // Ronda 1 (Cuartos) — bracket 1v8, 4v5, 3v6, 2v7, todos finalizados
        $cuartos = [
            // [seed_e1, seed_e2, seed_ganador, res_e1, res_e2]
            [1, 8, 1, '2', '0'],
            [4, 5, 4, '2', '1'],
            [3, 6, 3, '2', '0'],
            [2, 7, 2, '2', '1'],
        ];

        $ganadores = [];
        foreach ($cuartos as $c) {
            DB::table('partidos')->insert([
                'torneo_id'         => $torneoId,
                'equipo1_id'        => $s[$c[0]],
                'equipo2_id'        => $s[$c[1]],
                'ganador_equipo_id' => $s[$c[2]],
                'resultado_e1'      => $c[3],
                'resultado_e2'      => $c[4],
                'estado'            => 'finalizado',
                'ronda'             => 1,
                'programado_en'     => now()->subDays(4)->toDateTimeString(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
            $ganadores[] = $s[$c[2]];
        }

        // Ronda 2 (Semis) — pendientes con equipos asignados
        DB::table('partidos')->insert([
            [
                'torneo_id' => $torneoId, 'equipo1_id' => $ganadores[0], 'equipo2_id' => $ganadores[1],
                'ganador_equipo_id' => null, 'resultado_e1' => null, 'resultado_e2' => null,
                'estado' => 'pendiente', 'ronda' => 2,
                'programado_en' => now()->addDay()->toDateTimeString(),
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'torneo_id' => $torneoId, 'equipo1_id' => $ganadores[2], 'equipo2_id' => $ganadores[3],
                'ganador_equipo_id' => null, 'resultado_e1' => null, 'resultado_e2' => null,
                'estado' => 'pendiente', 'ronda' => 2,
                'programado_en' => now()->addDay()->toDateTimeString(),
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        // Ronda 3 (Final) — TBD
        DB::table('partidos')->insert([
            'torneo_id' => $torneoId, 'equipo1_id' => null, 'equipo2_id' => null,
            'ganador_equipo_id' => null, 'resultado_e1' => null, 'resultado_e2' => null,
            'estado' => 'pendiente', 'ronda' => 3,
            'programado_en' => now()->addDays(3)->toDateTimeString(),
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    // -------------------------------------------------------------------------
    // Torneo 3 — Highlands Open (finalizado, bracket completo)
    // -------------------------------------------------------------------------
    private function torneo3_HighlandsOpen(): void
    {
        $creadorId = 2; // usuario "user"

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'Highlands Open',
            'deporte_id'    => 1,  // Fútbol
            'creado_por'    => $creadorId,
            'elo_minimo'    => 200,
            'elo_maximo'    => 2000,
            'max_jugadores' => 8,
            'min_miembros'  => 1,
            'max_miembros'  => 1,
            'fecha_inicio'  => now()->subDays(14)->toDateTimeString(),
            'fecha_fin'     => now()->subDay()->toDateTimeString(),
            'formato'       => 'eliminacion_simple',
            'estado'        => 'finalizado',
            'direccion'     => 'Av. del País Valenciano 12, Polideportivo Municipal',
            'ciudad'        => 'Altea la Vila',
            'provincia'     => 'Alicante',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Torneo finalizado: todos bloqueados
        $s = $this->crearEquipos($torneoId, [
            'Highland Thunder',
            'Glen Blaze',
            'Moor Fury',
            'Cairn Knights',
            'Ben Tigers',
            'Loch Stars',
            'Thistle United',
            'Brae Rovers',
        ], $creadorId, [1, 2, 3, 4, 5, 6, 7, 8]);

        // Ronda 1 (Cuartos) — todos finalizados
        $cuartos = [
            // [seed_e1, seed_e2, seed_ganador, res_e1, res_e2, dias_atrás]
            [1, 8, 1, '3', '1', 13],
            [4, 5, 4, '3', '2', 13],
            [3, 6, 3, '3', '0', 12],
            [2, 7, 2, '3', '1', 12],
        ];

        $ganCuartos = [];
        foreach ($cuartos as $c) {
            DB::table('partidos')->insert([
                'torneo_id'         => $torneoId,
                'equipo1_id'        => $s[$c[0]],
                'equipo2_id'        => $s[$c[1]],
                'ganador_equipo_id' => $s[$c[2]],
                'resultado_e1'      => $c[3],
                'resultado_e2'      => $c[4],
                'estado'            => 'finalizado',
                'ronda'             => 1,
                'programado_en'     => now()->subDays($c[5])->toDateTimeString(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
            $ganCuartos[] = $s[$c[2]];
        }

        // Ronda 2 (Semis) — seed 3 elimina al seed 2 (sorpresa)
        $semis = [
            // [eq1, eq2, ganador, res_e1, res_e2, dias_atrás]
            [$ganCuartos[0], $ganCuartos[1], $ganCuartos[0], '3', '2', 8],
            [$ganCuartos[2], $ganCuartos[3], $ganCuartos[2], '3', '2', 8],
        ];

        $ganSemis = [];
        foreach ($semis as $s2) {
            DB::table('partidos')->insert([
                'torneo_id'         => $torneoId,
                'equipo1_id'        => $s2[0],
                'equipo2_id'        => $s2[1],
                'ganador_equipo_id' => $s2[2],
                'resultado_e1'      => $s2[3],
                'resultado_e2'      => $s2[4],
                'estado'            => 'finalizado',
                'ronda'             => 2,
                'programado_en'     => now()->subDays($s2[5])->toDateTimeString(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
            $ganSemis[] = $s2[2];
        }

        // Ronda 3 (Final) — seed 1 campeón
        DB::table('partidos')->insert([
            'torneo_id'         => $torneoId,
            'equipo1_id'        => $ganSemis[0],
            'equipo2_id'        => $ganSemis[1],
            'ganador_equipo_id' => $ganSemis[0],
            'resultado_e1'      => '3',
            'resultado_e2'      => '1',
            'estado'            => 'finalizado',
            'ronda'             => 3,
            'programado_en'     => now()->subDays(2)->toDateTimeString(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }
}
