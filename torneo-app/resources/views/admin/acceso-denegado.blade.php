<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso restringido — riseCup Admin</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { background: #f5f6fa; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { border: none; box-shadow: 0 4px 24px rgba(0,0,0,.08); border-radius: 16px; max-width: 440px; width: 100%; }
    </style>
</head>
<body>
    <div class="card p-5 text-center">
        <div class="mb-4">
            <i class="bi bi-shield-lock-fill text-danger" style="font-size: 3rem;"></i>
        </div>
        <h4 class="fw-bold mb-2">Acceso restringido</h4>
        <p class="text-muted mb-4">{{ $mensaje }}</p>
        <a href="http://localhost:5173" class="btn btn-dark">
            <i class="bi bi-arrow-left me-2"></i>Volver a riseCup
        </a>
    </div>
</body>
</html>
