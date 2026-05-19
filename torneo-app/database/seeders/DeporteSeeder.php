<?php

namespace Database\Seeders;

use App\Models\Deporte;
use Illuminate\Database\Seeder;

class DeporteSeeder extends Seeder
{
    public function run(): void
    {
        $deportes = [
            'Fútbol', 'Baloncesto', 'Tenis', 'Pádel', 'Voleibol',
            'Balonmano', 'Hockey', 'Ping-Pong', 'Ajedrez', 'Dardos',
        ];

        foreach ($deportes as $nombre) {
            Deporte::create(['nombre' => $nombre]);
        }
    }
}
