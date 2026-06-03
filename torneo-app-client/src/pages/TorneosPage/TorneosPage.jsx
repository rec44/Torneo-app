import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTorneos } from '../../hooks/useTorneos'
import { useDeportes } from '../../hooks/useDeportes'
import { TorneoCard } from '../../components/TorneoCard'

/* ── Estilos reutilizables ─────────────────────────────────── */
const inputCls = 'w-full px-[10px] py-2 text-[14px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-code border border-skin-border rounded-lg box-border transition-all placeholder:text-skin-text/70 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]'

const ESTADOS = [
  { value: '',           label: 'Todos' },
  { value: 'abierto',    label: 'Abierto' },
  { value: 'en_curso',   label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
]

function Chip({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-[10px] py-[7px] text-[14px] font-[family-name:var(--font-family-sans)] border-none rounded-lg cursor-pointer transition-all
        ${activo
          ? 'bg-accent/10 text-accent font-semibold hover:bg-accent/10'
          : 'text-skin-heading bg-transparent hover:bg-skin-code'
        }`}
    >
      {children}
    </button>
  )
}

function Paginador({ pagina, ultima, total, onChange }) {
  const btnCls = 'inline-flex items-center justify-center w-[34px] h-[34px] text-[18px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-card border border-skin-border rounded-lg cursor-pointer transition-all hover:enabled:border-accent hover:enabled:text-accent disabled:opacity-30 disabled:cursor-default'
  return (
    <div className="flex items-center justify-center gap-[14px] mt-12">
      <button className={btnCls} disabled={pagina <= 1} onClick={() => onChange(pagina - 1)} aria-label="Anterior">‹</button>
      <span className="text-[14px] font-medium text-skin-text">
        Página {pagina} de {ultima}
        {total != null && <span className="text-skin-text font-normal"> · {total} torneo{total !== 1 ? 's' : ''}</span>}
      </span>
      <button className={btnCls} disabled={pagina >= ultima} onClick={() => onChange(pagina + 1)} aria-label="Siguiente">›</button>
    </div>
  )
}

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
    if (filtroEstado)  params.estado      = filtroEstado
    if (filtroDeporte) params.deporte_id  = filtroDeporte
    if (fechaDesde)    params.fecha_desde = fechaDesde
    if (fechaHasta)    params.fecha_hasta = fechaHasta
    if (eloMin)        params.elo_min     = eloMin
    if (eloMax)        params.elo_max     = eloMax
    cargar(params)
  }, [filtroEstado, filtroDeporte, fechaDesde, fechaHasta, eloMin, eloMax, cargar])

  const torneosFiltrados = torneos.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const limpiarFiltros = () => {
    setBusqueda(''); setFiltroEstado(''); setFiltroDeporte('')
    setFechaDesde(''); setFechaHasta(''); setEloMin(''); setEloMax('')
  }

  const hayFiltros = busqueda || filtroEstado || filtroDeporte || fechaDesde || fechaHasta || eloMin || eloMax

  return (
    <div className="flex items-start gap-0 pr-8 min-h-[calc(100vh-72px)] max-md:flex-col max-md:pr-0">

      {/* ── Sidebar ── */}
      <aside className={`w-[240px] flex-shrink-0 px-6 py-8 pb-12 border-r border-skin-border min-h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto flex flex-col gap-7
        max-md:w-full max-md:min-h-0 max-md:static max-md:border-r-0 max-md:border-b max-md:py-5 max-md:gap-5 max-md:bg-skin-bg
        ${filtrosAbiertos ? 'max-md:flex' : 'max-md:hidden'}`}>

        {/* Búsqueda */}
        <div className="flex flex-col gap-[10px]">
          <div className="relative">
            <svg className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-skin-text pointer-events-none" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="search" className={`${inputCls} pl-8`} placeholder="Buscar torneo…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-[10px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-skin-text">Estado</span>
          <div className="flex flex-col gap-0.5">
            {ESTADOS.map(e => (
              <Chip key={e.value} activo={filtroEstado === e.value} onClick={() => setFiltroEstado(e.value)}>
                {e.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Deporte */}
        {deportes.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-skin-text">Deporte</span>
            <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto scrollbar-thin pb-3
              [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
              max-md:max-h-none max-md:flex-row max-md:flex-wrap max-md:[mask-image:none] max-md:pb-0">
              <Chip activo={filtroDeporte === ''} onClick={() => setFiltroDeporte('')}>Todos</Chip>
              {deportes.map(d => (
                <Chip key={d.id} activo={filtroDeporte === String(d.id)} onClick={() => setFiltroDeporte(String(d.id))}>
                  {d.nombre}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* ELO */}
        <div className="flex flex-col gap-[10px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-skin-text">ELO requerido</span>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Mínimo', value: eloMin, set: setEloMin, ph: '0' },
              { label: 'Máximo', value: eloMax, set: setEloMax, ph: '9999' },
            ].map(({ label, value, set, ph }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[11px] text-skin-text font-medium">{label}</label>
                <input type="number" className={inputCls} min="0" placeholder={ph} value={value} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Fechas */}
        <div className="flex flex-col gap-[10px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-skin-text">Fecha inicio</span>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Desde', value: fechaDesde, set: setFechaDesde, max: fechaHasta || undefined, min: undefined },
              { label: 'Hasta', value: fechaHasta, set: setFechaHasta, min: fechaDesde || undefined, max: undefined },
            ].map(({ label, value, set, min, max }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[11px] text-skin-text font-medium">{label}</label>
                <input type="date" lang="es" className={inputCls} value={value} min={min} max={max} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {hayFiltros && (
          <button onClick={limpiarFiltros}
            className="px-3 py-[7px] text-[11px] font-bold uppercase tracking-[0.05em] text-skin-text bg-transparent border border-skin-border rounded-md cursor-pointer transition-colors hover:text-skin-heading hover:border-skin-heading">
            Limpiar filtros
          </button>
        )}
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 px-8 py-8 pb-16 w-full box-border max-md:px-4 max-md:py-5">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Btn filtros móvil */}
            <button
              onClick={() => setFiltrosAbiertos(v => !v)}
              aria-expanded={filtrosAbiertos}
              className={`md:hidden inline-flex items-center gap-[6px] relative px-[13px] py-[7px] text-[13px] font-semibold border rounded-lg cursor-pointer transition-all
                ${filtrosAbiertos || hayFiltros
                  ? 'text-accent bg-accent/10 border-accent'
                  : 'text-skin-heading bg-skin-card border-skin-border hover:border-accent hover:text-accent'}`}
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Filtros
              {hayFiltros && (
                <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-accent" />
              )}
            </button>
          </div>

          <Link to="/torneos/nuevo"
            className="inline-flex items-center gap-[6px] px-5 py-[9px] text-[13px] font-bold uppercase tracking-[0.03em] text-skin-bg no-underline rounded-lg flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(160deg,#f97316,color-mix(in srgb,#f97316 75%,#000))' }}
          >
            + Nuevo torneo
          </Link>
        </div>

        {error && (
          <div className="px-[18px] py-[14px] text-[14px] text-red-600 bg-red-500/8 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] max-[480px]:grid-cols-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[14px] p-[18px] bg-skin-card rounded-2xl pointer-events-none" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="shimmer h-[13px] w-2/5 rounded-md" />
                <div className="shimmer h-[18px] w-[70%] rounded-md" />
                <div className="shimmer h-[13px] rounded-md" />
                <div className="shimmer h-[13px] rounded-md" />
                <div className="shimmer h-[13px] w-2/5 rounded-md" />
              </div>
            ))}
          </div>
        ) : torneosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-skin-text text-[15px] text-center">
            <p>No se encontraron torneos{hayFiltros ? ' con los filtros aplicados' : ''}.</p>
            {hayFiltros && (
              <button onClick={limpiarFiltros}
                className="inline-flex items-center justify-center px-5 py-[9px] text-[13px] font-bold uppercase tracking-[0.03em] text-skin-bg bg-accent border-none rounded-lg cursor-pointer">
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] max-[480px]:grid-cols-1">
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
