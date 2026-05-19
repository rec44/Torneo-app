<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'email',
        'contrasena',
        'elo',
        'rol',
    ];

    protected $hidden = [
        'contrasena',
    ];

    protected function casts(): array
    {
        return [
            'contrasena' => 'hashed',
            'elo'        => 'integer',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->contrasena;
    }

    public function elosDeporte(): HasMany
    {
        return $this->hasMany(EloUsuarioDeporte::class, 'usuario_id');
    }

    public function torneosCreados(): HasMany
    {
        return $this->hasMany(Torneo::class, 'creado_por');
    }

    public function torneos(): BelongsToMany
    {
        return $this->belongsToMany(Torneo::class, 'torneo_usuarios', 'usuario_id', 'torneo_id')
            ->withPivot(['semilla', 'elo_al_unirse'])
            ->withTimestamps();
    }

    public function partidosComoJugador1(): HasMany
    {
        return $this->hasMany(Partido::class, 'jugador1_id');
    }

    public function partidosComoJugador2(): HasMany
    {
        return $this->hasMany(Partido::class, 'jugador2_id');
    }

    public function partidosGanados(): HasMany
    {
        return $this->hasMany(Partido::class, 'ganador_id');
    }
}
