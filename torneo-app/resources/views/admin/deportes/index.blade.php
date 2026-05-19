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
                            <form method="POST" action="{{ route('admin.deportes.destroy', $deporte) }}"
                                  class="d-inline"
                                  onsubmit="return confirm('¿Eliminar el deporte «{{ $deporte->nombre }}»?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
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

@endsection
