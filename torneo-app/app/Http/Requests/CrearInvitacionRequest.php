<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CrearInvitacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $torneo = $this->route('torneo');
        $equipo = $this->route('equipo');

        return $this->user()->id === $torneo->creado_por
            || $this->user()->rol === 'admin'
            || ($equipo && $this->user()->id === $equipo->capitan_id);
    }

    public function rules(): array
    {
        return [
            'max_usos'  => 'nullable|integer|min:1',
            'expira_en' => 'nullable|date|after:now',
        ];
    }
}
