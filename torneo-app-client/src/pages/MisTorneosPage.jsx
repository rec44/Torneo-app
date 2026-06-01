import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { torneoService } from '../services/torneoService'
import { TorneoCard } from '../components/TorneoCard'
import './MisTorneosPage.css'

const esActivo = t => t.estado === 'abierto' || t.estado === 'en_curso'

function Seccion({ titulo, torneos, vacio, navigate }) {
  return (
    <section className="mis-torneos-seccion">
      <h2 className="mis-torneos-seccion-titulo">{titulo}</h2>
      {torneos.length === 0 ? (
        <p className="mis-torneos-vacio">{vacio}</p>
      ) : (
        <div className="torneos-grid">
          {torneos.map(t => (
            <TorneoCard key={t.id} torneo={t} onVerDetalle={id => navigate(`/torneos/${id}`)} />
          ))}
        </div>
      )}
    </section>
  )
}

export function MisTorneosPage() {
  const navigate = useNavigate()
  const [creados,  setCreados]  = useState([])
  const [inscrito, setInscrito] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    torneoService.getMisTorneos()
      .then(data => { setCreados(data.creados); setInscrito(data.inscrito) })
      .catch(err  => setError(err.response?.data?.message ?? 'Error al cargar tus torneos.'))
      .finally(() => setLoading(false))
  }, [])

  const creadosActivos  = creados.filter(esActivo)
  const inscritoActivos = inscrito.filter(esActivo)

  return (
    <div className="mis-torneos-page">

      <div className="mis-torneos-header">
        <div>
          <h1 className="mis-torneos-titulo">Mis torneos</h1>
          <p className="mis-torneos-sub">Torneos abiertos y en curso en los que estás involucrado</p>
        </div>
        <Link to="/torneos/nuevo" className="btn-nuevo-torneo">+ Nuevo torneo</Link>
      </div>

      {error && <div className="torneos-error">{error}</div>}

      {loading ? (
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
      ) : (
        <>
          <Seccion
            titulo="Organizados por ti"
            torneos={creadosActivos}
            vacio="No tienes torneos activos como organizador."
            navigate={navigate}
          />
          <Seccion
            titulo="En los que participas"
            torneos={inscritoActivos}
            vacio="No estás inscrito en ningún torneo activo."
            navigate={navigate}
          />
        </>
      )}
    </div>
  )
}
