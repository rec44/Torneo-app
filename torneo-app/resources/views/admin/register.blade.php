<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro — Torneo App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            background: #1e2a3a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .register-card {
            width: 100%;
            max-width: 420px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
    </style>
</head>
<body>
    <div class="register-card card p-4">
        <div class="text-center mb-4">
            <i class="bi bi-trophy-fill text-warning fs-2"></i>
            <h5 class="fw-bold mt-2 mb-0">Torneo App</h5>
            <small class="text-muted">Crear cuenta</small>
        </div>

        @if($errors->any())
            <div class="alert alert-danger py-2">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('admin.register.post') }}">
            @csrf

            <div class="mb-3">
                <label class="form-label small fw-semibold">Nombre</label>
                <input type="text" name="nombre"
                       class="form-control @error('nombre') is-invalid @enderror"
                       value="{{ old('nombre') }}" autofocus required>
                @error('nombre') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input type="email" name="email"
                       class="form-control @error('email') is-invalid @enderror"
                       value="{{ old('email') }}" required>
                @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="mb-3">
                <label class="form-label small fw-semibold">Contraseña</label>
                <input type="password" name="contrasena"
                       class="form-control @error('contrasena') is-invalid @enderror" required>
                @error('contrasena') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="mb-4">
                <label class="form-label small fw-semibold">Confirmar contraseña</label>
                <input type="password" name="contrasena_confirmation" class="form-control" required>
            </div>

            <button type="submit" class="btn btn-primary w-100">
                <i class="bi bi-person-plus me-1"></i> Crear cuenta
            </button>
        </form>

        <hr class="my-3">
        <p class="text-center text-muted small mb-0">
            ¿Ya tienes cuenta?
            <a href="{{ route('admin.login') }}" class="text-decoration-none">Inicia sesión</a>
        </p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
