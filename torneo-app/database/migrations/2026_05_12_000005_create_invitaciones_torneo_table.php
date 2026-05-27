<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitaciones_torneo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torneo_id')->constrained('torneos')->cascadeOnDelete();
            $table->foreignId('equipo_id')->constrained('equipos')->cascadeOnDelete();
            $table->string('codigo', 32)->unique();
            $table->unsignedInteger('max_usos')->nullable();
            $table->unsignedInteger('usos_actuales')->default(0);
            $table->timestamp('expira_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitaciones_torneo');
    }
};
