import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDeportes } from '../../hooks/useDeportes'
import { torneoService } from '../../services/torneoService'
import { PROVINCIAS, MUNICIPIOS } from '../../data/municipios'

const TAMANIOS_BRACKET = [2, 4, 8, 16, 32]

const FORM_INICIAL = {
  nombre: '', deporte_id: '', max_jugadores: '',
  min_miembros: '1', max_miembros: '',
  elo_minimo: '', elo_maximo: '',
  fecha_inicio: '', fecha_fin: '',
  direccion: '', ciudad: '', provincia: '',
}

/* ── Estilos reutilizables ──────────────────────────────────── */
const inputBase = 'w-full px-3 py-[10px] text-[15px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-bg border border-skin-border rounded-lg transition-all box-border placeholder:text-skin-text/60 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]'
const inputErr  = 'border-red-500'
const selectBase = `${inputBase} select-arrow pr-8 cursor-pointer`
const labelBase = 'text-[14px] font-medium text-skin-heading'

function Campo({ label, requerido, ayuda, error, children }) {
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

function Seccion({ numero, titulo, ayuda, children }) {
  return (
    <div className="bg-skin-card border border-skin-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-skin-border bg-skin-bg">
        <span className="text-[11px] font-bold font-mono text-accent tracking-widest">{numero}</span>
        <span className="text-[15px] font-semibold text-skin-heading">
          {titulo}
          {ayuda && <span className="text-[12px] font-normal text-skin-text ml-2">({ayuda})</span>}
        </span>
      </div>
      <div className="px-6 py-6 flex flex-col gap-5">{children}</div>
    </div>
  )
}

export function CrearTorneoPage() {
  const navigate = useNavigate()
  const { deportes, loading: loadingDeportes } = useDeportes()

  const [form,         setForm]         = useState(FORM_INICIAL)
  const [errores,      setErrores]      = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando,     setEnviando]     = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'fecha_inicio' && next.fecha_fin && value > next.fecha_fin) next.fecha_fin = ''
      if (name === 'fecha_fin'   && next.fecha_inicio && value < next.fecha_inicio) next.fecha_inicio = ''
      if (name === 'provincia') next.ciudad = ''
      return next
    })
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }))
  }

  const ciudadesDisponibles = form.provincia ? (MUNICIPIOS[form.provincia] ?? []) : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true); setErrores({}); setErrorGeneral(null)
    const payload = {
      nombre:        form.nombre,
      deporte_id:    Number(form.deporte_id),
      formato:       'eliminacion_simple',
      max_jugadores: Number(form.max_jugadores),
      min_miembros:  form.min_miembros !== '' ? Number(form.min_miembros) : 1,
      ...(form.max_miembros !== '' && { max_miembros: Number(form.max_miembros) }),
      elo_minimo:    Number(form.elo_minimo),
      elo_maximo:    Number(form.elo_maximo),
      ...(form.fecha_inicio && { fecha_inicio: form.fecha_inicio }),
      ...(form.fecha_fin    && { fecha_fin:    form.fecha_fin }),
      direccion: form.direccion, ciudad: form.ciudad, provincia: form.provincia,
    }
    try {
      await torneoService.create(payload)
      navigate('/torneos')
    } catch (err) {
      if (err.response?.data?.errors) setErrores(err.response.data.errors)
      else setErrorGeneral(err.response?.data?.message ?? 'Error al crear el torneo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full box-border max-md:px-4 max-md:py-6">

      <Link to="/torneos"
        className="inline-flex items-center gap-1.5 mb-6 text-[13px] font-medium text-skin-text no-underline transition-colors hover:text-skin-heading">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a torneos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-[6px] mb-3 text-[12px] font-semibold text-accent bg-accent/10 rounded-full border border-accent/20">
          <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
            <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M2 5h3M18 5h-3M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          Nuevo torneo
        </div>
        <h1 className="text-[32px] font-semibold text-skin-heading m-0 tracking-tight">Crea tu competición</h1>
      </div>

      {errorGeneral && (
        <div className="px-[14px] py-[10px] mb-6 text-[14px] text-red-600 bg-red-500/8 border border-red-500/20 rounded-lg">
          {errorGeneral}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

        {/* 01 — Información básica */}
        <Seccion numero="01" titulo="Información básica">
          <Campo label="Nombre del torneo" requerido error={errores.nombre?.[0]}>
            <input id="nombre" name="nombre" type="text"
              className={`${inputBase} ${errores.nombre ? inputErr : ''}`}
              value={form.nombre} onChange={handleChange}
              placeholder="Ej: Copa Primavera 2025" maxLength={255} required />
          </Campo>
          <Campo label="Deporte" requerido error={errores.deporte_id?.[0]}>
            <select id="deporte_id" name="deporte_id"
              className={`${selectBase} ${errores.deporte_id ? inputErr : ''}`}
              value={form.deporte_id} onChange={handleChange}
              required disabled={loadingDeportes}>
              <option value="">Selecciona un deporte</option>
              {deportes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </Campo>
        </Seccion>

        {/* 02 — Configuración */}
        <Seccion numero="02" titulo="Configuración">
          <Campo label="Número de equipos" requerido error={errores.max_jugadores?.[0]}>
            <select id="max_jugadores" name="max_jugadores"
              className={`${selectBase} ${errores.max_jugadores ? inputErr : ''}`}
              value={form.max_jugadores} onChange={handleChange} required>
              <option value="">Selecciona el tamaño</option>
              {TAMANIOS_BRACKET.map(n => <option key={n} value={n}>{n} equipos</option>)}
            </select>
          </Campo>

          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Campo label="Mín. miembros por equipo" error={errores.min_miembros?.[0]}>
              <input id="min_miembros" name="min_miembros" type="number"
                className={`${inputBase} ${errores.min_miembros ? inputErr : ''}`}
                value={form.min_miembros} onChange={handleChange} min={1} placeholder="1" />
            </Campo>
            <Campo label="Máx. miembros por equipo" ayuda="opcional" error={errores.max_miembros?.[0]}>
              <input id="max_miembros" name="max_miembros" type="number"
                className={`${inputBase} ${errores.max_miembros ? inputErr : ''}`}
                value={form.max_miembros} onChange={handleChange}
                min={form.min_miembros || 1} placeholder="Sin límite" />
            </Campo>
            <Campo label="ELO mínimo" requerido error={errores.elo_minimo?.[0]}>
              <input id="elo_minimo" name="elo_minimo" type="number"
                className={`${inputBase} ${errores.elo_minimo ? inputErr : ''}`}
                value={form.elo_minimo} onChange={handleChange} min={0} placeholder="Ej: 400" required />
            </Campo>
            <Campo label="ELO máximo" requerido error={errores.elo_maximo?.[0]}>
              <input id="elo_maximo" name="elo_maximo" type="number"
                className={`${inputBase} ${errores.elo_maximo ? inputErr : ''}`}
                value={form.elo_maximo} onChange={handleChange} min={0} placeholder="Ej: 1200" required />
            </Campo>
          </div>
        </Seccion>

        {/* 03 — Localización */}
        <Seccion numero="03" titulo="Localización">
          <Campo label="Dirección" requerido error={errores.direccion?.[0]}>
            <input id="direccion" name="direccion" type="text"
              className={`${inputBase} ${errores.direccion ? inputErr : ''}`}
              value={form.direccion} onChange={handleChange}
              placeholder="Ej: Calle Mayor 12, pabellón B" maxLength={255} required />
          </Campo>
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Campo label="Provincia" requerido error={errores.provincia?.[0]}>
              <select id="provincia" name="provincia"
                className={`${selectBase} ${errores.provincia ? inputErr : ''}`}
                value={form.provincia} onChange={handleChange} required>
                <option value="">Selecciona una provincia</option>
                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>
            <Campo label="Ciudad" requerido error={errores.ciudad?.[0]}>
              <select id="ciudad" name="ciudad"
                className={`${selectBase} ${errores.ciudad ? inputErr : ''} ${!form.provincia ? 'opacity-60' : ''}`}
                value={form.ciudad} onChange={handleChange}
                disabled={!form.provincia} required>
                <option value="">{form.provincia ? 'Selecciona una ciudad' : 'Primero selecciona provincia'}</option>
                {ciudadesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
          </div>
        </Seccion>

        {/* 04 — Fechas */}
        <Seccion numero="04" titulo="Fechas" ayuda="opcionales">
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Campo label="Fecha de inicio" error={errores.fecha_inicio?.[0]}>
              <input id="fecha_inicio" name="fecha_inicio" type="date"
                className={`${inputBase} ${errores.fecha_inicio ? inputErr : ''}`}
                value={form.fecha_inicio} onChange={handleChange}
                max={form.fecha_fin || undefined} />
            </Campo>
            <Campo label="Fecha de fin" error={errores.fecha_fin?.[0]}>
              <input id="fecha_fin" name="fecha_fin" type="date"
                className={`${inputBase} ${errores.fecha_fin ? inputErr : ''}`}
                value={form.fecha_fin} onChange={handleChange}
                min={form.fecha_inicio || undefined} />
            </Campo>
          </div>
        </Seccion>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/torneos"
            className="px-5 py-[10px] text-[14px] font-medium text-skin-text no-underline border border-skin-border rounded-lg transition-colors hover:border-skin-heading hover:text-skin-heading">
            Cancelar
          </Link>
          <button type="submit" disabled={enviando}
            className="px-6 py-[10px] text-[14px] font-bold text-white bg-accent border-none rounded-lg cursor-pointer transition-opacity hover:enabled:opacity-90 disabled:opacity-60 disabled:cursor-default">
            {enviando ? 'Creando...' : 'Crear torneo'}
          </button>
        </div>

      </form>
    </div>
  )
}
