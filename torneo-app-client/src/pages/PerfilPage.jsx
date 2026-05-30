import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { torneoService } from '../services/torneoService'
import { usuarioService } from '../services/usuarioService'
import { TorneoCard } from '../components/TorneoCard'
import './PerfilPage.css'

const esActivo     = (t) => t.estado !== 'finalizado' && t.estado !== 'cancelado'
const esFinalizado = (t) => t.estado === 'finalizado'

const HISTORIAL_STEP = 4

function SeccionTorneos({ titulo, torneos, vacio, navigate }) {
  return (
    <section className="perfil-seccion">
      <h2 className="perfil-seccion-titulo">
        {titulo}
        <span className="perfil-count">{torneos.length}</span>
      </h2>
      {torneos.length === 0 ? (
        <p className="perfil-vacio">{vacio}</p>
      ) : (
        <div className="torneos-scroll-h">
          {torneos.map((t) => (
            <TorneoCard
              key={t.id}
              torneo={t}
              onVerDetalle={(id) => navigate(`/torneos/${id}`)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SeccionHistorial({ titulo, torneos, vacio, navigate, visibles, onVerMas }) {
  const mostrados = torneos.slice(0, visibles)
  return (
    <section className="perfil-seccion">
      <h2 className="perfil-seccion-titulo">
        {titulo}
        <span className="perfil-count">{torneos.length}</span>
      </h2>
      {torneos.length === 0 ? (
        <p className="perfil-vacio">{vacio}</p>
      ) : (
        <>
          <div className="torneos-grid">
            {mostrados.map((t) => (
              <TorneoCard
                key={t.id}
                torneo={t}
                onVerDetalle={(id) => navigate(`/torneos/${id}`)}
              />
            ))}
          </div>
          {visibles < torneos.length && (
            <button className="perfil-btn-mas" onClick={onVerMas}>
              Ver más · {torneos.length - visibles} restante{torneos.length - visibles !== 1 ? 's' : ''}
            </button>
          )}
        </>
      )}
    </section>
  )
}

function SkeletonGrid() {
  return (
    <div className="torneos-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="torneo-card torneo-card--skeleton">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  )
}

export function PerfilPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [creados,  setCreados]  = useState([])
  const [inscrito, setInscrito] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tab,      setTab]      = useState('torneos')
  const [perfil,   setPerfil]   = useState(null)
  const [histCreadosV,  setHistCreadosV]  = useState(HISTORIAL_STEP)
  const [histInscritoV, setHistInscritoV] = useState(HISTORIAL_STEP)

  useEffect(() => {
    torneoService.getMisTorneos()
      .then((data) => {
        setCreados(data.creados)
        setInscrito(data.inscrito)
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Error al cargar tus torneos.'))
      .finally(() => setLoading(false))
  }, [])

  // Carga los ELOs por deporte cuando el usuario está disponible
  useEffect(() => {
    if (!user?.id) return
    usuarioService.getById(user.id).then(setPerfil).catch(() => {})
  }, [user?.id])

  const creadosActivos    = creados.filter(esActivo)
  const inscritoActivos   = inscrito.filter(esActivo)
  const creadosHistorial  = creados.filter(esFinalizado)
  const inscritoHistorial = inscrito.filter(esFinalizado)

  const totalActivos   = creadosActivos.length  + inscritoActivos.length
  const totalHistorial = creadosHistorial.length + inscritoHistorial.length

  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div className="perfil-avatar">{user?.nombre?.[0]?.toUpperCase() ?? '?'}</div>
        <div className="perfil-header-info">
          <h1 className="perfil-nombre">{user?.nombre}</h1>
          <p className="perfil-email">{user?.email}</p>
          <div className="perfil-header-badges">
            <span className="perfil-elo-badge">ELO {user?.elo ?? 500}</span>
          </div>
        </div>
      </header>

      <div className="perfil-stats-row">
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{creados.length + inscrito.length}</span>
          <span className="perfil-stat-label">Total torneos</span>
        </div>
        <div className="perfil-stat-divider" />
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{totalActivos}</span>
          <span className="perfil-stat-label">Activos</span>
        </div>
        <div className="perfil-stat-divider" />
        <div className="perfil-stat">
          <span className="perfil-stat-valor">{totalHistorial}</span>
          <span className="perfil-stat-label">Finalizados</span>
        </div>
      </div>

      <div className="perfil-tabs">
        <button
          className={`perfil-tab ${tab === 'torneos' ? 'perfil-tab--activa' : ''}`}
          onClick={() => setTab('torneos')}
        >
          Mis torneos
          <span className="perfil-tab-count">{totalActivos}</span>
        </button>
        <button
          className={`perfil-tab ${tab === 'historial' ? 'perfil-tab--activa' : ''}`}
          onClick={() => setTab('historial')}
        >
          Historial
          <span className="perfil-tab-count">{totalHistorial}</span>
        </button>
        <button
          className={`perfil-tab ${tab === 'elo' ? 'perfil-tab--activa' : ''}`}
          onClick={() => setTab('elo')}
        >
          ELO por deporte
          <span className="perfil-tab-count">{perfil?.elosDeporte?.length ?? 0}</span>
        </button>
      </div>

      {error && <div className="torneos-error">{error}</div>}

      {tab === 'elo' ? (
        <div className="perfil-elo-section">
          <div className="perfil-elo-global-card">
            <span className="perfil-elo-global-label">ELO global</span>
            <span className="perfil-elo-global-valor">{user?.elo ?? 500}</span>
          </div>
          {perfil?.elosDeporte?.length > 0 ? (
            <div className="perfil-elo-lista">
              {perfil.elosDeporte.map(e => (
                <div key={e.deporte_id} className="perfil-elo-fila">
                  <span className="perfil-elo-deporte">{e.deporte?.nombre}</span>
                  <span className="perfil-elo-valor">{e.elo}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="perfil-vacio">
              Todavía no tienes ELO registrado en ningún deporte. Participa en torneos para acumularlo.
            </p>
          )}
        </div>
      ) : loading ? (
        <SkeletonGrid />
      ) : tab === 'torneos' ? (
        <>
          <SeccionTorneos
            titulo="Torneos que organizas"
            torneos={creadosActivos}
            vacio="No tienes torneos activos como organizador."
            navigate={navigate}
          />
          <SeccionTorneos
            titulo="Torneos en los que participas"
            torneos={inscritoActivos}
            vacio="No estás inscrito en ningún torneo activo."
            navigate={navigate}
          />
        </>
      ) : (
        <>
          <SeccionHistorial
            titulo="Torneos organizados"
            torneos={creadosHistorial}
            vacio="No tienes torneos finalizados como organizador."
            navigate={navigate}
            visibles={histCreadosV}
            onVerMas={() => setHistCreadosV(v => v + HISTORIAL_STEP)}
          />
          <SeccionHistorial
            titulo="Torneos en los que participaste"
            torneos={inscritoHistorial}
            vacio="No tienes historial de participación."
            navigate={navigate}
            visibles={histInscritoV}
            onVerMas={() => setHistInscritoV(v => v + HISTORIAL_STEP)}
          />
        </>
      )}
    </div>
  )
}
