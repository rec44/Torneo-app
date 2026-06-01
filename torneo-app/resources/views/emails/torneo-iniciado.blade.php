<x-mail::message>
# ¡El torneo ha comenzado!

Hola **{{ $nombreUsuario }}**,

El torneo **{{ $torneo->nombre }}** ha generado el bracket y está en fase de programación. Pronto se publicarán las fechas y horas de cada partido.

<x-mail::panel>
**Torneo:** {{ $torneo->nombre }}
**Deporte:** {{ $torneo->deporte?->nombre ?? '—' }}
**Formato:** {{ ucfirst(str_replace('_', ' ', $torneo->formato)) }}
**Fecha de inicio:** {{ $torneo->fecha_inicio?->format('d/m/Y') ?? 'Por confirmar' }}
</x-mail::panel>

Consulta el bracket y el calendario completo desde la aplicación.

<x-mail::button :url="config('app.frontend_url') . '/torneos/' . $torneo->id">
Ver torneo
</x-mail::button>

Gracias por participar,
**RiseCup**
</x-mail::message>
