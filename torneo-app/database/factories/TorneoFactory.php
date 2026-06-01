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
    private static array $localidades = [
        ['ciudad' => 'Benidorm',      'provincia' => 'Alicante'],
        ['ciudad' => 'Altea la Vila', 'provincia' => 'Alicante'],
        ['ciudad' => 'Alicante',      'provincia' => 'Alicante'],
        ['ciudad' => 'Calp',          'provincia' => 'Alicante'],
        ['ciudad' => 'Dénia',         'provincia' => 'Alicante'],
        ['ciudad' => 'Xàbia',         'provincia' => 'Alicante'],
        ['ciudad' => 'Villajoyosa',   'provincia' => 'Alicante'],
        ['ciudad' => 'Valencia',      'provincia' => 'Valencia'],
        ['ciudad' => 'Gandía',        'provincia' => 'Valencia'],
        ['ciudad' => 'Cullera',       'provincia' => 'Valencia'],
        ['ciudad' => 'Ontinyent',     'provincia' => 'Valencia'],
    ];

    public function definition(): array
    {
        $eloMinimo   = $this->faker->numberBetween(0, 600);
        $fechaInicio = $this->faker->dateTimeBetween('+1 week', '+3 months');
        $localidad   = $this->faker->randomElement(self::$localidades);

        return [
            'nombre'        => $localidad['ciudad'] . ' ' . $this->faker->randomElement(['Open', 'Copa', 'Liga', 'Masters', 'Campeonato', 'Trophy']),
            'deporte_id'    => Deporte::inRandomOrder()->value('id'),
            'creado_por'    => Usuario::inRandomOrder()->value('id'),
            'elo_minimo'    => $eloMinimo,
            'elo_maximo'    => $this->faker->numberBetween($eloMinimo + 200, 2000),
            'max_jugadores' => $this->faker->randomElement([4, 8, 16, 32]),
            'fecha_inicio'  => $fechaInicio,
            'fecha_fin'     => $this->faker->dateTimeBetween($fechaInicio, '+6 months'),
            'formato'       => 'eliminacion_simple',
            'estado'        => $this->faker->randomElement(['abierto', 'en_curso', 'finalizado']),
            'direccion'     => $this->faker->streetAddress(),
            'ciudad'        => $localidad['ciudad'],
            'provincia'     => $localidad['provincia'],
        ];
    }
}
