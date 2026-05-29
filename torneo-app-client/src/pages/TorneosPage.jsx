import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTorneos } from '../hooks/useTorneos'
import { useDeportes } from '../hooks/useDeportes'
import { TorneoCard } from '../components/TorneoCard'
import './TorneosPage.css'

function paginasVisibles(pagina, ultima) {
  if (ultima <= 7) return Array.from({ length: ultima }, (_, i) => i + 1)
  const paginas = new Set([1, ultima, pagina])
  for (let d = 1; d <= 2; d++) {
    if (pagina - d >= 1)     paginas.add(pagina - d)
    if (pagina + d <= ultima) paginas.add(pagina + d)
  }
  return [...paginas].sort((a, b) => a - b)
}

function Paginador({ pagina, ultima, total, onChange }) {
  const paginas = paginasVisibles(pagina, ultima)

  return (
    <div className="torneos-paginacion">
      <button
        className="btn-pagina btn-pagina--nav"
        disabled={pagina <= 1}
        onClick={() => onChange(pagina - 1)}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {paginas.map((p, i) => {
        const anterior = paginas[i - 1]
        const hueco    = anterior && p - anterior > 1
        return (
          <span key={p} className="pagina-grupo">
            {hueco && <span className="pagina-puntos">…</span>}
            <button
              className={`btn-pagina ${p === pagina ? 'btn-pagina--activo' : ''}`}
              onClick={() => onChange(p)}
              disabled={p === pagina}
              aria-current={p === pagina ? 'page' : undefined}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        className="btn-pagina btn-pagina--nav"
        disabled={pagina >= ultima}
        onClick={() => onChange(pagina + 1)}
        aria-label="Página siguiente"
      >
        ›
      </button>

      <span className="pagina-info">{total} resultado{total !== 1 ? 's' : ''}</span>
    </div>
  )
}

const ESTADOS = [
  { value: '', label: 'Activos (abierto + en curso)' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function TorneosPage() {
  const navigate = useNavigate()
  const { torneos, meta, loading, error, cargar } = useTorneos()
  const { deportes } = useDeportes()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')

  useEffect(() => {
    const params = {}
    if (filtroEstado) params.estado = filtroEstado
    if (filtroDeporte) params.deporte_id = filtroDeporte
    cargar(params)
  }, [filtroEstado, filtroDeporte, cargar])

  const torneosFiltrados = torneos.filter((t) =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('')
    setFiltroDeporte('')
  }

  const hayFiltrosActivos = busqueda || filtroEstado || filtroDeporte

  return (
    <div className="torneos-page">
      <header className="torneos-header">
        <div className="torneos-header-top">
          <div>
            <h1>Torneos</h1>
            {meta && (
              <p className="torneos-subtitulo">
                {meta.total} torneo{meta.total !== 1 ? 's' : ''} disponible{meta.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link to="/torneos/nuevo" className="btn-nuevo-torneo">
            + Nuevo torneo
          </Link>
        </div>
      </header>

      <div className="torneos-filtros">
        <div className="filtro-busqueda">
          <svg className="filtro-busqueda-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="filtro-input"
            placeholder="Buscar torneo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          className="filtro-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        <select
          className="filtro-select"
          value={filtroDeporte}
          onChange={(e) => setFiltroDeporte(e.target.value)}
        >
          <option value="">Todos los deportes</option>
          {deportes.map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>

        {hayFiltrosActivos && (
          <button className="btn-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="torneos-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="torneos-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="torneo-card torneo-card--skeleton">
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          ))}
        </div>
      ) : torneosFiltrados.length === 0 ? (
        <div className="torneos-vacio">
          <p>No se encontraron torneos{hayFiltrosActivos ? ' con los filtros aplicados' : ''}.</p>
          {hayFiltrosActivos && (
            <button className="btn-primary" onClick={limpiarFiltros}>
              Quitar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="torneos-grid">
          {torneosFiltrados.map((torneo) => (
            <TorneoCard
              key={torneo.id}
              torneo={torneo}
              onVerDetalle={(id) => navigate(`/torneos/${id}`)}
            />
          ))}
        </div>
      )}

      {meta && meta.ultima >= 1 && (
        <Paginador
          pagina={meta.pagina}
          ultima={meta.ultima}
          total={meta.total}
          onChange={(p) => cargar({
            ...(filtroEstado  && { estado:     filtroEstado }),
            ...(filtroDeporte && { deporte_id: filtroDeporte }),
            page: p,
          })}
        />
      )}
    </div>
  )
}
