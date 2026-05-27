function PartidoBracket({ partido, esOrganizador, onPartidoClick }) {
  const finalizado  = partido.estado === 'finalizado'
  const ganadorId   = partido.ganador_equipo_id
  const clickable   = esOrganizador && partido.equipo1 && partido.equipo2

  return (
    <div
      className={`bracket-partido ${clickable ? 'bracket-partido--clickable' : ''}`}
      onClick={clickable ? () => onPartidoClick(partido) : undefined}
      title={clickable ? (finalizado ? 'Editar resultado' : 'Registrar resultado') : undefined}
    >
      <div className={`bracket-jugador ${finalizado && ganadorId === partido.equipo1?.id ? 'bracket-jugador--ganador' : ''} ${finalizado && ganadorId !== partido.equipo1?.id ? 'bracket-jugador--perdedor' : ''}`}>
        <span>{partido.equipo1?.nombre ?? 'TBD'}</span>
        {finalizado && <span className="bracket-score">{partido.resultado_e1}</span>}
      </div>
      <div className={`bracket-jugador ${finalizado && ganadorId === partido.equipo2?.id ? 'bracket-jugador--ganador' : ''} ${finalizado && ganadorId !== partido.equipo2?.id ? 'bracket-jugador--perdedor' : ''}`}>
        <span>{partido.equipo2?.nombre ?? 'TBD'}</span>
        {finalizado && <span className="bracket-score">{partido.resultado_e2}</span>}
      </div>
      {clickable && (
        <div className="bracket-partido-edit-hint">
          {finalizado ? 'Editar' : 'Resultado'}
        </div>
      )}
    </div>
  )
}

export function BracketView({ partidos, formato, esOrganizador, onPartidoClick }) {
  if (!partidos || partidos.length === 0) {
    return (
      <div className="bracket-vacio">
        <p>No hay partidos generados aún. El bracket se creará cuando el torneo inicie.</p>
      </div>
    )
  }

  if (formato === 'round_robin') {
    return <RoundRobinView partidos={partidos} />
  }

  return (
    <EliminacionView
      partidos={partidos}
      esOrganizador={esOrganizador}
      onPartidoClick={onPartidoClick}
    />
  )
}

function EliminacionView({ partidos, esOrganizador, onPartidoClick }) {
  const rondas = {}
  for (const p of partidos) {
    const r = p.ronda ?? 1
    if (!rondas[r]) rondas[r] = []
    rondas[r].push(p)
  }

  const numRondas = Math.max(...Object.keys(rondas).map(Number))

  const etiquetaRonda = (r) => {
    if (r === numRondas)     return 'Final'
    if (r === numRondas - 1) return 'Semifinal'
    if (r === numRondas - 2) return 'Cuartos'
    return `Ronda ${r}`
  }

  return (
    <div className="bracket-eliminacion">
      {Object.keys(rondas).sort((a, b) => Number(a) - Number(b)).map((ronda) => (
        <div key={ronda} className="bracket-ronda">
          <div className="bracket-ronda-label">{etiquetaRonda(Number(ronda))}</div>
          <div className="bracket-ronda-partidos">
            {rondas[ronda].map((partido) => (
              <PartidoBracket
                key={partido.id}
                partido={partido}
                esOrganizador={esOrganizador}
                onPartidoClick={onPartidoClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RoundRobinView({ partidos }) {
  const equiposMap = {}
  for (const p of partidos) {
    if (p.equipo1) equiposMap[p.equipo1.id] = p.equipo1.nombre
    if (p.equipo2) equiposMap[p.equipo2.id] = p.equipo2.nombre
  }

  const stats = {}
  for (const id of Object.keys(equiposMap)) {
    stats[id] = { nombre: equiposMap[id], ganados: 0, perdidos: 0, jugados: 0 }
  }

  for (const p of partidos) {
    if (p.estado !== 'finalizado' || !p.ganador_equipo_id) continue
    const perdedorId = p.ganador_equipo_id === p.equipo1?.id ? p.equipo2?.id : p.equipo1?.id
    if (stats[p.ganador_equipo_id]) {
      stats[p.ganador_equipo_id].ganados++
      stats[p.ganador_equipo_id].jugados++
    }
    if (perdedorId && stats[perdedorId]) {
      stats[perdedorId].perdidos++
      stats[perdedorId].jugados++
    }
  }

  const tabla = Object.values(stats).sort((a, b) => b.ganados - a.ganados)

  return (
    <div className="bracket-rr">
      <div className="bracket-rr-tabla">
        <table className="rr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Equipo</th>
              <th>J</th>
              <th>G</th>
              <th>P</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((row, i) => (
              <tr key={row.nombre}>
                <td className="rr-pos">{i + 1}</td>
                <td className="rr-nombre">{row.nombre}</td>
                <td>{row.jugados}</td>
                <td className="rr-ganados">{row.ganados}</td>
                <td className="rr-perdidos">{row.perdidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bracket-rr-partidos">
        <h4>Partidos</h4>
        {partidos.map((p) => (
          <div key={p.id} className={`rr-partido ${p.estado === 'finalizado' ? 'rr-partido--finalizado' : ''}`}>
            <span className={p.ganador_equipo_id === p.equipo1?.id ? 'rr-ganador' : ''}>{p.equipo1?.nombre ?? 'TBD'}</span>
            <span className="rr-vs">
              {p.estado === 'finalizado'
                ? `${p.resultado_e1} – ${p.resultado_e2}`
                : 'vs'}
            </span>
            <span className={p.ganador_equipo_id === p.equipo2?.id ? 'rr-ganador' : ''}>{p.equipo2?.nombre ?? 'TBD'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
