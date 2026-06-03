import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTorneo } from '../../hooks/useTorneo'
import { torneoService } from '../../services/torneoService'

const TAMANIOS_BRACKET = [2, 4, 8, 16, 32]

const FORMATO_LABELS = {
  eliminacion_simple: 'Eliminación directa',
  eliminacion_doble:  'Doble eliminación',
  round_robin:        'Round Robin',
  suizo:              'Sistema Suizo',
}

const inputBase = 'w-full px-3 py-[10px] text-[15px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-bg border border-skin-border rounded-lg transition-all box-border placeholder:text-skin-text/60 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]'
const inputErr  = 'border-red-500'
const selectBase = `${inputBase} select-arrow pr-8 cursor-pointer`
const labelBase = 'text-[14px] font-medium text-skin-heading'

function Campo({ label, ayuda, requerido, error, children }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className={labelBase}>
        {label}
        {requerido && <span className="text-accent ml-1">*</span>}
        {ayuda && <span className="text-[12px] font-normal text-skin-text ml-1">({ayuda})</span>}
      </label>
      {children}
      {error && <p className="text-[13px] text-red-600 m-0">{error}</p>}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="bg-skin-card border border-skin-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="px-6 py-4 border-b border-skin-border bg-skin-bg">
        <span className="text-[15px] font-semibold text-skin-heading">{titulo}</span>
      </div>
      <div className="px-6 py-6 flex flex-col gap-5">{children}</div>
    </div>
  )
}

function toDateInput(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toISOString().slice(0, 10)
}

export function EditarTorneoPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { torneo, loading: loadingTorneo, error: errorCarga, cargar } = useTorneo()

  const [form,         setForm]         = useState(null)
  const [errores,      setErrores]      = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando,     setEnviando]     = useState(false)

  useEffect(() => { cargar(id) }, [id, cargar])
  useEffect(() => {
    if (!torneo) return
    setForm({
      nombre:        torneo.nombre ?? '',
      max_jugadores: torneo.max_jugadores ?? '',
      min_miembros:  torneo.min_miembros ?? 1,
      max_miembros:  torneo.max_miembros ?? '',
      elo_minimo:    torneo.elo_minimo ?? '',
      elo_maximo:    torneo.elo_maximo ?? '',
      fecha_inicio:  toDateInput(torneo.fecha_inicio),
      fecha_fin:     toDateInput(torneo.fecha_fin),
    })
  }, [torneo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true); setErrores({}); setErrorGeneral(null)
    const payload = {
      nombre:        form.nombre,
      max_jugadores: Number(form.max_jugadores),
      min_miembros:  form.min_miembros !== '' ? Number(form.min_miembros) : 1,
      max_miembros:  form.max_miembros !== '' ? Number(form.max_miembros) : null,
      elo_minimo:    form.elo_minimo   !== '' ? Number(form.elo_minimo)   : null,
      elo_maximo:    form.elo_maximo   !== '' ? Number(form.elo_maximo)   : null,
      fecha_inicio:  form.fecha_inicio || null,
      fecha_fin:     form.fecha_fin    || null,
    }
    try {
      await torneoService.update(id, payload)
      navigate(`/torneos/${id}`)
    } catch (err) {
      if (err.response?.data?.errors) setErrores(err.response.data.errors)
      else setErrorGeneral(err.response?.data?.message ?? 'Error al guardar los cambios.')
    } finally {
      setEnviando(false)
    }
  }

  if (loadingTorneo || !form) return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-4">
      <div className="shimmer h-4 w-1/4 rounded-md" />
      <div className="shimmer h-7 w-1/2 rounded-md" />
      <div className="shimmer h-[200px] rounded-xl" />
    </div>
  )

  if (errorCarga) return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-red-600 mb-4">{errorCarga}</p>
      <Link to="/torneos" className="text-[13px] text-skin-text hover:text-skin-heading no-underline">← Volver a torneos</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full box-border max-md:px-4 max-md:py-6">

      <Link to={`/torneos/${id}`}
        className="inline-flex items-center gap-1.5 mb-6 text-[13px] font-medium text-skin-text no-underline transition-colors hover:text-skin-heading">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al torneo
      </Link>

      <div className="mb-8">
        <h1 className="text-[32px] font-semibold text-skin-heading m-0 tracking-tight">Editar torneo</h1>
        <p className="text-[14px] text-skin-text mt-1">El deporte y el formato no se pueden cambiar.</p>
      </div>

      {/* Solo lectura: deporte y formato */}
      <div className="flex gap-2 flex-wrap mb-6">
        {torneo.deporte && (
          <span className="inline-flex items-center px-3 py-[5px] text-[12px] font-semibold text-skin-heading bg-skin-code border border-skin-border rounded-full">
            {torneo.deporte.nombre}
          </span>
        )}
        <span className="inline-flex items-center px-3 py-[5px] text-[12px] font-semibold text-skin-text bg-skin-code border border-skin-border rounded-full">
          {FORMATO_LABELS[torneo.formato] ?? torneo.formato}
        </span>
      </div>

      {errorGeneral && (
        <div className="px-[14px] py-[10px] mb-6 text-[14px] text-red-600 bg-red-500/8 border border-red-500/20 rounded-lg">
          {errorGeneral}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

        <Seccion titulo="Información básica">
          <Campo label="Nombre del torneo" requerido error={errores.nombre?.[0]}>
            <input id="nombre" name="nombre" type="text"
              className={`${inputBase} ${errores.nombre ? inputErr : ''}`}
              value={form.nombre} onChange={handleChange} maxLength={255} required />
          </Campo>
        </Seccion>

        <Seccion titulo="Configuración">
          <Campo label="Número de equipos" requerido error={errores.max_jugadores?.[0]}>
            <select id="max_jugadores" name="max_jugadores"
              className={`${selectBase} ${errores.max_jugadores ? inputErr : ''}`}
              value={form.max_jugadores} onChange={handleChange} required>
              <option value="">Selecciona el tamaño</option>
              {TAMANIOS_BRACKET.map(n => <option key={n} value={n}>{n} equipos</option>)}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Campo label="Mín. miembros" error={errores.min_miembros?.[0]}>
              <input id="min_miembros" name="min_miembros" type="number"
                className={`${inputBase} ${errores.min_miembros ? inputErr : ''}`}
                value={form.min_miembros} onChange={handleChange} min={1} />
            </Campo>
            <Campo label="Máx. miembros" ayuda="opcional" error={errores.max_miembros?.[0]}>
              <input id="max_miembros" name="max_miembros" type="number"
                className={`${inputBase} ${errores.max_miembros ? inputErr : ''}`}
                value={form.max_miembros} onChange={handleChange}
                min={form.min_miembros || 1} placeholder="Sin límite" />
            </Campo>
            <Campo label="ELO mínimo" ayuda="opcional" error={errores.elo_minimo?.[0]}>
              <input id="elo_minimo" name="elo_minimo" type="number"
                className={`${inputBase} ${errores.elo_minimo ? inputErr : ''}`}
                value={form.elo_minimo} onChange={handleChange} min={0} placeholder="Sin límite" />
            </Campo>
            <Campo label="ELO máximo" ayuda="opcional" error={errores.elo_maximo?.[0]}>
              <input id="elo_maximo" name="elo_maximo" type="number"
                className={`${inputBase} ${errores.elo_maximo ? inputErr : ''}`}
                value={form.elo_maximo} onChange={handleChange} min={0} placeholder="Sin límite" />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Fechas">
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Campo label="Fecha de inicio" error={errores.fecha_inicio?.[0]}>
              <input id="fecha_inicio" name="fecha_inicio" type="date"
                className={`${inputBase} ${errores.fecha_inicio ? inputErr : ''}`}
                value={form.fecha_inicio} onChange={handleChange} />
            </Campo>
            <Campo label="Fecha de fin" error={errores.fecha_fin?.[0]}>
              <input id="fecha_fin" name="fecha_fin" type="date"
                className={`${inputBase} ${errores.fecha_fin ? inputErr : ''}`}
                value={form.fecha_fin} onChange={handleChange}
                min={form.fecha_inicio || undefined} />
            </Campo>
          </div>
        </Seccion>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={`/torneos/${id}`}
            className="px-5 py-[10px] text-[14px] font-medium text-skin-text no-underline border border-skin-border rounded-lg transition-colors hover:border-skin-heading hover:text-skin-heading">
            Cancelar
          </Link>
          <button type="submit" disabled={enviando}
            className="px-6 py-[10px] text-[14px] font-bold text-white bg-accent border-none rounded-lg cursor-pointer transition-opacity hover:enabled:opacity-90 disabled:opacity-60 disabled:cursor-default">
            {enviando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
