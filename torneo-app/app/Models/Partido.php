<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partido extends Model
{
    use HasFactory;

    protected $table = 'partidos';

    protected $fillable = [
        'torneo_id',
        'equipo1_id',
        'equipo2_id',
        'ganador_equipo_id',
        'resultado_e1',
        'resultado_e2',
        'delta_elo_e1',
        'delta_elo_e2',
        'estado',
        'ronda',
        'programado_en',
    ];

    protected function casts(): array
    {
        return [
            'programado_en' => 'datetime',
            'ronda'         => 'integer',
        ];
    }

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    public function equipo1(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo1_id');
    }

    public function equipo2(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo2_id');
    }

    public function ganadorEquipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'ganador_equipo_id');
    }

    public function historialElo(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HistorialElo::class, 'partido_id');
    }
}
