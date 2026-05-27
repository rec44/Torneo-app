const FORMATO_LABELS = {
  eliminacion_simple: 'Eliminación directa',
  eliminacion_doble: 'Doble eliminación',
  round_robin: 'Round Robin',
  suizo: 'Sistema Suizo',
}

const ESTADO_LABELS = {
  abierto: 'Abierto',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

function formatFecha(fechaStr) {
  if (!fechaStr) return null
  return new Date(fechaStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function EloRango({ min, max }) {
  if (!min && !max) return <span className="torneo-meta-valor">Libre</span>
  if (min && max) return <span className="torneo-meta-valor">{min} – {max}</span>
  if (min) return <span className="torneo-meta-valor">Mín. {min}</span>
  return <span className="torneo-meta-valor">Máx. {max}</span>
}

export function TorneoCard({ torneo, onVerDetalle }) {
  const fechaInicio = formatFecha(torneo.fecha_inicio)
  const fechaFin = formatFecha(torneo.fecha_fin)

  return (
    <article className="torneo-card">
      <div className="torneo-card-header">
        {torneo.deporte && (
          <span className="badge-deporte">{torneo.deporte.nombre}</span>
        )}
        <span className={`badge-estado badge-estado--${torneo.estado}`}>
          {ESTADO_LABELS[torneo.estado] ?? torneo.estado}
        </span>
      </div>

      <h3 className="torneo-card-nombre">{torneo.nombre}</h3>

      <dl className="torneo-meta">
        <div className="torneo-meta-row">
          <dt>Formato</dt>
          <dd>{FORMATO_LABELS[torneo.formato] ?? torneo.formato}</dd>
        </div>

        <div className="torneo-meta-row">
          <dt>Equipos inscritos</dt>
          <dd>{torneo.equipos_count ?? 0} / {torneo.max_jugadores}</dd>
        </div>

        <div className="torneo-meta-row">
          <dt>ELO</dt>
          <dd><EloRango min={torneo.elo_minimo} max={torneo.elo_maximo} /></dd>
        </div>

        {(fechaInicio || fechaFin) && (
          <div className="torneo-meta-row">
            <dt>Fechas</dt>
            <dd>
              {fechaInicio && fechaFin
                ? `${fechaInicio} – ${fechaFin}`
                : fechaInicio
                  ? `Desde ${fechaInicio}`
                  : `Hasta ${fechaFin}`}
            </dd>
          </div>
        )}

        {torneo.creadoPor && (
          <div className="torneo-meta-row">
            <dt>Organiza</dt>
            <dd>{torneo.creadoPor.nombre}</dd>
          </div>
        )}
      </dl>

      <div className="torneo-card-footer">
        <button
          className="btn-primary"
          onClick={() => onVerDetalle?.(torneo.id)}
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}
