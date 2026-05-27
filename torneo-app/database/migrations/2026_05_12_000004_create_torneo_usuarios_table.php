<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torneo_id')->constrained('torneos')->cascadeOnDelete();
            $table->string('nombre');
            $table->foreignId('capitan_id')->constrained('usuarios')->cascadeOnDelete();
            $table->integer('semilla')->nullable();
            $table->timestamps();
        });

        Schema::create('equipo_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->integer('elo_al_unirse')->nullable();
            $table->timestamps();

            $table->unique(['equipo_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_usuarios');
        Schema::dropIfExists('equipos');
    }
};
