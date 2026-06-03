<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'torneo_id'         => $this->torneo_id,
            'torneo'            => new TorneoResource($this->whenLoaded('torneo')),
            'equipo1_id'        => $this->equipo1_id,
            'equipo1'           => new EquipoResource($this->whenLoaded('equipo1')),
            'equipo2_id'        => $this->equipo2_id,
            'equipo2'           => new EquipoResource($this->whenLoaded('equipo2')),
            'ganador_equipo_id' => $this->ganador_equipo_id,
            'ganador'           => new EquipoResource($this->whenLoaded('ganadorEquipo')),
            'resultado_e1'      => $this->resultado_e1,
            'resultado_e2'      => $this->resultado_e2,
            'delta_elo_e1'      => $this->delta_elo_e1,
            'delta_elo_e2'      => $this->delta_elo_e2,
            'estado'            => $this->estado,
            'ronda'             => $this->ronda,
            'programado_en'     => $this->programado_en,
            'historial_elo'     => HistorialEloResource::collection($this->whenLoaded('historialElo')),
            'created_at'        => $this->created_at,
        ];
    }
}
