<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Panel Admin') — Torneo App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { background-color: #f5f6fa; }

        .sidebar {
            width: 240px;
            min-height: 100vh;
            background: #1e2a3a;
            position: fixed;
            top: 0; left: 0;
            display: flex;
            flex-direction: column;
        }

        .sidebar .brand {
            padding: 1.5rem 1.25rem 1rem;
            color: #fff;
            font-size: 1.1rem;
            font-weight: 700;
            border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .sidebar .brand small {
            display: block;
            font-size: .7rem;
            font-weight: 400;
            opacity: .6;
            margin-top: 2px;
        }

        .sidebar .nav-link {
            color: rgba(255,255,255,.7);
            padding: .55rem 1.25rem;
            border-radius: 0;
            display: flex;
            align-items: center;
            gap: .6rem;
            font-size: .9rem;
            transition: background .15s, color .15s;
        }

        .sidebar .nav-link:hover,
        .sidebar .nav-link.active {
            background: rgba(255,255,255,.08);
            color: #fff;
        }

        .sidebar .nav-link.active {
            border-left: 3px solid #4e9af1;
        }

        .sidebar .nav-section {
            padding: .75rem 1.25rem .3rem;
            font-size: .7rem;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: rgba(255,255,255,.35);
        }

        .sidebar-footer {
            margin-top: auto;
            padding: 1rem 1.25rem;
            border-top: 1px solid rgba(255,255,255,.1);
        }

        .main-wrapper {
            margin-left: 240px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .topbar {
            background: #fff;
            border-bottom: 1px solid #e2e8f0;
            padding: .75rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .page-content {
            padding: 1.75rem 1.5rem;
            flex: 1;
        }

        .card { border: none; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .card-header { background: #fff; border-bottom: 1px solid #e2e8f0; font-weight: 600; }

        .stat-card { border-left: 4px solid; }
        .stat-card.blue   { border-color: #4e9af1; }
        .stat-card.green  { border-color: #34c97b; }
        .stat-card.orange { border-color: #f6a623; }
        .stat-card.purple { border-color: #8b5cf6; }

        .badge-estado-abierto    { background-color: #d1fae5; color: #065f46; }
        .badge-estado-en_curso   { background-color: #dbeafe; color: #1e40af; }
        .badge-estado-finalizado { background-color: #f3f4f6; color: #374151; }

        .table th { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; }
        .table td { vertical-align: middle; }
    </style>
</head>
<body>

<div class="sidebar">
    <div class="brand">
        <i class="bi bi-trophy-fill text-warning"></i> Depachanga 2
        <small>Panel de administración</small>
    </div>

    <nav class="mt-2">
        <div class="nav-section">General</div>
        <a href="{{ route('admin.dashboard') }}"
           class="nav-link @if(request()->routeIs('admin.dashboard')) active @endif">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>

        <div class="nav-section mt-2">Maestros</div>
        <a href="{{ route('admin.deportes.index') }}"
           class="nav-link @if(request()->routeIs('admin.deportes.*')) active @endif">
            <i class="bi bi-dribbble"></i> Deportes
        </a>
        <a href="{{ route('admin.usuarios.index') }}"
           class="nav-link @if(request()->routeIs('admin.usuarios.*')) active @endif">
            <i class="bi bi-people-fill"></i> Usuarios
        </a>
        <a href="{{ route('admin.torneos.index') }}"
           class="nav-link @if(request()->routeIs('admin.torneos.*')) active @endif">
            <i class="bi bi-calendar2-event"></i> Torneos
        </a>
    </nav>

    <div class="sidebar-footer">
        <div class="text-white-50 small mb-2">
            <i class="bi bi-person-circle me-1"></i>
            {{ Auth::user()->nombre }}
        </div>
        <form method="POST" action="{{ route('admin.logout') }}">
            @csrf
            <button class="btn btn-sm btn-outline-secondary w-100 text-white border-secondary">
                <i class="bi bi-box-arrow-left me-1"></i> Cerrar sesión
            </button>
        </form>
    </div>
</div>

<div class="main-wrapper">
    <div class="topbar">
        <h6 class="mb-0 fw-semibold text-secondary">@yield('title', 'Dashboard')</h6>
        <div class="d-flex align-items-center gap-3">
            <span class="text-muted small"><i class="bi bi-shield-check me-1 text-success"></i>Admin</span>
            <form method="POST" action="{{ route('admin.logout') }}" class="m-0">
                @csrf
                <button type="submit" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-box-arrow-right me-1"></i>Salir
                </button>
            </form>
        </div>
    </div>

    <div class="page-content">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif

        @yield('content')
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
