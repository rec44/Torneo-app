<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ya protegido por middleware es_admin en la ruta
    }

    public function rules(): array
    {
        $deporte = $this->route('deporte');

        return [
            'nombre' => 'required|string|max:100|unique:deportes,nombre,' . $deporte->id,
        ];
    }
}
