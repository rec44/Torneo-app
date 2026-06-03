import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTorneos } from '../../hooks/useTorneos'
import { useDeportes } from '../../hooks/useDeportes'
import { TorneoCard } from '../../components/TorneoCard'
import './TorneosPage.css'


function Paginador({ pagina, ultima, total, onChange }) {
  return (
    <div className="torneos-paginacion">
      <button className="btn-pagina-nav" disabled={pagina <= 1}
        onClick={() => onChange(pagina - 1)} aria-label="Anterior">‹</button>
      <span className="pagina-texto">
        Página {pagina} de {ultima}
        {total != null && <span className="pagina-total"> · {total} torneo{total !== 1 ? 's' : ''}</span>}
      </span>
      <button className="btn-pagina-nav" disabled={pagina >= ultima}
        onClick={() => onChange(pagina + 1)} aria-label="Siguiente">›</button>
    </div>
  )
}

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
]

export function TorneosPage() {
  const navigate = useNavigate()
  const { torneos, meta, loading, error, cargar } = useTorneos()
  const { deportes } = useDeportes()

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [busqueda,      setBusqueda]      = useState('')
  const [filtroEstado,  setFiltroEstado]  = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [fechaDesde,    setFechaDesde]    = useState('')
  const [fechaHasta,    setFechaHasta]    = useState('')
  const [eloMin,        setEloMin]        = useState('')
  const [eloMax,        setEloMax]        = useState('')

  useEffect(() => {
    const params = {}
    if (filtroEstado)  params.estado       = filtroEstado
    if (filtroDeporte) params.deporte_id   = filtroDeporte
    if (fechaDesde)    params.fecha_desde  = fechaDesde
    if (fechaHasta)    params.fecha_hasta  = fechaHasta
    if (eloMin)        params.elo_min      = eloMin
    if (eloMax)        params.elo_max      = eloMax
    cargar(params)
  }, [filtroEstado, filtroDeporte, fechaDesde, fechaHasta, eloMin, eloMax, cargar])

  const torneosFiltrados = torneos.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('')
    setFiltroDeporte('')
    setFechaDesde('')
    setFechaHasta('')
    setEloMin('')
    setEloMax('')
  }

  const hayFiltros = busqueda || filtroEstado || filtroDeporte || fechaDesde || fechaHasta || eloMin || eloMax

  return (
    <div className="torneos-page">

      {/* ── Sidebar ── */}
      <aside className={`torneos-lateral ${filtrosAbiertos ? 'torneos-lateral--abierto' : ''}`}>

        <div className="lateral-seccion">
          <div className="filtro-busqueda">
            <svg className="filtro-busqueda-icono" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="search" className="filtro-entrada" placeholder="Buscar torneo…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        <div className="lateral-seccion">
          <span className="lateral-etiqueta">Estado</span>
          <div className="lateral-opciones">
            {ESTADOS.map(e => (
              <button key={e.value}
                className={`lateral-chip ${filtroEstado === e.value ? 'lateral-chip--activo' : ''}`}
                onClick={() => setFiltroEstado(e.value)}
              >{e.label}</button>
            ))}
          </div>
        </div>

        {deportes.length > 0 && (
          <div className="lateral-seccion">
            <span className="lateral-etiqueta">Deporte</span>
            <div className="lateral-opciones lateral-opciones--desplazable">
              <button
                className={`lateral-chip ${filtroDeporte === '' ? 'lateral-chip--activo' : ''}`}
                onClick={() => setFiltroDeporte('')}
              >Todos</button>
              {deportes.map(d => (
                <button key={d.id}
                  className={`lateral-chip ${filtroDeporte === String(d.id) ? 'lateral-chip--activo' : ''}`}
                  onClick={() => setFiltroDeporte(String(d.id))}
                >{d.nombre}</button>
              ))}
            </div>
          </div>
        )}

        <div className="lateral-seccion">
          <span className="lateral-etiqueta">ELO requerido</span>
          <div className="lateral-fechas">
            <div className="lateral-fecha-campo">
              <label className="lateral-fecha-etiqueta">Mínimo</label>
              <input type="number" className="filtro-fecha" min="0" placeholder="0"
                value={eloMin} onChange={e => setEloMin(e.target.value)} />
            </div>
            <div className="lateral-fecha-campo">
              <label className="lateral-fecha-etiqueta">Máximo</label>
              <input type="number" className="filtro-fecha" min="0" placeholder="9999"
                value={eloMax} onChange={e => setEloMax(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="lateral-seccion">
          <span className="lateral-etiqueta">Fecha inicio</span>
          <div className="lateral-fechas">
            <div className="lateral-fecha-campo">
              <label className="lateral-fecha-etiqueta">Desde</label>
              <input type="date" className="filtro-fecha" lang="es"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div className="lateral-fecha-campo">
              <label className="lateral-fecha-etiqueta">Hasta</label>
              <input type="date" className="filtro-fecha" lang="es"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={e => setFechaHasta(e.target.value)} />
            </div>
          </div>
        </div>

        {hayFiltros && (
          <button className="btn-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </aside>

      {/* ── Main ── */}
      <main className="torneos-principal">
        <div className="torneos-principal-cabecera">
          <div className="torneos-principal-cabecera-izq">
            <button
              className={`btn-filtros-movil ${filtrosAbiertos ? 'btn-filtros-movil--activo' : ''}`}
              onClick={() => setFiltrosAbiertos(v => !v)}
              aria-expanded={filtrosAbiertos}
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Filtros
              {hayFiltros && <span className="btn-filtros-punto" />}
            </button>
          </div>
          <Link to="/torneos/nuevo" className="btn-nuevo-torneo">+ Nuevo torneo</Link>
        </div>

        {error && <div className="torneos-error">{error}</div>}

        {loading ? (
          <div className="torneos-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="tarjeta-torneo tarjeta-torneo--esqueleto">
                <div className="linea-esqueleto linea-esqueleto--corta" />
                <div className="linea-esqueleto linea-esqueleto--titulo" />
                <div className="linea-esqueleto" />
                <div className="linea-esqueleto" />
                <div className="linea-esqueleto linea-esqueleto--corta" />
              </div>
            ))}
          </div>
        ) : torneosFiltrados.length === 0 ? (
          <div className="torneos-vacio">
            <p>No se encontraron torneos{hayFiltros ? ' con los filtros aplicados' : ''}.</p>
            {hayFiltros && <button className="btn-primario" onClick={limpiarFiltros}>Quitar filtros</button>}
          </div>
        ) : (
          <div className="torneos-grid">
            {torneosFiltrados.map(torneo => (
              <TorneoCard key={torneo.id} torneo={torneo}
                onVerDetalle={id => navigate(`/torneos/${id}`)} />
            ))}
          </div>
        )}

        {meta && meta.ultima >= 1 && (
          <Paginador pagina={meta.pagina} ultima={meta.ultima} total={meta.total}
            onChange={p => cargar({
              ...(filtroEstado  && { estado:      filtroEstado }),
              ...(filtroDeporte && { deporte_id:  filtroDeporte }),
              ...(fechaDesde    && { fecha_desde: fechaDesde }),
              ...(fechaHasta    && { fecha_hasta: fechaHasta }),
              ...(eloMin        && { elo_min:     eloMin }),
              ...(eloMax        && { elo_max:     eloMax }),
              page: p,
            })} />
        )}
      </main>

    </div>
  )
}
