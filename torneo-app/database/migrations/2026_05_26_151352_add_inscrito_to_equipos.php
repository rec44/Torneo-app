<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            $table->boolean('inscrito')->default(false)->after('bloqueado');
        });
    }

    public function down(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            $table->dropColumn('inscrito');
        });
    }
};
