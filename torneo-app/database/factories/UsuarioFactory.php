<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Usuario>
 */
class UsuarioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre'     => $this->faker->name(),
            'email'      => $this->faker->unique()->safeEmail(),
            'contrasena' => 'password123',
            'elo'        => $this->faker->numberBetween(300, 1500),
            'rol'        => 'user',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function ($usuario) {
            $deporteIds = DB::table('deportes')->pluck('id')->toArray();
            if (empty($deporteIds)) return;

            // cada usuario tiene ELO en 1 a 3 deportes aleatorios
            $cantidad  = $this->faker->numberBetween(1, min(3, count($deporteIds)));
            $seleccion = $this->faker->randomElements($deporteIds, $cantidad);
            $now       = now();

            foreach ($seleccion as $deporteId) {
                DB::table('elo_usuario_deporte')->insert([
                    'usuario_id' => $usuario->id,
                    'deporte_id' => $deporteId,
                    'elo'        => $this->faker->numberBetween(300, 1400),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }
}
