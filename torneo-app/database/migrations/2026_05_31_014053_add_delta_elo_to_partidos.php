<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('partidos', function (Blueprint $table) {
            $table->integer('delta_elo_e1')->nullable()->after('resultado_e2');
            $table->integer('delta_elo_e2')->nullable()->after('delta_elo_e1');
        });
    }

    public function down(): void
    {
        Schema::table('partidos', function (Blueprint $table) {
            $table->dropColumn(['delta_elo_e1', 'delta_elo_e2']);
        });
    }
};
