<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeporteController;
use App\Http\Controllers\Api\EquipoController;
use App\Http\Controllers\Api\PartidoController;
use App\Http\Controllers\Api\TorneoController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

// Autenticación pública
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Lectura pública
Route::apiResource('deportes', DeporteController::class)->only(['index', 'show']);
Route::apiResource('torneos',  TorneoController::class)->only(['index', 'show']);
Route::get('torneos/{torneo}/equipos',            [EquipoController::class, 'index']);
Route::get('torneos/{torneo}/equipos/{equipo}',   [EquipoController::class, 'show']);
Route::get('invitaciones/{codigo}',               [EquipoController::class, 'infoInvitacion']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Deportes (escritura — solo admin)
    Route::middleware('es_admin')->group(function () {
        Route::apiResource('deportes', DeporteController::class)->only(['store', 'update', 'destroy']);
        Route::post('deportes/{id}/restaurar', [DeporteController::class, 'restaurar']);
    });

    // Usuarios — lectura y edición propia (autenticado)
    Route::get('usuarios/{usuario}',    [UsuarioController::class, 'show']);
    Route::put('usuarios/{usuario}',    [UsuarioController::class, 'update']);
    Route::patch('usuarios/{usuario}',  [UsuarioController::class, 'update']);

    // Usuarios — gestión (solo admin)
    Route::middleware('es_admin')->group(function () {
        Route::get('usuarios',                        [UsuarioController::class, 'index']);
        Route::delete('usuarios/{usuario}',           [UsuarioController::class, 'destroy']);
        Route::post('usuarios/{id}/desbanear',        [UsuarioController::class, 'desbanear']);
    });

    // Torneos (escritura)
    Route::get('mis-torneos', [TorneoController::class, 'misTorneos']);
    Route::apiResource('torneos', TorneoController::class)->only(['store', 'update', 'destroy']);
    Route::post('torneos/{torneo}/iniciar',   [TorneoController::class, 'iniciar']);
    Route::post('torneos/{torneo}/confirmar', [TorneoController::class, 'confirmar']);

    // Equipos
    Route::post('torneos/{torneo}/equipos',                              [EquipoController::class, 'store']);
    Route::patch('torneos/{torneo}/equipos/{equipo}',                    [EquipoController::class, 'update']);
    Route::delete('torneos/{torneo}/equipos/{equipo}',                   [EquipoController::class, 'destroy']);
    Route::post('torneos/{torneo}/equipos/{equipo}/unirse',              [EquipoController::class, 'unirse']);
    Route::get('torneos/{torneo}/equipos/{equipo}/invitacion',           [EquipoController::class, 'mostrarInvitacion']);
    Route::post('torneos/{torneo}/equipos/{equipo}/invitacion',          [EquipoController::class, 'crearInvitacion']);
    Route::delete('torneos/{torneo}/equipos/{equipo}/miembros/{usuario}', [EquipoController::class, 'expulsarMiembro']);
    Route::patch('torneos/{torneo}/equipos/{equipo}/lock',               [EquipoController::class, 'toggleLock']);
    Route::post('torneos/{torneo}/equipos/{equipo}/escudo',              [EquipoController::class, 'updateEscudo']);
    Route::post('equipos/unirse-codigo',                                 [EquipoController::class, 'unirsePorCodigo']);

    // Partidos
    Route::apiResource('partidos', PartidoController::class)->except(['store']);
    Route::patch('partidos/{partido}/resultado', [PartidoController::class, 'registrarResultado']);
});
