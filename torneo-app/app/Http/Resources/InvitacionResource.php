<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'torneo_id'     => $this->torneo_id,
            'equipo_id'     => $this->equipo_id,
            'codigo'        => $this->codigo,
            'max_usos'      => $this->max_usos,
            'usos_actuales' => $this->usos_actuales,
            'expira_en'     => $this->expira_en,
            'vigente'       => $this->estaVigente(),
        ];
    }
}
