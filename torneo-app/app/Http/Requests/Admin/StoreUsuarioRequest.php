<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'     => 'required|string|max:255',
            'email'      => 'required|email|unique:usuarios,email',
            'contrasena' => 'required|string|min:8|confirmed',
            'elo'        => 'nullable|integer|min:0',
            'rol'        => 'required|in:user,admin',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'      => 'El nombre del usuario es obligatorio.',
            'nombre.max'           => 'El nombre no puede superar los 255 caracteres.',
            'email.required'       => 'El email es obligatorio.',
            'email.email'          => 'El email no tiene un formato válido.',
            'email.unique'         => 'Ya existe un usuario registrado con ese email.',
            'contrasena.required'  => 'La contraseña es obligatoria.',
            'contrasena.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.confirmed' => 'Las contraseñas no coinciden.',
            'elo.integer'          => 'El ELO debe ser un número entero.',
            'elo.min'              => 'El ELO no puede ser negativo.',
            'rol.required'         => 'El rol es obligatorio.',
            'rol.in'               => 'El rol debe ser "usuario" o "administrador".',
        ];
    }
}
