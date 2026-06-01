<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistrarResultadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resultado_e1'      => 'required|string|max:50',
            'resultado_e2'      => 'required|string|max:50',
            'ganador_equipo_id' => 'required|exists:equipos,id',
        ];
    }
}
