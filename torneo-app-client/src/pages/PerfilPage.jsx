import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usuarioService } from '../services/usuarioService'
import { TorneoCard } from '../components/TorneoCard'
import './PerfilPage.css'

const esFinalizado = t => t.estado === 'finalizado'
const PASO = 8

function SeccionHistorial({ titulo, torneos, vacio, navigate, loading }) {
  const [visibles, setVisibles] = useState(PASO)
  const mostrados = torneos.slice(0, visibles)

  if (loading) return (
    <section className="perfil-seccion">
      <div className="perfil-seccion-header">
        <h2 className="perfil-seccion-titulo">{titulo}</h2>
      </div>
      <div className="perfil-scroll-h">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="torneo-card torneo-card--skeleton">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <section className="perfil-seccion">
      <div className="perfil-seccion-header">
        <h2 className="perfil-seccion-titulo">{titulo}</h2>
      </div>

      {torneos.length === 0 ? (
        <p className="perfil-vacio">{vacio}</p>
      ) : (
        <>
          <div className="perfil-scroll-h">
            {mostrados.map(t => (
              <TorneoCard key={t.id} torneo={t} onVerDetalle={id => navigate(`/torneos/${id}`)} />
            ))}
          </div>
          {visibles < torneos.length && (
            <button className="perfil-btn-mas" onClick={() => setVisibles(v => v + PASO)}>
              Ver más · {torneos.length - visibles} restante{torneos.length - visibles !== 1 ? 's' : ''}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export function PerfilPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const esPropio = String(id) === String(user?.id)

  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    usuarioService.getById(id)
      .then(setPerfil)
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [id])

  const elosDeporte    = [...(perfil?.elosDeporte    ?? [])].sort((a, b) => b.elo - a.elo)
  const torneosCreados  = perfil?.torneos_creados  ?? []
  const torneosInscritos = perfil?.torneos_inscritos ?? []
  const eloGlobal      = elosDeporte.length > 0
    ? Math.round(elosDeporte.reduce((sum, e) => sum + e.elo, 0) / elosDeporte.length)
    : 500

  return (
    <div className="perfil-page">

      {!esPropio && (
        <button className="btn-volver" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
      )}

      {/* ── Header ── */}
      <header className="perfil-header">
        <div className="perfil-avatar">{perfil?.nombre?.[0]?.toUpperCase() ?? '?'}</div>
        <div className="perfil-header-info">
          <h1 className="perfil-nombre">{perfil?.nombre}</h1>
          {esPropio && <p className="perfil-email">{perfil?.email}</p>}
          <div className="perfil-header-badges">
            <span className="perfil-elo-badge">ELO {eloGlobal}</span>
            {elosDeporte.map(e => (
              <span key={e.deporte_id} className="perfil-deporte-tag">
                {e.deporte?.nombre} · {e.elo}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="perfil-stats-row">
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{torneosInscritos.length}</span>
          <span className="perfil-stat-label">Participados</span>
        </div>
        <div className="perfil-stat-divider" />
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{torneosCreados.length}</span>
          <span className="perfil-stat-label">Organizados</span>
        </div>
        <div className="perfil-stat-divider" />
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{perfil?.torneos_ganados ?? 0}</span>
          <span className="perfil-stat-label">Ganados</span>
        </div>
      </div>

      {error && <div className="torneos-error">{error}</div>}

      {/* ── ELO por deporte ── */}
      <section className="perfil-seccion">
        <div className="perfil-seccion-header">
          <h2 className="perfil-seccion-titulo">ELO por deporte</h2>
        </div>

        <div className="perfil-elo-section">
          <div className="perfil-elo-global-card">
            <div>
              <span className="perfil-elo-global-label">ELO global</span>
              <span className="perfil-elo-global-desc">Media de los deportes · solo informativo</span>
            </div>
            <span className="perfil-elo-global-valor">{eloGlobal}</span>
          </div>

          {elosDeporte.length > 0 ? (
            <div className="perfil-elo-lista">
              {elosDeporte.map(e => (
                <div key={e.deporte_id} className="perfil-elo-fila">
                  <span className="perfil-elo-deporte">{e.deporte?.nombre}</span>
                  <span className="perfil-elo-valor">{e.elo}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="perfil-vacio">
              {esPropio
                ? 'Todavía no tienes ELO en ningún deporte. Participa en torneos para acumularlo.'
                : 'Este usuario todavía no tiene ELO en ningún deporte.'}
            </p>
          )}
        </div>
      </section>

      {/* ── Historial (todos los usuarios) ── */}
      <SeccionHistorial
        titulo="Historial torneos organizados"
        torneos={torneosCreados.filter(esFinalizado)}
        vacio={esPropio ? 'No tienes historial de torneos organizados.' : 'Este usuario no tiene torneos organizados finalizados.'}
        navigate={navigate}
        loading={loading}
      />
      <SeccionHistorial
        titulo="Historial torneos participados"
        torneos={torneosInscritos.filter(esFinalizado)}
        vacio={esPropio ? 'No tienes historial de torneos en los que hayas participado.' : 'Este usuario no tiene torneos participados finalizados.'}
        navigate={navigate}
        loading={loading}
      />

    </div>
  )
}
