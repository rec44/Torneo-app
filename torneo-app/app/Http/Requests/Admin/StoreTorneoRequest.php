<?php

namespace App\Http\Requests\Admin;

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
            'creado_por'    => 'required|exists:usuarios,id',
            'elo_minimo'    => 'nullable|integer|min:0',
            'elo_maximo'    => 'nullable|integer|min:0|gte:elo_minimo',
            'max_jugadores' => 'required|integer|in:4,8,16,32,64',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'formato'       => 'required|in:eliminacion_simple,eliminacion_doble,round_robin,suizo',
            'estado'        => 'required|in:abierto,programacion,en_curso,finalizado',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'          => 'El nombre del torneo es obligatorio.',
            'nombre.max'               => 'El nombre no puede superar los 255 caracteres.',
            'deporte_id.required'      => 'Debes seleccionar un deporte.',
            'deporte_id.exists'        => 'El deporte seleccionado no existe.',
            'creado_por.required'      => 'Debes seleccionar un organizador.',
            'creado_por.exists'        => 'El organizador seleccionado no existe.',
            'elo_minimo.integer'       => 'El ELO mínimo debe ser un número entero.',
            'elo_minimo.min'           => 'El ELO mínimo no puede ser negativo.',
            'elo_maximo.integer'       => 'El ELO máximo debe ser un número entero.',
            'elo_maximo.min'           => 'El ELO máximo no puede ser negativo.',
            'elo_maximo.gte'           => 'El ELO máximo debe ser mayor o igual al ELO mínimo.',
            'max_jugadores.required'   => 'El número máximo de jugadores es obligatorio.',
            'max_jugadores.in'         => 'El número de jugadores debe ser 4, 8, 16, 32 o 64.',
            'fecha_inicio.required'    => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date'        => 'La fecha de inicio no tiene un formato válido.',
            'fecha_fin.date'           => 'La fecha de fin no tiene un formato válido.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'formato.required'         => 'Debes seleccionar un formato de torneo.',
            'formato.in'               => 'El formato seleccionado no es válido.',
            'estado.required'          => 'Debes seleccionar el estado del torneo.',
            'estado.in'                => 'El estado seleccionado no es válido.',
        ];
    }
}
