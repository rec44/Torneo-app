<?php

namespace Database\Seeders;

use App\Models\Torneo;
use Illuminate\Database\Seeder;

class TorneoSeeder extends Seeder
{
    public function run(): void
    {
        Torneo::factory(10)->create();
    }
}
