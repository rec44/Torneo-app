<x-mail::message>
# ¡El calendario está listo!

Hola **{{ $nombreUsuario }}**,

El organizador de **{{ $torneo->nombre }}** ha confirmado las fechas de todos los partidos. Ya puedes consultar el calendario completo.

<x-mail::panel>
**Torneo:** {{ $torneo->nombre }}
**Deporte:** {{ $torneo->deporte?->nombre ?? '—' }}
**Partidos programados:**
@foreach($torneo->partidos->sortBy('programado_en') as $partido)
@if($partido->programado_en)
· {{ \Carbon\Carbon::parse($partido->programado_en)->format('d/m/Y H:i') }} — {{ $partido->equipo1?->nombre ?? 'TBD' }} vs {{ $partido->equipo2?->nombre ?? 'TBD' }}
@endif
@endforeach
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/torneos/' . $torneo->id">
Ver calendario
</x-mail::button>

¡Mucha suerte!
**RiseCup**
</x-mail::message>
