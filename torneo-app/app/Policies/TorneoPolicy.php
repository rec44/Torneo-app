<?php

namespace App\Policies;

use App\Models\Torneo;
use App\Models\Usuario;

class TorneoPolicy
{
    public function update(Usuario $usuario, Torneo $torneo): bool
    {
        return $usuario->id === $torneo->creado_por || $usuario->rol === 'admin';
    }

    public function delete(Usuario $usuario, Torneo $torneo): bool
    {
        return $usuario->id === $torneo->creado_por || $usuario->rol === 'admin';
    }

    public function iniciar(Usuario $usuario, Torneo $torneo): bool
    {
        return $usuario->id === $torneo->creado_por || $usuario->rol === 'admin';
    }
}
