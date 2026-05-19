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
        'jugador1_id',
        'jugador2_id',
        'ganador_id',
        'resultado_j1',
        'resultado_j2',
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

    public function jugador1(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'jugador1_id');
    }

    public function jugador2(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'jugador2_id');
    }

    public function ganador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ganador_id');
    }
}
