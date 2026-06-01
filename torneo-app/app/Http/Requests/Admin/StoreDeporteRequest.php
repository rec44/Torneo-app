<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('deportes', 'nombre')->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del deporte es obligatorio.',
            'nombre.max'      => 'El nombre no puede superar los 100 caracteres.',
            'nombre.unique'   => 'Ya existe un deporte con ese nombre.',
        ];
    }
}
