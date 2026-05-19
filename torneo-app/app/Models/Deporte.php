<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deporte extends Model
{
    use HasFactory;

    protected $table = 'deportes';

    protected $fillable = [
        'nombre',
    ];

    public function torneos(): HasMany
    {
        return $this->hasMany(Torneo::class, 'deporte_id');
    }

    public function elosUsuario(): HasMany
    {
        return $this->hasMany(EloUsuarioDeporte::class, 'deporte_id');
    }
}
