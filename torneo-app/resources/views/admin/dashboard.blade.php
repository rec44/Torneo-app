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

{{-- ── Fila secundaria ─────────────────────────────────────────────── --}}
<div class="row g-3">

    {{-- Torneos por formato --}}
    <div class="col-xl-5">
        <div class="card h-100">
            <div class="card-header py-3">
                <i class="bi bi-diagram-3 text-primary me-2"></i><strong>Torneos por formato</strong>
            </div>
            <div class="card-body p-0">
                @php
                    $formatoLabels = [
                        'eliminacion_simple' => 'Eliminación simple',
                        'eliminacion_doble'  => 'Eliminación doble',
                        'round_robin'        => 'Round Robin',
                        'suizo'              => 'Sistema suizo',
                    ];
                    $total = $torneosPorFormato->sum('total');
                @endphp
                @if($torneosPorFormato->isEmpty())
                    <div class="text-muted p-4 text-center">No hay torneos creados.</div>
                @else
                <ul class="list-group list-group-flush">
                    @foreach($torneosPorFormato as $f)
                    <li class="list-group-item d-flex justify-content-between align-items-center px-3 py-2">
                        <span class="small fw-semibold">{{ $formatoLabels[$f->formato] ?? $f->formato }}</span>
                        <span class="badge bg-primary rounded-pill px-3">{{ $f->total }}</span>
                    </li>
                    @endforeach
                    <li class="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-light">
                        <span class="small fw-bold text-muted">Total</span>
                        <span class="badge bg-secondary rounded-pill px-3">{{ $total }}</span>
                    </li>
                </ul>
                @endif
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
