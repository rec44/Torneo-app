<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('elo_usuario_deporte', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('deporte_id')->constrained('deportes')->cascadeOnDelete();
            $table->integer('elo')->default(500);
            $table->timestamps();

            $table->unique(['usuario_id', 'deporte_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('elo_usuario_deporte');
    }
};
