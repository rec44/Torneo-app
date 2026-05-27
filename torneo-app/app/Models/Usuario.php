<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

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

    public function equipos(): BelongsToMany
    {
        return $this->belongsToMany(Equipo::class, 'equipo_usuarios', 'usuario_id', 'equipo_id')
            ->withPivot(['elo_al_unirse'])
            ->withTimestamps();
    }

    public function equiposCapitan(): HasMany
    {
        return $this->hasMany(Equipo::class, 'capitan_id');
    }
}
