@extends('admin.layout')
@section('title', 'Nuevo torneo')

@section('content')

<div class="d-flex align-items-center gap-2 mb-3">
    <a href="{{ route('admin.torneos.index') }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left"></i>
    </a>
    <h5 class="mb-0 fw-semibold">Nuevo torneo</h5>
</div>

<div class="card" style="max-width:680px">
    <div class="card-body">
        <form method="POST" action="{{ route('admin.torneos.store') }}">
            @csrf

            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
                    <input type="text" name="nombre"
                           class="form-control @error('nombre') is-invalid @enderror"
                           value="{{ old('nombre') }}" autofocus>
                    @error('nombre') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Deporte <span class="text-danger">*</span></label>
                    <select name="deporte_id" class="form-select @error('deporte_id') is-invalid @enderror">
                        <option value="">— Seleccionar —</option>
                        @foreach($deportes as $deporte)
                            <option value="{{ $deporte->id }}" @selected(old('deporte_id') == $deporte->id)>
                                {{ $deporte->nombre }}
                            </option>
                        @endforeach
                    </select>
                    @error('deporte_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Organizador <span class="text-danger">*</span></label>
                    <select name="creado_por" class="form-select @error('creado_por') is-invalid @enderror">
                        <option value="">— Seleccionar —</option>
                        @foreach($usuarios as $usuario)
                            <option value="{{ $usuario->id }}" @selected(old('creado_por') == $usuario->id)>
                                {{ $usuario->nombre }}
                            </option>
                        @endforeach
                    </select>
                    @error('creado_por') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Formato <span class="text-danger">*</span></label>
                    <select name="formato" class="form-select @error('formato') is-invalid @enderror">
                        <option value="">— Seleccionar —</option>
                        @foreach($formatos as $valor => $etiqueta)
                            <option value="{{ $valor }}" @selected(old('formato') === $valor)>{{ $etiqueta }}</option>
                        @endforeach
                    </select>
                    @error('formato') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Estado <span class="text-danger">*</span></label>
                    <select name="estado" class="form-select @error('estado') is-invalid @enderror">
                        @foreach($estados as $valor => $etiqueta)
                            <option value="{{ $valor }}" @selected(old('estado', 'abierto') === $valor)>{{ $etiqueta }}</option>
                        @endforeach
                    </select>
                    @error('estado') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-4">
                    <label class="form-label fw-semibold">Max. jugadores <span class="text-danger">*</span></label>
                    <select name="max_jugadores" class="form-select @error('max_jugadores') is-invalid @enderror">
                        @foreach([4, 8, 16, 32, 64] as $n)
                            <option value="{{ $n }}" @selected(old('max_jugadores', 8) == $n)>{{ $n }}</option>
                        @endforeach
                    </select>
                    @error('max_jugadores') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-4">
                    <label class="form-label fw-semibold">ELO mínimo</label>
                    <input type="number" name="elo_minimo"
                           class="form-control @error('elo_minimo') is-invalid @enderror"
                           value="{{ old('elo_minimo', 0) }}" min="0">
                    @error('elo_minimo') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-4">
                    <label class="form-label fw-semibold">ELO máximo</label>
                    <input type="number" name="elo_maximo"
                           class="form-control @error('elo_maximo') is-invalid @enderror"
                           value="{{ old('elo_maximo') }}" min="0">
                    @error('elo_maximo') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Fecha inicio <span class="text-danger">*</span></label>
                    <input type="datetime-local" name="fecha_inicio"
                           class="form-control @error('fecha_inicio') is-invalid @enderror"
                           value="{{ old('fecha_inicio') }}" required>
                    @error('fecha_inicio') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-sm-6">
                    <label class="form-label fw-semibold">Fecha fin</label>
                    <input type="datetime-local" name="fecha_fin"
                           class="form-control @error('fecha_fin') is-invalid @enderror"
                           value="{{ old('fecha_fin') }}">
                    @error('fecha_fin') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-lg me-1"></i> Guardar
                </button>
                <a href="{{ route('admin.torneos.index') }}" class="btn btn-outline-secondary">Cancelar</a>
            </div>
        </form>
    </div>
</div>

@endsection
