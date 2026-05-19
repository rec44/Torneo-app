<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('torneo_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torneo_id')->constrained('torneos')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->integer('semilla')->nullable();
            $table->integer('elo_al_unirse')->nullable();
            $table->timestamps();

            $table->unique(['torneo_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('torneo_usuarios');
    }
};
