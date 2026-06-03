<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioPublicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'nombre'        => $this->nombre,
            'elo'           => $this->elo,
            'elo_al_unirse' => $this->whenPivotLoaded('equipo_usuarios', fn () => $this->pivot->elo_al_unirse),
        ];
    }
}
