<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

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

        Usuario::create([
            'nombre'     => 'user',
            'email'      => 'user@example.com',
            'contrasena' => 'user123',
            'elo'        => 500,
            'rol'        => 'user',
        ]);

        Usuario::create([
            'nombre'     => 'Sergio',
            'email'      => 'sergio@example.com',
            'contrasena' => 'sergio123',
            'elo'        => 500,
            'rol'        => 'user',
        ]);

        Usuario::factory(10)->create();
    }
}
