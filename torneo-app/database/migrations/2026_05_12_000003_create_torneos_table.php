<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('torneos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('deporte_id')->constrained('deportes')->cascadeOnDelete();
            $table->foreignId('creado_por')->constrained('usuarios')->cascadeOnDelete();
            $table->integer('elo_minimo')->nullable();
            $table->integer('elo_maximo')->nullable();
            $table->integer('max_jugadores');
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->enum('formato', ['eliminacion_simple', 'eliminacion_doble', 'round_robin', 'suizo'])->default('eliminacion_simple');
            $table->enum('estado', ['abierto', 'en_curso', 'finalizado', 'cancelado'])->default('abierto');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('torneos');
    }
};
