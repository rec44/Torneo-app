<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTorneoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'        => 'required|string|max:255',
            'deporte_id'    => 'required|exists:deportes,id',
            'elo_minimo'    => 'nullable|integer|min:0',
            'elo_maximo'    => 'nullable|integer|min:0',
            'max_jugadores' => 'required|integer|min:2',
            'min_miembros'  => 'integer|min:1',
            'max_miembros'  => 'nullable|integer|min:1|gte:min_miembros',
            'fecha_inicio'  => 'nullable|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'formato'       => 'required|in:eliminacion_simple,eliminacion_doble,round_robin,suizo',
            'direccion'     => 'required|string|max:255',
            'ciudad'        => 'required|string|max:100',
            'provincia'     => 'required|string|max:100',
        ];
    }
}
