@extends('admin.layout')
@section('title', 'Deportes')

@section('content')

<div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0 fw-semibold"><i class="bi bi-dribbble me-2"></i>Deportes</h5>
    <a href="{{ route('admin.deportes.create') }}" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i> Nuevo deporte
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead class="table-light">
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Torneos</th>
                    <th>Creado</th>
                    <th class="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                @forelse($deportes as $deporte)
                    <tr>
                        <td class="text-muted small">{{ $deporte->id }}</td>
                        <td class="fw-semibold">{{ $deporte->nombre }}</td>
                        <td>
                            <span class="badge bg-light text-dark border">{{ $deporte->torneos_count }}</span>
                        </td>
                        <td class="text-muted small">{{ $deporte->created_at->format('d/m/Y') }}</td>
                        <td class="text-end">
                            <a href="{{ route('admin.deportes.edit', $deporte) }}"
                               class="btn btn-sm btn-outline-secondary me-1">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-outline-danger"
                                data-bs-toggle="modal" data-bs-target="#modalEliminar"
                                data-action="{{ route('admin.deportes.destroy', $deporte) }}"
                                data-nombre="{{ $deporte->nombre }}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center text-muted py-4">No hay deportes registrados.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($deportes->hasPages())
        <div class="card-footer bg-white">{{ $deportes->links() }}</div>
    @endif
</div>


<div class="modal fade" id="modalEliminar" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header py-2 px-3">
                <h6 class="modal-title fw-semibold">¿Eliminar deporte?</h6>
                <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-3 py-2" style="font-size:.9rem">
                Se eliminará <strong id="modalNombre"></strong>. Esta acción no se puede deshacer.
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
