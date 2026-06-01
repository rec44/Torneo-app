<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IniciarTorneoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fechas'     => 'required|array|min:1',
            'fechas.*'   => 'required|array|min:1',
            'fechas.*.*' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'fechas.required'     => 'Debes asignar fechas a los partidos.',
            'fechas.*.*required'  => 'Todas las fechas son obligatorias.',
            'fechas.*.*date'      => 'Alguna fecha no tiene un formato válido.',
        ];
    }
}
