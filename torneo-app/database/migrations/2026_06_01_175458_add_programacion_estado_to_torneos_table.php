<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE torneos MODIFY COLUMN estado ENUM('abierto','programacion','en_curso','finalizado') NOT NULL DEFAULT 'abierto'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE torneos MODIFY COLUMN estado ENUM('abierto','en_curso','finalizado') NOT NULL DEFAULT 'abierto'");
    }
};
