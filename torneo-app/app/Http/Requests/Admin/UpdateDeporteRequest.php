<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('deporte')->id;

        return [
            'nombre' => "required|string|max:100|unique:deportes,nombre,{$id}",
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
