<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TorneoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nombre'         => $this->nombre,
            'deporte_id'     => $this->deporte_id,
            'deporte'        => new DeporteResource($this->whenLoaded('deporte')),
            'creado_por'     => $this->creado_por,
            'organizador'    => new UsuarioPublicoResource($this->whenLoaded('creadoPor')),
            'elo_minimo'     => $this->elo_minimo,
            'elo_maximo'     => $this->elo_maximo,
            'max_jugadores'  => $this->max_jugadores,
            'min_miembros'   => $this->min_miembros,
            'max_miembros'   => $this->max_miembros,
            'fecha_inicio'   => $this->fecha_inicio,
            'fecha_fin'      => $this->fecha_fin,
            'formato'        => $this->formato,
            'estado'         => $this->estado,
            'direccion'      => $this->direccion,
            'ciudad'         => $this->ciudad,
            'provincia'      => $this->provincia,
            'equipos_count'  => $this->whenCounted('equipos'),
            'equipos'        => EquipoResource::collection($this->whenLoaded('equipos')),
            'partidos'       => PartidoResource::collection($this->whenLoaded('partidos')),
            'created_at'     => $this->created_at,
        ];
    }
}
