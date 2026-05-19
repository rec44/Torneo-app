<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeporteController;
use App\Http\Controllers\Admin\TorneoController;
use App\Http\Controllers\Admin\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect()->route('admin.login'));

Route::prefix('admin')->name('admin.')->group(function () {

    Route::get('login',    [AuthController::class, 'showLogin'])->name('login');
    Route::post('login',   [AuthController::class, 'login'])->name('login.post');
    Route::get('register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('register',[AuthController::class, 'register'])->name('register.post');

    Route::middleware('admin_auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('deportes', DeporteController::class);
        Route::resource('usuarios', UsuarioController::class);
        Route::resource('torneos',  TorneoController::class);
    });
});
