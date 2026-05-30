@extends('admin.layout')
@section('title', 'Torneos')

@section('content')

<div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0 fw-semibold"><i class="bi bi-calendar2-event me-2"></i>Torneos</h5>
    <a href="{{ route('admin.torneos.create') }}" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i> Nuevo torneo
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead class="table-light">
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Deporte</th>
                    <th>Formato</th>
                    <th>Estado</th>
                    <th>Jugadores</th>
                    <th>Inicio</th>
                    <th class="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                @forelse($torneos as $torneo)
                    <tr>
                        <td class="text-muted small">{{ $torneo->id }}</td>
                        <td class="fw-semibold">{{ $torneo->nombre }}</td>
                        <td class="text-muted small">{{ $torneo->deporte->nombre }}</td>
                        <td class="text-muted small">{{ str_replace('_', ' ', $torneo->formato) }}</td>
                        <td>
                            <span class="badge rounded-pill badge-estado-{{ $torneo->estado }} px-2 py-1">
                                {{ ucfirst(str_replace('_', ' ', $torneo->estado)) }}
                            </span>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">
                                {{ $torneo->equipos_count }}/{{ $torneo->max_jugadores }}
                            </span>
                        </td>
                        <td class="text-muted small">
                            {{ $torneo->fecha_inicio ? $torneo->fecha_inicio->format('d/m/Y') : '—' }}
                        </td>
                        <td class="text-end">
                            <a href="{{ route('admin.torneos.edit', $torneo) }}"
                               class="btn btn-sm btn-outline-secondary me-1">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <form method="POST" action="{{ route('admin.torneos.destroy', $torneo) }}"
                                  class="d-inline"
                                  onsubmit="return confirm('¿Eliminar el torneo «{{ $torneo->nombre }}»?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center text-muted py-4">No hay torneos registrados.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($torneos->hasPages())
        <div class="card-footer bg-white">{{ $torneos->links() }}</div>
    @endif
</div>

@endsection
