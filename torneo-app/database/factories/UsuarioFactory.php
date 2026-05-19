<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

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
}
