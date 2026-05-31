<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeporteController;
use App\Http\Controllers\Admin\TorneoController;
use App\Http\Controllers\Admin\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect()->route('admin.dashboard'));

Route::prefix('admin')->name('admin.')->group(function () {

    // Puente: valida el token Sanctum de la app React y crea sesión admin
    Route::get('auth', [AuthController::class, 'authViaBearerToken'])->name('auth');

    Route::middleware('admin_auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('deportes', DeporteController::class);
        Route::resource('usuarios', UsuarioController::class);
        Route::post('usuarios/{id}/desbanear', [UsuarioController::class, 'desbanear'])->name('usuarios.desbanear');
        Route::resource('torneos',  TorneoController::class);
    });
});
