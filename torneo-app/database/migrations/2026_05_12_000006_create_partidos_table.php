<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torneo_id')->constrained('torneos')->cascadeOnDelete();
            $table->foreignId('jugador1_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('jugador2_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('ganador_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('resultado_j1')->nullable();
            $table->string('resultado_j2')->nullable();
            $table->enum('estado', ['pendiente', 'en_curso', 'finalizado', 'cancelado'])->default('pendiente');
            $table->integer('ronda');
            $table->dateTime('programado_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partidos');
    }
};
