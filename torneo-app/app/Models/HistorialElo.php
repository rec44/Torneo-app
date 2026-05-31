<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialElo extends Model
{
    protected $table = 'historial_elo';

    protected $fillable = ['usuario_id', 'partido_id', 'elo_antes', 'elo_despues', 'delta'];

    public function usuario(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
