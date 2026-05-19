<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TorneoUsuario extends Model
{
    use HasFactory;

    protected $table = 'torneo_usuarios';

    protected $fillable = [
        'torneo_id',
        'usuario_id',
        'semilla',
        'elo_al_unirse',
    ];

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
