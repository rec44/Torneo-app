@extends('admin.layout')
@section('title', 'Dashboard')

@section('content')

{{-- ── Pills de estado rápido ──────────────────────────────────────── --}}
<div class="d-flex flex-wrap gap-2 mb-4">

    @if($torneosEnCurso > 0)
    <a href="{{ route('admin.torneos.index') }}?estado=en_curso" class="text-decoration-none">
        <span class="badge rounded-pill fs-6 px-3 py-2 bg-success bg-opacity-10 text-success border border-success border-opacity-25">
            <i class="bi bi-play-circle-fill me-1"></i>{{ $torneosEnCurso }} en curso
        </span>
    </a>
    @endif

    @if($torneosProgramacion > 0)
    <span class="badge rounded-pill fs-6 px-3 py-2 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
        <i class="bi bi-calendar-check me-1"></i>{{ $torneosProgramacion }} en programación
    </span>
    @endif

    @if($torneosAbiertos > 0)
    <a href="{{ route('admin.torneos.index') }}?estado=abierto" class="text-decoration-none">
        <span class="badge rounded-pill fs-6 px-3 py-2 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
            <i class="bi bi-door-open me-1"></i>{{ $torneosAbiertos }} abiertos
        </span>
    </a>
    @endif

    @if($usuariosEstaSemanana > 0)
    <a href="{{ route('admin.usuarios.index') }}" class="text-decoration-none">
        <span class="badge rounded-pill fs-6 px-3 py-2 bg-info bg-opacity-10 text-info border border-info border-opacity-25">
            <i class="bi bi-person-plus me-1"></i>+{{ $usuariosEstaSemanana }} usuario{{ $usuariosEstaSemanana !== 1 ? 's' : '' }} esta semana
        </span>
    </a>
    @endif

    @if($jobsFallidos > 0)
    <span class="badge rounded-pill fs-6 px-3 py-2 bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
        <i class="bi bi-envelope-exclamation me-1"></i>{{ $jobsFallidos }} {{ $jobsFallidos === 1 ? 'email fallido' : 'emails fallidos' }}
    </span>
    @endif

</div>

{{-- ── Fila principal ───────────────────────────────────────────────── --}}
<div class="row g-3 mb-3">

    {{-- Torneos que necesitan acción --}}
    <div class="col-xl-6">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center py-3">
                <span><i class="bi bi-exclamation-circle text-warning me-2"></i><strong>Torneos que necesitan acción</strong></span>
            </div>
            <div class="card-body p-0">

                @if($torneosParaConfirmar->isEmpty() && $torneosListosParaIniciar->isEmpty())
                    <div class="text-muted p-4 text-center">
                        <i class="bi bi-check2-circle fs-2 d-block mb-2 text-success opacity-50"></i>
                        Todo en orden, no hay torneos pendientes de acción.
                    </div>
                @else

                    @if($torneosParaConfirmar->isNotEmpty())
                    <div class="px-3 pt-3 pb-1">
                        <p class="text-muted small fw-semibold text-uppercase mb-2" style="letter-spacing:.05em">
                            Pendientes de confirmar ({{ $torneosParaConfirmar->count() }})
                        </p>
                    </div>
                    <ul class="list-group list-group-flush">
                        @foreach($torneosParaConfirmar as $t)
                        <li class="list-group-item px-3 py-2 d-flex justify-content-between align-items-start">
                            <div>
                                <a href="{{ route('admin.torneos.edit', $t) }}" class="fw-semibold text-decoration-none">{{ $t->nombre }}</a>
                                <div class="text-muted small">
                                    {{ $t->deporte?->nombre }} · Organiza <strong>{{ $t->creadoPor?->nombre }}</strong>
                                </div>
                            </div>
                            <div class="text-end">
                                @if($t->partidos_sin_fecha > 0)
                                    <span class="badge bg-danger rounded-pill">{{ $t->partidos_sin_fecha }} sin fecha</span>
                                @else
                                    <span class="badge bg-success rounded-pill">Listo para confirmar</span>
                                @endif
                            </div>
                        </li>
                        @endforeach
                    </ul>
                    @endif

                    @if($torneosListosParaIniciar->isNotEmpty())
                    <div class="px-3 pt-3 pb-1 {{ $torneosParaConfirmar->isNotEmpty() ? 'border-top mt-1' : '' }}">
                        <p class="text-muted small fw-semibold text-uppercase mb-2" style="letter-spacing:.05em">
                            Con equipos suficientes para iniciar ({{ $torneosListosParaIniciar->count() }})
                        </p>
                    </div>
                    <ul class="list-group list-group-flush">
                        @foreach($torneosListosParaIniciar as $t)
                        <li class="list-group-item px-3 py-2 d-flex justify-content-between align-items-start">
                            <div>
                                <a href="{{ route('admin.torneos.edit', $t) }}" class="fw-semibold text-decoration-none">{{ $t->nombre }}</a>
                                <div class="text-muted small">{{ $t->deporte?->nombre }}</div>
                            </div>
                            <span class="badge bg-success-subtle text-success-emphasis rounded-pill border border-success-subtle">
                                {{ $t->equipos_confirmados }}/{{ $t->max_jugadores }} equipos
                            </span>
                        </li>
                        @endforeach
                    </ul>
                    @endif

                @endif
            </div>
        </div>
    </div>

    {{-- Próximos partidos --}}
    <div class="col-xl-6">
        <div class="card h-100">
            <div class="card-header py-3">
                <i class="bi bi-calendar3 text-primary me-2"></i><strong>Próximos partidos</strong>
            </div>
            <div class="card-body p-0">
                @if($proximosPartidos->isEmpty())
                    <div class="text-muted p-4 text-center">
                        <i class="bi bi-calendar-x fs-2 d-block mb-2 opacity-25"></i>
                        No hay partidos programados próximamente.
                    </div>
                @else
                <div class="table-responsive">
                    <table class="table table-hover table-sm mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-3">Fecha</th>
                                <th>Enfrentamiento</th>
                                <th class="pe-3 text-end">Torneo</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($proximosPartidos as $p)
                            <tr>
                                <td class="ps-3 text-nowrap">
                                    <div class="fw-semibold small">{{ \Carbon\Carbon::parse($p->programado_en)->format('d M') }}</div>
                                    <div class="text-muted" style="font-size:.75rem">{{ \Carbon\Carbon::parse($p->programado_en)->format('H:i') }}</div>
                                </td>
                                <td>
                                    <div class="small">
                                        <span class="{{ is_null($p->equipo1) ? 'text-muted fst-italic' : '' }}">{{ $p->equipo1?->nombre ?? 'Por definir' }}</span>
                                        <span class="text-muted mx-1">vs</span>
                                        <span class="{{ is_null($p->equipo2) ? 'text-muted fst-italic' : '' }}">{{ $p->equipo2?->nombre ?? 'Por definir' }}</span>
                                    </div>
                                    <div class="text-muted" style="font-size:.72rem">Ronda {{ $p->ronda }}</div>
                                </td>
                                <td class="pe-3 text-end">
                                    <a href="{{ route('admin.torneos.edit', $p->torneo_id) }}" class="small text-decoration-none text-muted">
                                        {{ $p->torneo?->nombre }}
                                    </a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @endif
            </div>
        </div>
    </div>

</div>

{{-- ── Fila secundaria ─────────────────────────────────────────────── --}}
<div class="row g-3">

    {{-- Ranking ELO --}}
    <div class="col-xl-5">
        <div class="card h-100">
            <div class="card-header py-3">
                <i class="bi bi-bar-chart-steps text-warning me-2"></i><strong>Ranking ELO</strong>
            </div>
            <div class="card-body p-0">
                <ol class="list-group list-group-flush list-group-numbered">
                    @foreach($topJugadores as $i => $u)
                    <li class="list-group-item d-flex justify-content-between align-items-center px-3 py-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-semibold small">{{ $u->nombre }}</span>
                            @if($u->rol === 'admin')
                                <span class="badge bg-secondary rounded-pill" style="font-size:.65rem">admin</span>
                            @endif
                        </div>
                        <span class="badge rounded-pill px-3 py-1
                            {{ $i === 0 ? 'bg-warning text-dark' : ($i === 1 ? 'bg-light text-dark border' : ($i === 2 ? 'bg-warning bg-opacity-25 text-dark' : 'bg-light text-muted border')) }}">
                            {{ $u->elo }} ELO
                        </span>
                    </li>
                    @endforeach
                </ol>
            </div>
        </div>
    </div>

    {{-- Usuarios baneados recientes --}}
    <div class="col-xl-7">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center py-3">
                <span><i class="bi bi-person-slash text-danger me-2"></i><strong>Usuarios baneados recientemente</strong></span>
                <a href="{{ route('admin.usuarios.index') }}" class="btn btn-sm btn-outline-secondary">Ver todos</a>
            </div>
            <div class="card-body p-0">
                @if($usuariosBaneados->isEmpty())
                    <div class="text-muted p-4 text-center">
                        <i class="bi bi-shield-check fs-2 d-block mb-2 text-success opacity-50"></i>
                        No hay usuarios baneados.
                    </div>
                @else
                <div class="table-responsive">
                    <table class="table table-hover table-sm mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-3">Usuario</th>
                                <th>Email</th>
                                <th class="pe-3 text-end">Baneado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($usuariosBaneados as $u)
                            <tr>
                                <td class="ps-3 fw-semibold small">{{ $u->nombre }}</td>
                                <td class="text-muted small">{{ $u->email }}</td>
                                <td class="pe-3 text-end text-muted small text-nowrap">
                                    {{ \Carbon\Carbon::parse($u->deleted_at)->diffForHumans() }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @endif
            </div>
        </div>
    </div>

</div>

@endsection
