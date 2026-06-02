<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipos';

    protected $fillable = [
        'torneo_id',
        'nombre',
        'escudo',
        'capitan_id',
        'semilla',
        'bloqueado',
        'inscrito',
    ];

    protected $appends = ['escudo_url'];

    protected function escudoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->escudo
            ? url(Storage::url($this->escudo))
            : null
        );
    }

    protected function casts(): array
    {
        return [
            'semilla'   => 'integer',
            'bloqueado' => 'boolean',
            'inscrito'  => 'boolean',
        ];
    }

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    public function capitan(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'capitan_id');
    }

    public function miembros(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'equipo_usuarios', 'equipo_id', 'usuario_id')
            ->withPivot(['elo_al_unirse'])
            ->withTimestamps();
    }

    public function invitaciones(): HasMany
    {
        return $this->hasMany(InvitacionTorneo::class, 'equipo_id');
    }

    public function partidosComoEquipo1(): HasMany
    {
        return $this->hasMany(Partido::class, 'equipo1_id');
    }

    public function partidosComoEquipo2(): HasMany
    {
        return $this->hasMany(Partido::class, 'equipo2_id');
    }
}
