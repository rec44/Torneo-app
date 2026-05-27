<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitacionTorneo extends Model
{
    use HasFactory;

    protected $table = 'invitaciones_torneo';

    protected $fillable = [
        'torneo_id',
        'equipo_id',
        'codigo',
        'max_usos',
        'usos_actuales',
        'expira_en',
    ];

    protected function casts(): array
    {
        return [
            'expira_en'     => 'datetime',
            'max_usos'      => 'integer',
            'usos_actuales' => 'integer',
        ];
    }

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function estaVigente(): bool
    {
        if ($this->expira_en && $this->expira_en->isPast()) {
            return false;
        }
        if ($this->max_usos !== null && $this->usos_actuales >= $this->max_usos) {
            return false;
        }
        return true;
    }
}
