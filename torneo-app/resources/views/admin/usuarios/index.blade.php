@extends('admin.layout')
@section('title', 'Usuarios')

@section('content')

<div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0 fw-semibold"><i class="bi bi-people-fill me-2"></i>Usuarios</h5>
    <a href="{{ route('admin.usuarios.create') }}" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i> Nuevo usuario
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead class="table-light">
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>ELO</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th class="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                @forelse($usuarios as $usuario)
                    <tr>
                        <td class="text-muted small">{{ $usuario->id }}</td>
                        <td class="fw-semibold">{{ $usuario->nombre }}</td>
                        <td class="text-muted small">{{ $usuario->email }}</td>
                        <td>
                            <span class="badge bg-light text-dark border">{{ $usuario->elo }}</span>
                        </td>
                        <td>
                            @if($usuario->rol === 'admin')
                                <span class="badge bg-danger">Admin</span>
                            @else
                                <span class="badge bg-secondary">User</span>
                            @endif
                            @if($usuario->trashed())
                                <span class="badge bg-dark ms-1">Baneado</span>
                            @endif
                        </td>
                        <td class="text-muted small">{{ $usuario->created_at->format('d/m/Y') }}</td>
                        <td class="text-end">
                            @if(!$usuario->trashed())
                                <a href="{{ route('admin.usuarios.edit', $usuario) }}"
                                   class="btn btn-sm btn-outline-secondary me-1">
                                    <i class="bi bi-pencil"></i>
                                </a>
                                <button type="button" class="btn btn-sm btn-outline-danger"
                                    data-bs-toggle="modal" data-bs-target="#modalEliminar"
                                    data-action="{{ route('admin.usuarios.destroy', $usuario) }}"
                                    data-nombre="{{ $usuario->nombre }}">
                                    <i class="bi bi-slash-circle"></i> Banear
                                </button>
                            @else
                                <form method="POST"
                                    action="{{ route('admin.usuarios.desbanear', $usuario->id) }}"
                                    class="d-inline">
                                    @csrf
                                    <button type="submit" class="btn btn-sm btn-outline-success">
                                        <i class="bi bi-check-circle"></i> Desbanear
                                    </button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">No hay usuarios registrados.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($usuarios->hasPages())
        <div class="card-footer bg-white">{{ $usuarios->links() }}</div>
    @endif
</div>


<div class="modal fade" id="modalEliminar" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header py-2 px-3">
                <h6 class="modal-title fw-semibold">¿Banear usuario?</h6>
                <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-3 py-2" style="font-size:.9rem">
                <strong id="modalNombre"></strong> no podrá iniciar sesión ni crear torneos. Podrás desbanearlo en cualquier momento.
            </div>
            <div class="modal-footer py-2 px-3 gap-2">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <form id="formEliminar" method="POST" class="m-0">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn btn-sm btn-danger">Sí, banear</button>
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
