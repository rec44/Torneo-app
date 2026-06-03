<x-mail::message>
# ¡Torneo finalizado!

Hola **{{ $nombreUsuario }}**,

El torneo **{{ $torneo->nombre }}** ha concluido. ¡Gracias a todos los participantes!

<x-mail::panel>
🏅 **Campeón: {{ $nombreCampeon }}**

**Torneo:** {{ $torneo->nombre }}
**Deporte:** {{ $torneo->deporte?->nombre ?? '—' }}
**Fecha de fin:** {{ $torneo->fecha_fin?->format('d/m/Y') ?? now()->format('d/m/Y') }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/torneos/' . $torneo->id">
Ver resultados
</x-mail::button>

Hasta la próxima,
**RiseCup**
</x-mail::message>
