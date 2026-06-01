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
        'direccion',
        'ciudad',
        'provincia',
    ];

    // Fechas como Carbon y numéricos como int para evitar comparaciones raras
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

    // Deporte al que pertenece el torneo
    public function deporte(): BelongsTo
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }

    // Usuario que creó el torneo
    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    // Equipos inscritos en el torneo
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'torneo_id');
    }

    // Partidos generados para el torneo
    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'torneo_id');
    }

    // Códigos de invitación emitidos para el torneo
    public function invitaciones(): HasMany
    {
        return $this->hasMany(InvitacionTorneo::class, 'torneo_id');
    }
}
