<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistorialEloResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'partido_id'  => $this->partido_id,
            'usuario_id'  => $this->usuario_id,
            'elo_antes'   => $this->elo_antes,
            'elo_despues' => $this->elo_despues,
            'delta'       => $this->delta,
        ];
    }
}
