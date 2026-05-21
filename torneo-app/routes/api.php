<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeporteController;
use App\Http\Controllers\Api\PartidoController;
use App\Http\Controllers\Api\TorneoController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

// Rutas públicas — autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas públicas — lectura
Route::apiResource('deportes', DeporteController::class)->only(['index', 'show']);
Route::apiResource('torneos',  TorneoController::class)->only(['index', 'show']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Deportes (escritura — solo admin)
    Route::middleware('es_admin')->group(function () {
        Route::apiResource('deportes', DeporteController::class)->only(['store', 'update', 'destroy']);
    });

    // Usuarios
    Route::apiResource('usuarios', UsuarioController::class);

    // Torneos (escritura)
    Route::apiResource('torneos', TorneoController::class)->only(['store', 'update', 'destroy']);
    Route::post('torneos/{torneo}/unirse',    [TorneoController::class, 'unirse']);
    Route::post('torneos/{torneo}/iniciar',   [TorneoController::class, 'iniciar']);
    Route::post('torneos/{torneo}/invitacion',[TorneoController::class, 'crearInvitacion']);
    Route::post('torneos/unirse-codigo',      [TorneoController::class, 'unirsePorCodigo']);

    // Partidos
    Route::apiResource('partidos', PartidoController::class)->except(['store']);
    Route::patch('partidos/{partido}/resultado', [PartidoController::class, 'registrarResultado']);
});
