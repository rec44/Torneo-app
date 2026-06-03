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
  if (!min && !max) return <span className="tarjeta-tarjeta-torneo-meta-valor">Libre</span>
  if (min && max) return <span className="tarjeta-tarjeta-torneo-meta-valor">{min} – {max}</span>
  if (min) return <span className="tarjeta-tarjeta-torneo-meta-valor">Mín. {min}</span>
  return <span className="tarjeta-tarjeta-torneo-meta-valor">Máx. {max}</span>
}

export function TorneoCard({ torneo, onVerDetalle }) {
  const fechaInicio = formatFecha(torneo.fecha_inicio)
  const fechaFin = formatFecha(torneo.fecha_fin)

  return (
    <article className="tarjeta-torneo">
      <div className="tarjeta-torneo-cabecera">
        {torneo.deporte && (
          <span className="insignia-deporte">{torneo.deporte.nombre}</span>
        )}
        <span className={`insignia-estado insignia-estado--${torneo.estado}`}>
          {ESTADO_LABELS[torneo.estado] ?? torneo.estado}
        </span>
      </div>

      <h3 className="tarjeta-torneo-nombre">{torneo.nombre}</h3>

      <dl className="tarjeta-torneo-meta">
        <div className="tarjeta-tarjeta-torneo-meta-fila">
          <dt>Equipos inscritos</dt>
          <dd>{torneo.equipos_count ?? 0} / {torneo.max_jugadores}</dd>
        </div>

        <div className="tarjeta-tarjeta-torneo-meta-fila">
          <dt>ELO</dt>
          <dd><EloRango min={torneo.elo_minimo} max={torneo.elo_maximo} /></dd>
        </div>

        {(fechaInicio || fechaFin) && (
          <div className="tarjeta-tarjeta-torneo-meta-fila">
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

        {(torneo.ciudad || torneo.provincia) && (
          <div className="tarjeta-tarjeta-torneo-meta-fila">
            <dt>Lugar</dt>
            <dd>{[torneo.ciudad, torneo.provincia].filter(Boolean).join(', ')}</dd>
          </div>
        )}

        {torneo.creadoPor && (
          <div className="tarjeta-tarjeta-torneo-meta-fila">
            <dt>Organiza</dt>
            <dd>{torneo.creadoPor.nombre}</dd>
          </div>
        )}
      </dl>

      <div className="tarjeta-torneo-pie">
        <button
          className="btn-primario"
          onClick={() => onVerDetalle?.(torneo.id)}
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}
