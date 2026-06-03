import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { torneoService } from '../../services/torneoService'
import { TorneoCard } from '../../components/TorneoCard'

const esActivo = t => t.estado === 'abierto' || t.estado === 'en_curso'

function Seccion({ titulo, torneos, vacio, navigate }) {
  return (
    <section className="mb-10">
      <h2 className="text-[18px] font-semibold text-skin-heading mb-4">{titulo}</h2>
      {torneos.length === 0 ? (
        <p className="text-[14px] text-skin-text">{vacio}</p>
      ) : (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] max-[480px]:grid-cols-1">
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
    <div className="max-w-5xl mx-auto px-8 py-10 w-full box-border max-md:px-4 max-md:py-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-[32px] font-semibold text-skin-heading m-0 tracking-tight">Mis torneos</h1>
          <p className="text-[14px] text-skin-text mt-1">Torneos abiertos y en curso en los que estás involucrado</p>
        </div>
        <Link to="/torneos/nuevo"
          className="inline-flex items-center gap-[6px] px-5 py-[9px] text-[13px] font-bold uppercase tracking-[0.03em] text-skin-bg no-underline rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(160deg,#f97316,color-mix(in srgb,#f97316 75%,#000))' }}>
          + Nuevo torneo
        </Link>
      </div>

      {error && (
        <div className="px-[18px] py-[14px] text-[14px] text-red-600 bg-red-500/8 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[14px] p-[18px] bg-skin-card rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="shimmer h-[13px] w-2/5 rounded-md" />
              <div className="shimmer h-[18px] w-[70%] rounded-md" />
              <div className="shimmer h-[13px] rounded-md" />
              <div className="shimmer h-[13px] w-2/5 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <Seccion titulo="Organizados por ti"    torneos={creadosActivos}  vacio="No tienes torneos activos como organizador."     navigate={navigate} />
          <Seccion titulo="En los que participas" torneos={inscritoActivos} vacio="No estás inscrito en ningún torneo activo."       navigate={navigate} />
        </>
      )}
    </div>
  )
}
