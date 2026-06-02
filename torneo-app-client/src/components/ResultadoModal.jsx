import { useState, useEffect } from 'react'
import { partidoService } from '../services/partidoService'

export function ResultadoModal({ partido, onClose, onGuardado }) {
  const [res1,      setRes1]      = useState(partido.resultado_e1 ?? '')
  const [res2,      setRes2]      = useState(partido.resultado_e2 ?? '')
  const [ganadorId, setGanadorId] = useState(partido.ganador_equipo_id ?? null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const n1 = parseInt(res1, 10)
    const n2 = parseInt(res2, 10)
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n2 < 0) { setError('Los marcadores deben ser números enteros positivos.'); return }
    if (!ganadorId) { setError('Selecciona el ganador.'); return }

    if (n1 !== n2) {
      const ganadorCorrecto = n1 > n2 ? partido.equipo1?.id : partido.equipo2?.id
      if (ganadorId !== ganadorCorrecto) {
        setError('El ganador debe ser el equipo con mayor puntuación.')
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      await partidoService.registrarResultado(partido.id, {
        resultado_e1:      parseInt(res1, 10),
        resultado_e2:      parseInt(res2, 10),
        ganador_equipo_id: ganadorId,
      })
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar el resultado.')
      setLoading(false)
    }
  }

  const esEdicion = partido.estado === 'finalizado'

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3 className="modal-titulo">
            {esEdicion ? 'Editar resultado' : 'Registrar resultado'}
          </h3>
          <button className="modal-cerrar" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* Marcadores */}
          <div className="modal-scores">
            <div className="modal-score-equipo">
              <span className="modal-score-nombre">{partido.equipo1?.nombre}</span>
              <input
                className="modal-score-input"
                type="number"
                min="0"
                value={res1}
                onChange={e => setRes1(e.target.value)}
                placeholder="0"
                maxLength={10}
                autoFocus
              />
            </div>

            <span className="modal-score-sep">–</span>

            <div className="modal-score-equipo">
              <span className="modal-score-nombre">{partido.equipo2?.nombre}</span>
              <input
                className="modal-score-input"
                type="number"
                min="0"
                value={res2}
                onChange={e => setRes2(e.target.value)}
                placeholder="0"
                maxLength={10}
              />
            </div>
          </div>

          {/* Ganador */}
          <div className="modal-ganador">
            <span className="modal-ganador-label">Ganador</span>
            <div className="modal-ganador-opciones">
              <label className={`modal-ganador-chip ${ganadorId === partido.equipo1?.id ? 'modal-ganador-chip--activo' : ''}`}>
                <input
                  type="radio"
                  name="ganador"
                  value={partido.equipo1?.id}
                  checked={ganadorId === partido.equipo1?.id}
                  onChange={() => setGanadorId(partido.equipo1?.id)}
                />
                {partido.equipo1?.nombre}
              </label>
              <label className={`modal-ganador-chip ${ganadorId === partido.equipo2?.id ? 'modal-ganador-chip--activo' : ''}`}>
                <input
                  type="radio"
                  name="ganador"
                  value={partido.equipo2?.id}
                  checked={ganadorId === partido.equipo2?.id}
                  onChange={() => setGanadorId(partido.equipo2?.id)}
                />
                {partido.equipo2?.nombre}
              </label>
            </div>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-acciones">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar resultado'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
