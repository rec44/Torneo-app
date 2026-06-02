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
                    <th>Estado</th>
                    <th>Equipos</th>
                    <th>Inicio</th>
                    <th class="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                @forelse($torneos as $torneo)
                    <tr>
                        <td class="text-muted small">{{ $torneo->id }}</td>
                        <td class="fw-semibold">{{ $torneo->nombre }}</td>
                        <td class="text-muted small">{{ $torneo->deporte?->nombre ?? '—' }}</td>
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
                            <a href="{{ config('app.frontend_url') }}/torneos/{{ $torneo->id }}"
                               target="_blank" class="btn btn-sm btn-outline-secondary me-1"
                               title="Ver torneo">
                                <i class="bi bi-eye"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-outline-danger"
                                data-bs-toggle="modal" data-bs-target="#modalEliminar"
                                data-action="{{ route('admin.torneos.destroy', $torneo) }}"
                                data-nombre="{{ $torneo->nombre }}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">No hay torneos registrados.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="card-footer bg-white">{{ $torneos->links() }}</div>
</div>


<div class="modal fade" id="modalEliminar" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header py-2 px-3">
                <h6 class="modal-title fw-semibold">¿Eliminar torneo?</h6>
                <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-3 py-2" style="font-size:.9rem">
                Se eliminará <strong id="modalNombre"></strong> junto con todos sus datos. Esta acción no se puede deshacer.
            </div>
            <div class="modal-footer py-2 px-3 gap-2">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <form id="formEliminar" method="POST" class="m-0">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn btn-sm btn-danger">Sí, eliminar</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('modalEliminar').addEventListener('show.bs.modal', function (e) {
    const btn = e.relatedTarget
    document.getElementById('modalNombre').textContent = btn.dataset.nombre
    document.getElementById('formEliminar').action = btn.dataset.action
})
</script>

@endsection
