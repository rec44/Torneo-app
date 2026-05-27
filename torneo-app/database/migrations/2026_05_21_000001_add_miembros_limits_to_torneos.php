<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->unsignedInteger('min_miembros')->default(1)->after('max_jugadores');
            $table->unsignedInteger('max_miembros')->nullable()->after('min_miembros');
        });
    }

    public function down(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->dropColumn(['min_miembros', 'max_miembros']);
        });
    }
};
