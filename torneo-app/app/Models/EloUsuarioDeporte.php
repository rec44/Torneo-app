<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EloUsuarioDeporte extends Model
{
    use HasFactory;

    protected $table = 'elo_usuario_deporte';

    protected $fillable = [
        'usuario_id',
        'deporte_id',
        'elo',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function deporte(): BelongsTo
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }
}
