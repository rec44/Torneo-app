<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CrearInvitacionRequest extends FormRequest
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
            'max_usos'  => 'nullable|integer|min:1',
            'expira_en' => 'nullable|date|after:now',
        ];
    }
}
