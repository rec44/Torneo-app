<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            $table->boolean('bloqueado')->default(false)->after('semilla');
        });
    }

    public function down(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            $table->dropColumn('bloqueado');
        });
    }
};
