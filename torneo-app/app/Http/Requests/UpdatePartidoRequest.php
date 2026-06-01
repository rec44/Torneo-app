<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'programado_en' => 'nullable|date',
            'estado'        => 'sometimes|in:pendiente,en_curso,cancelado',
        ];
    }
}
