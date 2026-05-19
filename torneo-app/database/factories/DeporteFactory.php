<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deporte>
 */
class DeporteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->randomElement([
                'Fútbol', 'Baloncesto', 'Tenis', 'Pádel', 'Voleibol',
                'Balonmano', 'Hockey', 'Ping-Pong', 'Ajedrez', 'Dardos',
                'Natación', 'Ciclismo', 'Atletismo', 'Boxeo', 'Judo',
            ]),
        ];
    }
}
