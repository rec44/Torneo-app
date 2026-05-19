@extends('admin.layout')
@section('title', 'Editar deporte')

@section('content')

<div class="d-flex align-items-center gap-2 mb-3">
    <a href="{{ route('admin.deportes.index') }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left"></i>
    </a>
    <h5 class="mb-0 fw-semibold">Editar deporte</h5>
</div>

<div class="card" style="max-width:480px">
    <div class="card-body">
        <form method="POST" action="{{ route('admin.deportes.update', $deporte) }}">
            @csrf @method('PUT')

            <div class="mb-3">
                <label class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
                <input type="text" name="nombre"
                       class="form-control @error('nombre') is-invalid @enderror"
                       value="{{ old('nombre', $deporte->nombre) }}" autofocus>
                @error('nombre')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-lg me-1"></i> Actualizar
                </button>
                <a href="{{ route('admin.deportes.index') }}" class="btn btn-outline-secondary">Cancelar</a>
            </div>
        </form>
    </div>
</div>

@endsection
