<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Torneo extends Model
{
    use HasFactory;

    protected $table = 'torneos';

    protected $fillable = [
        'nombre',
        'deporte_id',
        'creado_por',
        'elo_minimo',
        'elo_maximo',
        'max_jugadores',
        'min_miembros',
        'max_miembros',
        'fecha_inicio',
        'fecha_fin',
        'formato',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio'  => 'datetime',
            'fecha_fin'     => 'datetime',
            'elo_minimo'    => 'integer',
            'elo_maximo'    => 'integer',
            'max_jugadores' => 'integer',
            'min_miembros'  => 'integer',
            'max_miembros'  => 'integer',
        ];
    }

    public function deporte(): BelongsTo
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'torneo_id');
    }

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'torneo_id');
    }

    public function invitaciones(): HasMany
    {
        return $this->hasMany(InvitacionTorneo::class, 'torneo_id');
    }
}
