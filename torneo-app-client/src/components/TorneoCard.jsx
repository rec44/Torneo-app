const FORMATO_LABELS = {
  eliminacion_simple: 'Eliminación directa',
  eliminacion_doble:  'Doble eliminación',
  round_robin:        'Round Robin',
  suizo:              'Sistema Suizo',
}

const ESTADO_LABELS = {
  abierto:    'Abierto',
  en_curso:   'En curso',
  finalizado: 'Finalizado',
}

const ESTADO_STYLES = {
  abierto:    'bg-green-500/10 text-green-800 before:bg-green-500',
  en_curso:   'bg-blue-500/10 text-blue-700 before:bg-blue-400',
  finalizado: 'bg-zinc-500/10 text-zinc-600 before:bg-zinc-400',
}

function formatFecha(fechaStr) {
  if (!fechaStr) return null
  return new Date(fechaStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function EloRango({ min, max }) {
  const cls = 'font-medium text-skin-heading'
  if (!min && !max) return <span className={cls}>Libre</span>
  if (min && max)   return <span className={cls}>{min} – {max}</span>
  if (min)          return <span className={cls}>Mín. {min}</span>
  return <span className={cls}>Máx. {max}</span>
}

function BadgeEstado({ estado }) {
  const estilos = ESTADO_STYLES[estado] ?? 'bg-zinc-500/10 text-zinc-600'
  return (
    <span className={`inline-flex items-center gap-[5px] px-2 py-1 text-[11px] font-semibold tracking-[0.04em] rounded-[4px]
      before:content-[''] before:block before:w-[6px] before:h-[6px] before:rounded-full before:flex-shrink-0
      ${estilos}`}>
      {ESTADO_LABELS[estado] ?? estado}
    </span>
  )
}

export function TorneoCard({ torneo, onVerDetalle }) {
  const fechaInicio = formatFecha(torneo.fecha_inicio)
  const fechaFin    = formatFecha(torneo.fecha_fin)

  return (
    <article
      className="flex flex-col gap-[14px] p-[18px] bg-skin-card rounded-2xl transition-all duration-200
        cursor-default hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
    >
      {/* Cabecera badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {torneo.deporte && (
          <span className="inline-flex items-center px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.06em] rounded-[4px] bg-skin-code text-skin-heading border border-skin-border">
            {torneo.deporte.nombre}
          </span>
        )}
        <BadgeEstado estado={torneo.estado} />
      </div>

      {/* Nombre */}
      <h3 className="text-[16px] font-semibold text-skin-heading m-0 leading-snug">
        {torneo.nombre}
      </h3>

      {/* Meta */}
      <dl className="flex flex-col gap-[5px] m-0 flex-grow">
        <MetaFila dt="Equipos inscritos" dd={`${torneo.equipos_count ?? 0} / ${torneo.max_jugadores}`} />
        <MetaFila dt="ELO" dd={<EloRango min={torneo.elo_minimo} max={torneo.elo_maximo} />} />
        {(fechaInicio || fechaFin) && (
          <MetaFila dt="Fechas" dd={
            fechaInicio && fechaFin ? `${fechaInicio} – ${fechaFin}`
            : fechaInicio ? `Desde ${fechaInicio}` : `Hasta ${fechaFin}`
          } />
        )}
        {(torneo.ciudad || torneo.provincia) && (
          <MetaFila dt="Lugar" dd={[torneo.ciudad, torneo.provincia].filter(Boolean).join(', ')} />
        )}
        {torneo.creadoPor && (
          <MetaFila dt="Organiza" dd={torneo.creadoPor.nombre} />
        )}
      </dl>

      {/* CTA */}
      <div className="mt-auto pt-1">
        <button
          onClick={() => onVerDetalle?.(torneo.id)}
          className="inline-flex items-center justify-center w-full px-5 py-[9px] text-[13px] font-bold uppercase tracking-[0.03em] text-skin-bg border-none rounded-lg cursor-pointer transition-all duration-200 focus-ring"
          style={{
            background: 'linear-gradient(160deg, #f97316, color-mix(in srgb, #f97316 75%, #000))',
            boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(249,115,22,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.4)' }}
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}

function MetaFila({ dt, dd }) {
  return (
    <div className="flex gap-2 text-[13px]">
      <dt className="text-skin-text min-w-[76px] flex-shrink-0">{dt}</dt>
      <dd className="m-0 text-skin-heading font-medium">{dd}</dd>
    </div>
  )
}
