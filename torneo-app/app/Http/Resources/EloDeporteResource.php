<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EloDeporteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'deporte_id' => $this->deporte_id,
            'deporte'    => new DeporteResource($this->whenLoaded('deporte')),
            'elo'        => $this->elo,
        ];
    }
}
