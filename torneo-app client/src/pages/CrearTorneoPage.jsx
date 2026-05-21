import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDeportes } from '../hooks/useDeportes'
import { torneoService } from '../services/torneoService'
import './CrearTorneoPage.css'

const FORMATOS = [
  { value: 'eliminacion_simple', label: 'Eliminación directa' },
  { value: 'eliminacion_doble', label: 'Doble eliminación' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'suizo', label: 'Sistema Suizo' },
]

const FORM_INICIAL = {
  nombre: '',
  deporte_id: '',
  formato: '',
  max_jugadores: '',
  elo_minimo: '',
  elo_maximo: '',
  fecha_inicio: '',
  fecha_fin: '',
}

export function CrearTorneoPage() {
  const navigate = useNavigate()
  const { deportes, loading: loadingDeportes } = useDeportes()

  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

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
      nombre: form.nombre,
      deporte_id: Number(form.deporte_id),
      formato: form.formato,
      max_jugadores: Number(form.max_jugadores),
      ...(form.elo_minimo !== '' && { elo_minimo: Number(form.elo_minimo) }),
      ...(form.elo_maximo !== '' && { elo_maximo: Number(form.elo_maximo) }),
      ...(form.fecha_inicio && { fecha_inicio: form.fecha_inicio }),
      ...(form.fecha_fin && { fecha_fin: form.fecha_fin }),
    }

    try {
      await torneoService.create(payload)
      navigate('/torneos')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrores(err.response.data.errors)
      } else {
        setErrorGeneral(err.response?.data?.message ?? 'Error al crear el torneo. Inténtalo de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="crear-torneo-page">
      <div className="crear-torneo-container">
        <div className="crear-torneo-header">
          <Link to="/torneos" className="btn-volver">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </Link>
          <h1>Nuevo torneo</h1>
          <p className="crear-torneo-subtitulo">Rellena los datos para crear un nuevo torneo.</p>
        </div>

        {errorGeneral && (
          <div className="form-error-general">{errorGeneral}</div>
        )}

        <form className="crear-torneo-form" onSubmit={handleSubmit} noValidate>

          {/* ── Información básica ─────────────────────── */}
          <fieldset className="form-section">
            <legend className="form-section-title">Información básica</legend>

            <div className="form-field">
              <label htmlFor="nombre" className="form-label">
                Nombre del torneo <span className="form-required">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={'form-input' + (errores.nombre ? ' form-input--error' : '')}
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Copa Primavera 2025"
                maxLength={255}
                required
              />
              {errores.nombre && <p className="form-field-error">{errores.nombre[0]}</p>}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="deporte_id" className="form-label">
                  Deporte <span className="form-required">*</span>
                </label>
                <select
                  id="deporte_id"
                  name="deporte_id"
                  className={'form-select' + (errores.deporte_id ? ' form-input--error' : '')}
                  value={form.deporte_id}
                  onChange={handleChange}
                  required
                  disabled={loadingDeportes}
                >
                  <option value="">Selecciona un deporte</option>
                  {deportes.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {errores.deporte_id && <p className="form-field-error">{errores.deporte_id[0]}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="formato" className="form-label">
                  Formato <span className="form-required">*</span>
                </label>
                <select
                  id="formato"
                  name="formato"
                  className={'form-select' + (errores.formato ? ' form-input--error' : '')}
                  value={form.formato}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un formato</option>
                  {FORMATOS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                {errores.formato && <p className="form-field-error">{errores.formato[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Configuración ──────────────────────────── */}
          <fieldset className="form-section">
            <legend className="form-section-title">Configuración</legend>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="max_jugadores" className="form-label">
                  Máximo de jugadores <span className="form-required">*</span>
                </label>
                <input
                  id="max_jugadores"
                  name="max_jugadores"
                  type="number"
                  className={'form-input' + (errores.max_jugadores ? ' form-input--error' : '')}
                  value={form.max_jugadores}
                  onChange={handleChange}
                  min={2}
                  placeholder="Ej: 16"
                  required
                />
                {errores.max_jugadores && <p className="form-field-error">{errores.max_jugadores[0]}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="elo_minimo" className="form-label">
                  ELO mínimo <span className="form-hint">(opcional)</span>
                </label>
                <input
                  id="elo_minimo"
                  name="elo_minimo"
                  type="number"
                  className={'form-input' + (errores.elo_minimo ? ' form-input--error' : '')}
                  value={form.elo_minimo}
                  onChange={handleChange}
                  min={0}
                  placeholder="Ej: 400"
                />
                {errores.elo_minimo && <p className="form-field-error">{errores.elo_minimo[0]}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="elo_maximo" className="form-label">
                  ELO máximo <span className="form-hint">(opcional)</span>
                </label>
                <input
                  id="elo_maximo"
                  name="elo_maximo"
                  type="number"
                  className={'form-input' + (errores.elo_maximo ? ' form-input--error' : '')}
                  value={form.elo_maximo}
                  onChange={handleChange}
                  min={0}
                  placeholder="Ej: 1200"
                />
                {errores.elo_maximo && <p className="form-field-error">{errores.elo_maximo[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Fechas ─────────────────────────────────── */}
          <fieldset className="form-section">
            <legend className="form-section-title">
              Fechas <span className="form-hint">(opcionales)</span>
            </legend>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fecha_inicio" className="form-label">Fecha de inicio</label>
                <input
                  id="fecha_inicio"
                  name="fecha_inicio"
                  type="date"
                  className={'form-input' + (errores.fecha_inicio ? ' form-input--error' : '')}
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
                {errores.fecha_inicio && <p className="form-field-error">{errores.fecha_inicio[0]}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="fecha_fin" className="form-label">Fecha de fin</label>
                <input
                  id="fecha_fin"
                  name="fecha_fin"
                  type="date"
                  className={'form-input' + (errores.fecha_fin ? ' form-input--error' : '')}
                  value={form.fecha_fin}
                  onChange={handleChange}
                  min={form.fecha_inicio || undefined}
                />
                {errores.fecha_fin && <p className="form-field-error">{errores.fecha_fin[0]}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Acciones ───────────────────────────────── */}
          <div className="form-actions">
            <Link to="/torneos" className="btn-cancelar">
              Cancelar
            </Link>
            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear torneo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
