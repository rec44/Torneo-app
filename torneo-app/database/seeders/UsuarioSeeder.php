<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::create([
            'nombre'     => 'admin',
            'email'      => 'admin@example.com',
            'contrasena' => 'admin123',
            'elo'        => 1000,
            'rol'        => 'admin',
        ]);

        $user = Usuario::create([
            'nombre'     => 'user',
            'email'      => 'user@example.com',
            'contrasena' => 'user123',
            'elo'        => 620,
            'rol'        => 'user',
        ]);

        $sergio = Usuario::create([
            'nombre'     => 'Sergio',
            'email'      => 'sergio@example.com',
            'contrasena' => 'sergio123',
            'elo'        => 740,
            'rol'        => 'user',
        ]);

        // Deportes: 1=Fútbol, 2=Baloncesto, 3=Tenis, 4=Pádel, 5=Voleibol
        $now = now();

        // ELOs de user en tres deportes
        DB::table('elo_usuario_deporte')->insert([
            ['usuario_id' => $user->id, 'deporte_id' => 3, 'elo' => 780, 'created_at' => $now, 'updated_at' => $now], // Tenis
            ['usuario_id' => $user->id, 'deporte_id' => 4, 'elo' => 650, 'created_at' => $now, 'updated_at' => $now], // Pádel
            ['usuario_id' => $user->id, 'deporte_id' => 1, 'elo' => 430, 'created_at' => $now, 'updated_at' => $now], // Fútbol
        ]);

        // ELOs de Sergio en tres deportes
        DB::table('elo_usuario_deporte')->insert([
            ['usuario_id' => $sergio->id, 'deporte_id' => 2, 'elo' => 890, 'created_at' => $now, 'updated_at' => $now], // Baloncesto
            ['usuario_id' => $sergio->id, 'deporte_id' => 1, 'elo' => 720, 'created_at' => $now, 'updated_at' => $now], // Fútbol
            ['usuario_id' => $sergio->id, 'deporte_id' => 5, 'elo' => 480, 'created_at' => $now, 'updated_at' => $now], // Voleibol
        ]);

        Usuario::factory(20)->create();
    }
}
