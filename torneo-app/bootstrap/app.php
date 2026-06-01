<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'auth'       => \App\Http\Middleware\Authenticate::class,
            'es_admin'   => \App\Http\Middleware\EsAdmin::class,
            'admin_auth' => \App\Http\Middleware\AdminAuth::class,
        ]);

        // El token Sanctum ya actúa como credencial; CSRF no aplica en este puente cross-origin
        $middleware->validateCsrfTokens(except: ['admin/auth']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
