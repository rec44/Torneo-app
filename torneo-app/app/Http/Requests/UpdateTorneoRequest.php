<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTorneoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $torneo = $this->route('torneo');

        return $this->user()->id === $torneo->creado_por
            || $this->user()->rol === 'admin';
    }

    public function rules(): array
    {
        return [
            'nombre'        => 'sometimes|string|max:255',
            'elo_minimo'    => 'nullable|integer|min:0',
            'elo_maximo'    => 'nullable|integer|min:0',
            'max_jugadores' => 'sometimes|integer|min:2',
            'min_miembros'  => 'sometimes|integer|min:1',
            'max_miembros'  => 'nullable|integer|min:1|gte:min_miembros',
            'fecha_inicio'  => 'nullable|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'direccion'     => 'nullable|string|max:255',
            'ciudad'        => 'nullable|string|max:100',
            'provincia'     => 'nullable|string|max:100',
        ];
    }
}
