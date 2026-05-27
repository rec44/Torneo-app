import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { torneoService } from '../services/torneoService'
import { TorneoCard } from '../components/TorneoCard'
import './PerfilPage.css'

const esActivo     = (t) => t.estado !== 'finalizado' && t.estado !== 'cancelado'
const esFinalizado = (t) => t.estado === 'finalizado'

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
        <div className="torneos-grid">
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

  useEffect(() => {
    torneoService.getMisTorneos()
      .then((data) => {
        setCreados(data.creados)
        setInscrito(data.inscrito)
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Error al cargar tus torneos.'))
      .finally(() => setLoading(false))
  }, [])

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
        <div>
          <h1 className="perfil-nombre">{user?.nombre}</h1>
          <p className="perfil-email">{user?.email}</p>
        </div>
      </header>

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
      </div>

      {error && <div className="torneos-error">{error}</div>}

      {loading ? (
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
          <SeccionTorneos
            titulo="Torneos organizados"
            torneos={creadosHistorial}
            vacio="No tienes torneos finalizados como organizador."
            navigate={navigate}
          />
          <SeccionTorneos
            titulo="Torneos en los que participaste"
            torneos={inscritoHistorial}
            vacio="No tienes historial de participación."
            navigate={navigate}
          />
        </>
      )}
    </div>
  )
}
