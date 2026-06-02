<?php

use App\Models\Equipo;
use Illuminate\Support\Facades\DB;

// Buscar un usuario que no esté ya en un equipo del torneo 11
$yaEnTorneo = DB::table('equipo_usuarios')
    ->join('equipos', 'equipos.id', '=', 'equipo_usuarios.equipo_id')
    ->where('equipos.torneo_id', 11)
    ->pluck('equipo_usuarios.usuario_id')
    ->toArray();

$usuario = DB::table('usuarios')
    ->whereNotIn('id', $yaEnTorneo)
    ->first();

if (!$usuario) {
    echo "No hay usuarios disponibles.\n";
    return;
}

$eq = Equipo::create([
    'torneo_id'  => 11,
    'nombre'     => 'Coastal Warriors',
    'capitan_id' => $usuario->id,
    'bloqueado'  => true,
    'inscrito'   => true,
]);

$elo = DB::table('elo_usuario_deporte')
    ->where('usuario_id', $usuario->id)
    ->where('deporte_id', 3)
    ->value('elo') ?? 500;

$eq->miembros()->attach($usuario->id, ['elo_al_unirse' => $elo]);

echo "Creado: {$eq->nombre} (ID {$eq->id}) — Capitán: {$usuario->nombre} (ID {$usuario->id})\n";
