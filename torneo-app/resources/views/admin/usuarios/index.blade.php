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
                        </td>
                        <td class="text-muted small">{{ $usuario->created_at->format('d/m/Y') }}</td>
                        <td class="text-end">
                            <a href="{{ route('admin.usuarios.edit', $usuario) }}"
                               class="btn btn-sm btn-outline-secondary me-1">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <form method="POST" action="{{ route('admin.usuarios.destroy', $usuario) }}"
                                  class="d-inline"
                                  onsubmit="return confirm('¿Eliminar al usuario «{{ $usuario->nombre }}»?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
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

@endsection
