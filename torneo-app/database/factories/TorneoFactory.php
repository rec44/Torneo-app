<?php

namespace Database\Factories;

use App\Models\Deporte;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Torneo>
 */
class TorneoFactory extends Factory
{
    public function definition(): array
    {
        $eloMinimo    = $this->faker->numberBetween(0, 600);
        $fechaInicio  = $this->faker->dateTimeBetween('+1 week', '+3 months');

        return [
            'nombre'       => $this->faker->city() . ' ' . $this->faker->randomElement(['Open', 'Copa', 'Liga', 'Masters', 'Campeonato', 'Trophy']),
            'deporte_id'   => Deporte::inRandomOrder()->value('id'),
            'creado_por'   => Usuario::inRandomOrder()->value('id'),
            'elo_minimo'   => $eloMinimo,
            'elo_maximo'   => $this->faker->numberBetween($eloMinimo + 200, 2000),
            'max_jugadores'=> $this->faker->randomElement([4, 8, 16, 32]),
            'fecha_inicio' => $fechaInicio,
            'fecha_fin'    => $this->faker->dateTimeBetween($fechaInicio, '+6 months'),
            'formato'      => $this->faker->randomElement(['eliminacion_simple', 'eliminacion_doble', 'round_robin', 'suizo']),
            'estado'       => $this->faker->randomElement(['abierto', 'en_curso', 'finalizado', 'cancelado']),
        ];
    }
}
