<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'torneo_id'      => $this->torneo_id,
            'nombre'         => $this->nombre,
            'escudo_url'     => $this->escudo_url,
            'capitan_id'     => $this->capitan_id,
            'capitan'        => new UsuarioPublicoResource($this->whenLoaded('capitan')),
            'semilla'        => $this->semilla,
            'bloqueado'      => $this->bloqueado,
            'inscrito'       => $this->inscrito,
            'miembros_count' => $this->whenCounted('miembros'),
            'miembros'       => UsuarioPublicoResource::collection($this->whenLoaded('miembros')),
        ];
    }
}
