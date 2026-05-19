@extends('admin.layout')
@section('title', 'Dashboard')

@section('content')

<div class="row g-3 mb-4">
    <div class="col-sm-6 col-xl-3">
        <div class="card stat-card blue p-3">
            <div class="text-muted small">Deportes</div>
            <div class="fs-3 fw-bold">{{ $totalDeportes }}</div>
            <a href="{{ route('admin.deportes.index') }}" class="small text-decoration-none">Ver todos <i class="bi bi-arrow-right"></i></a>
        </div>
    </div>
    <div class="col-sm-6 col-xl-3">
        <div class="card stat-card green p-3">
            <div class="text-muted small">Usuarios</div>
            <div class="fs-3 fw-bold">{{ $totalUsuarios }}</div>
            <a href="{{ route('admin.usuarios.index') }}" class="small text-decoration-none">Ver todos <i class="bi bi-arrow-right"></i></a>
        </div>
    </div>
    <div class="col-sm-6 col-xl-3">
        <div class="card stat-card orange p-3">
            <div class="text-muted small">Torneos</div>
            <div class="fs-3 fw-bold">{{ $totalTorneos }}</div>
            <a href="{{ route('admin.torneos.index') }}" class="small text-decoration-none">Ver todos <i class="bi bi-arrow-right"></i></a>
        </div>
    </div>
    <div class="col-sm-6 col-xl-3">
        <div class="card stat-card purple p-3">
            <div class="text-muted small">Partidos</div>
            <div class="fs-3 fw-bold">{{ $totalPartidos }}</div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header py-3">
        <i class="bi bi-bar-chart-fill me-2 text-warning"></i>Torneos por estado
    </div>
    <div class="card-body">
        @php
            $estados = ['abierto' => 'Abierto', 'en_curso' => 'En curso', 'finalizado' => 'Finalizado', 'cancelado' => 'Cancelado'];
        @endphp
        @foreach($estados as $clave => $etiqueta)
            @php $n = (int)($torneosPorEstado[$clave] ?? 0); @endphp
            <div class="d-flex align-items-center mb-3">
                <span class="me-3" style="width:110px">
                    <span class="badge rounded-pill badge-estado-{{ $clave }} px-3 py-2">{{ $etiqueta }}</span>
                </span>
                <div class="flex-grow-1">
                    <div class="progress" style="height:20px">
                        <div class="progress-bar" role="progressbar"
                             style="width: {{ $totalTorneos > 0 ? round(($n / $totalTorneos) * 100) : 0 }}%"
                             aria-valuenow="{{ $n }}" aria-valuemin="0" aria-valuemax="{{ $totalTorneos }}">
                        </div>
                    </div>
                </div>
                <span class="ms-3 fw-semibold text-end" style="width:30px">{{ $n }}</span>
            </div>
        @endforeach
    </div>
</div>

@endsection
