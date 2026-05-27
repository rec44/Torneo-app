import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { torneoService } from '../services/torneoService'
import { TorneoCard } from '../components/TorneoCard'
import './MisTorneosPage.css'

export function MisTorneosPage() {
  const navigate = useNavigate()
  const [creados, setCreados]   = useState([])
  const [inscrito, setInscrito] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    torneoService.getMisTorneos()
      .then(data => {
        setCreados(data.creados)
        setInscrito(data.inscrito)
      })
      .catch(err => setError(err.response?.data?.message ?? 'Error al cargar tus torneos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mis-torneos-page">
      <header className="mis-torneos-header">
        <h1>Mis torneos</h1>
      </header>

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
          <section className="mis-torneos-seccion">
            <h2 className="mis-torneos-seccion-titulo">
              Torneos que organizas
              <span className="mis-torneos-count">{creados.length}</span>
            </h2>
            {creados.length === 0 ? (
              <p className="mis-torneos-vacio">No has creado ningún torneo aún.</p>
            ) : (
              <div className="torneos-grid">
                {creados.map(t => (
                  <TorneoCard
                    key={t.id}
                    torneo={t}
                    onVerDetalle={(id) => navigate(`/torneos/${id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mis-torneos-seccion">
            <h2 className="mis-torneos-seccion-titulo">
              Torneos en los que participas
              <span className="mis-torneos-count">{inscrito.length}</span>
            </h2>
            {inscrito.length === 0 ? (
              <p className="mis-torneos-vacio">No estás inscrito en ningún torneo.</p>
            ) : (
              <div className="torneos-grid">
                {inscrito.map(t => (
                  <TorneoCard
                    key={t.id}
                    torneo={t}
                    onVerDetalle={(id) => navigate(`/torneos/${id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
