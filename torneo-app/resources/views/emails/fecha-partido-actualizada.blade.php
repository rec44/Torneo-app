<x-mail::message>
# Fecha de partido actualizada

Hola **{{ $nombreUsuario }}**,

Se ha asignado o modificado la fecha de tu próximo partido en **{{ $partido->torneo->nombre }}**.

<x-mail::panel>
**Tu equipo:** {{ $nombreEquipoPropio }}
**Rival:** {{ $nombreEquipoRival }}
**Nueva fecha:** {{ \Carbon\Carbon::parse($partido->programado_en)->format('d/m/Y') }}
**Hora:** {{ \Carbon\Carbon::parse($partido->programado_en)->format('H:i') }}
**Ronda:** {{ $partido->ronda }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/torneos/' . $partido->torneo_id">
Ver torneo
</x-mail::button>

**RiseCup**
</x-mail::message>
