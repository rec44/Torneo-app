function BracketEscudo({ url, nombre }) {
  if (!url) return null
  return (
    <img
      src={url}
      alt={nombre ?? ''}
      className="bracket-escudo"
    />
  )
}

function PartidoBracket({ partido, esOrganizador, onPartidoClick, torneoFinalizado }) {
  const finalizado  = partido.estado === 'finalizado'
  const ganadorId   = partido.ganador_equipo_id
  const clickable   = esOrganizador && partido.equipo1 && partido.equipo2 && !torneoFinalizado

  return (
    <div
      className={`bracket-partido ${clickable ? 'bracket-partido--seleccionable' : ''}`}
      onClick={clickable ? () => onPartidoClick(partido) : undefined}
      title={clickable ? (finalizado ? 'Editar resultado' : 'Registrar resultado') : undefined}
    >
      <div className={`bracket-jugador ${finalizado && ganadorId === partido.equipo1?.id ? 'bracket-jugador--ganador' : ''} ${finalizado && ganadorId !== partido.equipo1?.id ? 'bracket-jugador--perdedor' : ''}`}>
        <span className="bracket-jugador-izq">
          <BracketEscudo url={partido.equipo1?.escudo_url} nombre={partido.equipo1?.nombre} />
          <span className={!partido.equipo1 ? 'nombre-pendiente' : ''}>{partido.equipo1?.nombre ?? 'Por definir'}</span>
        </span>
        {finalizado && <span className="bracket-marcador">{partido.resultado_e1}</span>}
      </div>
      <div className={`bracket-jugador ${finalizado && ganadorId === partido.equipo2?.id ? 'bracket-jugador--ganador' : ''} ${finalizado && ganadorId !== partido.equipo2?.id ? 'bracket-jugador--perdedor' : ''}`}>
        <span className="bracket-jugador-izq">
          <BracketEscudo url={partido.equipo2?.escudo_url} nombre={partido.equipo2?.nombre} />
          <span className={!partido.equipo2 ? 'nombre-pendiente' : ''}>{partido.equipo2?.nombre ?? 'Por definir'}</span>
        </span>
        {finalizado && <span className="bracket-marcador">{partido.resultado_e2}</span>}
      </div>
      {clickable && (
        <div className="bracket-partido-pista-edicion">
          {finalizado ? 'Editar' : 'Resultado'}
        </div>
      )}
    </div>
  )
}

export function BracketView({ partidos, esOrganizador, onPartidoClick, torneoFinalizado }) {
  if (!partidos || partidos.length === 0) {
    return (
      <div className="bracket-vacio">
        <p>No hay partidos generados aún. El bracket se creará cuando el torneo inicie.</p>
      </div>
    )
  }

  return (
    <EliminacionView
      partidos={partidos}
      esOrganizador={esOrganizador}
      onPartidoClick={onPartidoClick}
      torneoFinalizado={torneoFinalizado}
    />
  )
}

function EliminacionView({ partidos, esOrganizador, onPartidoClick, torneoFinalizado }) {
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
          <div className="bracket-ronda-etiqueta">{etiquetaRonda(Number(ronda))}</div>
          <div className="bracket-ronda-partidos">
            {rondas[ronda].map((partido) => (
              <PartidoBracket
                key={partido.id}
                partido={partido}
                esOrganizador={esOrganizador}
                onPartidoClick={onPartidoClick}
                torneoFinalizado={torneoFinalizado}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

