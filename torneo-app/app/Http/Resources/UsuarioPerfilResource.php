<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class UsuarioPerfilResource extends UsuarioResource
{
    public function __construct($resource, private array $perfil = [])
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), $this->perfil);
    }
}
