import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTorneo } from '../../hooks/useTorneo'
import { torneoService } from '../../services/torneoService'
import '../CrearTorneoPage/CrearTorneoPage.css'

const TAMANIOS_BRACKET = [2, 4, 8, 16, 32]

function toDateInput(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr).toISOString().slice(0, 10)
}

export function EditarTorneoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { torneo, loading: loadingTorneo, error: errorCarga, cargar } = useTorneo()

  const [form, setForm] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    cargar(id)
  }, [id, cargar])

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
    setEnviando(true)
    setErrores({})
    setErrorGeneral(null)

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
      if (err.response?.data?.errors) {
        setErrores(err.response.data.errors)
      } else {
        setErrorGeneral(err.response?.data?.message ?? 'Error al guardar los cambios.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (loadingTorneo || !form) {
    return (
      <div className="crear-torneo-page">
        <div className="crear-torneo-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 32 }}>
            <div className="linea-esqueleto linea-esqueleto--corta" />
            <div className="linea-esqueleto linea-esqueleto--titulo" />
            <div className="linea-esqueleto" />
          </div>
        </div>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="crear-torneo-page">
        <div className="crear-torneo-container">
          <p style={{ color: '#dc2626' }}>{errorCarga}</p>
          <Link to="/torneos" className="btn-volver">Volver a torneos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="crear-torneo-page">
      <div className="crear-torneo-container">

        <div className="crear-torneo-header">
          <Link to={`/torneos/${id}`} className="btn-volver">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al torneo
          </Link>
          <h1>Editar torneo</h1>
          <p className="crear-torneo-subtitulo">
            Modifica los datos del torneo. El deporte y el formato no se pueden cambiar.
          </p>
        </div>

        {/* Info de solo lectura */}
        <div className="editar-solo-lectura-info">
          {torneo.deporte && (
            <span className="editar-solo-lectura-etiqueta">{torneo.deporte.nombre}</span>
          )}
          <span className="editar-solo-lectura-etiqueta editar-solo-lectura-etiqueta--formato">
            {{
              eliminacion_simple: 'Eliminación directa',
              eliminacion_doble:  'Doble eliminación',
              round_robin:        'Round Robin',
              suizo:              'Sistema Suizo',
            }[torneo.formato] ?? torneo.formato}
          </span>
        </div>

        {errorGeneral && (
          <div className="error-general-formulario">{errorGeneral}</div>
        )}

        <form className="crear-torneo-formulario" onSubmit={handleSubmit} noValidate>

          {/* ── Información básica ─────────────────────── */}
          <fieldset className="seccion-formulario">
            <legend className="seccion-formulario-titulo">Información básica</legend>

            <div className="campo-formulario">
              <label htmlFor="nombre" className="etiqueta-formulario">
                Nombre del torneo <span className="requerido">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={'entrada-formulario' + (errores.nombre ? ' entrada-formulario--error' : '')}
                value={form.nombre}
                onChange={handleChange}
                maxLength={255}
                required
              />
              {errores.nombre && <p className="error-campo-formulario">{errores.nombre[0]}</p>}
            </div>
          </fieldset>

          {/* ── Configuración ──────────────────────────── */}
          <fieldset className="seccion-formulario">
            <legend className="seccion-formulario-titulo">Configuración</legend>

            <div className="fila-formulario">
              <div className="campo-formulario">
                <label htmlFor="max_jugadores" className="etiqueta-formulario">
                  Número de equipos <span className="requerido">*</span>
                </label>
                <select
                  id="max_jugadores"
                  name="max_jugadores"
                  className={'selector-formulario' + (errores.max_jugadores ? ' entrada-formulario--error' : '')}
                  value={form.max_jugadores}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona el tamaño</option>
                  {TAMANIOS_BRACKET.map(n => (
                    <option key={n} value={n}>{n} equipos</option>
                  ))}
                </select>
                {errores.max_jugadores && <p className="error-campo-formulario">{errores.max_jugadores[0]}</p>}
              </div>
            </div>

            <div className="fila-formulario">
              <div className="campo-formulario">
                <label htmlFor="min_miembros" className="etiqueta-formulario">
                  Mín. miembros por equipo
                </label>
                <input
                  id="min_miembros"
                  name="min_miembros"
                  type="number"
                  className={'entrada-formulario' + (errores.min_miembros ? ' entrada-formulario--error' : '')}
                  value={form.min_miembros}
                  onChange={handleChange}
                  min={1}
                />
                {errores.min_miembros && <p className="error-campo-formulario">{errores.min_miembros[0]}</p>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="max_miembros" className="etiqueta-formulario">
                  Máx. miembros por equipo <span className="ayuda-formulario">(opcional)</span>
                </label>
                <input
                  id="max_miembros"
                  name="max_miembros"
                  type="number"
                  className={'entrada-formulario' + (errores.max_miembros ? ' entrada-formulario--error' : '')}
                  value={form.max_miembros}
                  onChange={handleChange}
                  min={form.min_miembros || 1}
                  placeholder="Sin límite"
                />
                {errores.max_miembros && <p className="error-campo-formulario">{errores.max_miembros[0]}</p>}
              </div>
            </div>

            <div className="fila-formulario">
              <div className="campo-formulario">
                <label htmlFor="elo_minimo" className="etiqueta-formulario">
                  ELO mínimo <span className="ayuda-formulario">(opcional)</span>
                </label>
                <input
                  id="elo_minimo"
                  name="elo_minimo"
                  type="number"
                  className={'entrada-formulario' + (errores.elo_minimo ? ' entrada-formulario--error' : '')}
                  value={form.elo_minimo}
                  onChange={handleChange}
                  min={0}
                  placeholder="Sin límite"
                />
                {errores.elo_minimo && <p className="error-campo-formulario">{errores.elo_minimo[0]}</p>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="elo_maximo" className="etiqueta-formulario">
                  ELO máximo <span className="ayuda-formulario">(opcional)</span>
                </label>
                <input
                  id="elo_maximo"
                  name="elo_maximo"
                  type="number"
                  className={'entrada-formulario' + (errores.elo_maximo ? ' entrada-formulario--error' : '')}
                  value={form.elo_maximo}
                  onChange={handleChange}
                  min={0}
                  placeholder="Sin límite"
                />
                {errores.elo_maximo && <p className="error-campo-formulario">{errores.elo_maximo[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Fechas ─────────────────────────────────── */}
          <fieldset className="seccion-formulario">
            <legend className="seccion-formulario-titulo">
              Fechas <span className="ayuda-formulario">(opcionales)</span>
            </legend>

            <div className="fila-formulario">
              <div className="campo-formulario">
                <label htmlFor="fecha_inicio" className="etiqueta-formulario">Fecha de inicio</label>
                <input
                  id="fecha_inicio"
                  name="fecha_inicio"
                  type="date"
                  className={'entrada-formulario' + (errores.fecha_inicio ? ' entrada-formulario--error' : '')}
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
                {errores.fecha_inicio && <p className="error-campo-formulario">{errores.fecha_inicio[0]}</p>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="fecha_fin" className="etiqueta-formulario">Fecha de fin</label>
                <input
                  id="fecha_fin"
                  name="fecha_fin"
                  type="date"
                  className={'entrada-formulario' + (errores.fecha_fin ? ' entrada-formulario--error' : '')}
                  value={form.fecha_fin}
                  onChange={handleChange}
                  min={form.fecha_inicio || undefined}
                />
                {errores.fecha_fin && <p className="error-campo-formulario">{errores.fecha_fin[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Acciones ───────────────────────────────── */}
          <div className="acciones-formulario">
            <Link to={`/torneos/${id}`} className="btn-cancelar">
              Cancelar
            </Link>
            <button type="submit" className="btn-enviar" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
