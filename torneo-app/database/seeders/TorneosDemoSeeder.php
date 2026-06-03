<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

// 4 torneos de prueba para ver la app en acción:
//   1. Valencia Cup       - abierto, equipos ya casi completos
//   2. Riverside Masters  - en curso, semis pendientes
//   3. Highlands Open     - finalizado con campeón
//   4. Team Cup           - abierto con equipos de 2 jugadores
// funciona con migrate:fresh --seed, no hardcodea IDs ni ELOs
class TorneosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->torneo1_ValenciaCup();
        $this->torneo2_RiversideMasters();
        $this->torneo3_HighlandsOpen();
        $this->torneo4_TeamCup();
    }

    // Torneo 4 — Team Cup
    private function torneo4_TeamCup(): void
    {
        $creadorId = 1; // lo crea el admin para dejar libres a los otros usuarios

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'Team Cup',
            'deporte_id'    => 2,  // Baloncesto
            'creado_por'    => $creadorId,
            'elo_minimo'    => null,
            'elo_maximo'    => null,
            'max_jugadores' => 4,
            'min_miembros'  => 2,
            'max_miembros'  => 2,
            'fecha_inicio'  => now()->addDays(5)->toDateTimeString(),
            'fecha_fin'     => now()->addDays(12)->toDateTimeString(),
            'formato'       => 'eliminacion_simple',
            'estado'        => 'abierto',
            'direccion'     => 'Calle Mayor 10, Pabellón Municipal',
            'ciudad'        => 'Alicante',
            'provincia'     => 'Alicante',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // cogemos los 8 con más ELO (sin contar al admin)
        $usuarios = DB::table('usuarios')
            ->where('id', '!=', $creadorId)
            ->orderByDesc('elo')
            ->limit(8)
            ->get(['id', 'elo']);

        $nombresEquipos = ['Alpha Squad', 'Beta Force', 'Gamma Strike', 'Delta Unit'];

        // 4 equipos de 2, todos bloqueados y listos para iniciar
        foreach ($nombresEquipos as $i => $nombre) {
            $capitan  = $usuarios[$i * 2];
            $miembro2 = $usuarios[$i * 2 + 1];

            $eqId = DB::table('equipos')->insertGetId([
                'torneo_id'  => $torneoId,
                'nombre'     => $nombre,
                'capitan_id' => $capitan->id,
                'semilla'    => null,
                'bloqueado'  => true,
                'inscrito'   => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('equipo_usuarios')->insert([
                ['equipo_id' => $eqId, 'usuario_id' => $capitan->id,  'elo_al_unirse' => $capitan->elo,  'created_at' => now(), 'updated_at' => now()],
                ['equipo_id' => $eqId, 'usuario_id' => $miembro2->id, 'elo_al_unirse' => $miembro2->elo, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    // helper para crear equipos con los usuarios de más ELO
    // $bloqueadoSeeds: qué semillas quedan con bloqueado=true
    private function crearEquipos(int $torneoId, array $nombres, int|array $excluirId, array $bloqueadoSeeds = [], int $miembrosPorEquipo = 1): array
    {
        $numEquipos    = count($nombres);
        $participantes = DB::table('usuarios')
            ->whereNotIn('id', (array) $excluirId)
            ->orderByDesc('elo')
            ->limit($numEquipos * $miembrosPorEquipo)
            ->get(['id', 'elo']);

        $seedToId = [];
        for ($i = 0; $i < $numEquipos; $i++) {
            $capitan   = $participantes[$i * $miembrosPorEquipo];
            $seed      = $i + 1;
            $bloqueado = in_array($seed, $bloqueadoSeeds);

            $eqId = DB::table('equipos')->insertGetId([
                'torneo_id'  => $torneoId,
                'nombre'     => $nombres[$i],
                'capitan_id' => $capitan->id,
                'semilla'    => $seed,
                'bloqueado'  => $bloqueado,
                'inscrito'   => $bloqueado,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $inserts = [];
            for ($j = 0; $j < $miembrosPorEquipo; $j++) {
                $miembro   = $participantes[$i * $miembrosPorEquipo + $j];
                $inserts[] = [
                    'equipo_id'     => $eqId,
                    'usuario_id'    => $miembro->id,
                    'elo_al_unirse' => $miembro->elo,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];
            }
            DB::table('equipo_usuarios')->insert($inserts);

            $seedToId[$seed] = $eqId;
        }

        return $seedToId;
    }

    // Torneo 1 — Valencia Cup
    private function torneo1_ValenciaCup(): void
    {
        $creadorId = 2; // "user", siempre ID 2 después del UsuarioSeeder

        $torneoId = DB::table('torneos')->insertGetId([
            'nombre'        => 'Valencia Cup',
            'deporte_id'    => 3,  // Tenis
            'creado_por'    => $creadorId,
            'elo_minimo'    => 400,
            'elo_maximo'    => 2000,
            'max_jugadores' => 8,
            'min_miembros'  => 2,
            'max_miembros'  => 2,
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

        // seeds 1,2,3,5 ya cerraron inscripciones
        $userId   = DB::table('usuarios')->where('email', 'user@example.com')->value('id');
        $sergioId = DB::table('usuarios')->where('email', 'sergio@example.com')->value('id');

        $this->crearEquipos($torneoId, [
            'Valencia Tigers',
            'Sun Kings',
            'Mediterranean FC',
            'Costa Aces',
            'Levante Storm',
            'Blue Waves',
            'Orange Crush',
            'Valencia Rovers',
        ], [$creadorId, $userId, $sergioId], [1, 2, 3, 5], 2);

        // sin partidos todavía, el bracket se genera al iniciar
    }

    // Torneo 2 — Riverside Masters
    private function torneo2_RiversideMasters(): void
    {
        $creadorId = 2; // "user"

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

        // torneo en marcha, todos bloqueados
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

        // cuartos finalizados: 1v8, 4v5, 3v6, 2v7
        $cuartos = [
            // [seed_e1, seed_e2, ganador, res_e1, res_e2]
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

        // semis pendientes, equipos ya asignados
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

        // final, TBD
        DB::table('partidos')->insert([
            'torneo_id' => $torneoId, 'equipo1_id' => null, 'equipo2_id' => null,
            'ganador_equipo_id' => null, 'resultado_e1' => null, 'resultado_e2' => null,
            'estado' => 'pendiente', 'ronda' => 3,
            'programado_en' => now()->addDays(3)->toDateTimeString(),
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    // Torneo 3 — Highlands Open
    private function torneo3_HighlandsOpen(): void
    {
        $creadorId = 2; // "user"

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

        // finalizado, todos bloqueados
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

        // cuartos, todos finalizados
        $cuartos = [
            // [seed_e1, seed_e2, ganador, res_e1, res_e2, días_atrás]
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

        // semis — el seed 3 elimina al 2, surprise!
        $semis = [
            // [eq1, eq2, ganador, res_e1, res_e2, días_atrás]
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

        // final — gana el seed 1
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
