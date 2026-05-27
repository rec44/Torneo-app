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
            $table->foreignId('equipo1_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->foreignId('equipo2_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->foreignId('ganador_equipo_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->string('resultado_e1')->nullable();
            $table->string('resultado_e2')->nullable();
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
