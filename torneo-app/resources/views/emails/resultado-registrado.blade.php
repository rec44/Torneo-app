<x-mail::message>
# Resultado del partido

Hola **{{ $nombreUsuario }}**,

Se ha registrado el resultado de tu partido en **{{ $partido->torneo->nombre }}**.

<x-mail::panel>
**{{ $partido->equipo1?->nombre ?? 'TBD' }}** {{ $partido->resultado_e1 }} — {{ $partido->resultado_e2 }} **{{ $partido->equipo2?->nombre ?? 'TBD' }}**

🏆 Ganador: **{{ $partido->ganadorEquipo?->nombre ?? '—' }}**
</x-mail::panel>

@if($deltaElo > 0)
**Tu ELO ha subido +{{ $deltaElo }} puntos.** ¡Buen trabajo!
@elseif($deltaElo < 0)
**Tu ELO ha bajado {{ $deltaElo }} puntos.** ¡Ánimo para el siguiente!
@endif

<x-mail::button :url="config('app.frontend_url') . '/torneos/' . $partido->torneo_id">
Ver torneo
</x-mail::button>

Gracias por participar,
**RiseCup**
</x-mail::message>
