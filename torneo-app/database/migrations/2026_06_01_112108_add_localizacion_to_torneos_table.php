<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->string('direccion')->nullable()->after('estado');
            $table->string('ciudad')->nullable()->after('direccion');
            $table->string('provincia')->nullable()->after('ciudad');
        });
    }

    public function down(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'ciudad', 'provincia']);
        });
    }
};
