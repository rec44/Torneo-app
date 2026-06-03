import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDeportes } from '../../hooks/useDeportes'
import { torneoService } from '../../services/torneoService'
import { PROVINCIAS, MUNICIPIOS } from '../../data/municipios'
import './CrearTorneoPage.css'

const TAMANIOS_BRACKET = [2, 4, 8, 16, 32]

const FORM_INICIAL = {
  nombre: '',
  deporte_id: '',
  max_jugadores: '',
  min_miembros: '1',
  max_miembros: '',
  elo_minimo: '',
  elo_maximo: '',
  fecha_inicio: '',
  fecha_fin: '',
  direccion: '',
  ciudad: '',
  provincia: '',
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
    setForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'fecha_inicio' && next.fecha_fin && value > next.fecha_fin)
        next.fecha_fin = ''
      if (name === 'fecha_fin' && next.fecha_inicio && value < next.fecha_inicio)
        next.fecha_inicio = ''
      if (name === 'provincia')
        next.ciudad = ''
      return next
    })
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }))
  }

  const ciudadesDisponibles = form.provincia ? (MUNICIPIOS[form.provincia] ?? []) : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setErrores({})
    setErrorGeneral(null)

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
      direccion: form.direccion,
      ciudad:    form.ciudad,
      provincia: form.provincia,
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

        <Link to="/torneos" className="btn-volver">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a torneos
        </Link>

        <div className="crear-torneo-header">
          <div className="crear-torneo-badge">
            <svg viewBox="0 0 20 20" fill="none" width="13" height="13" aria-hidden="true">
              <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
              <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            Nuevo torneo
          </div>
          <h1 className="crear-torneo-titulo">Crea tu competición</h1>
        </div>

        {errorGeneral && (
          <div className="error-general-formulario">{errorGeneral}</div>
        )}

        <form className="crear-torneo-formulario" onSubmit={handleSubmit} noValidate>

          {/* ── Información básica ─────────────────────── */}
          <div className="seccion-formulario">
            <div className="seccion-formulario-cabecera">
              <span className="seccion-formulario-numero">01</span>
              <span className="seccion-formulario-titulo">Información básica</span>
            </div>
            <div className="seccion-formulario-cuerpo">

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
                  placeholder="Ej: Copa Primavera 2025"
                  maxLength={255}
                  required
                />
                {errores.nombre && <p className="error-campo-formulario">{errores.nombre[0]}</p>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="deporte_id" className="etiqueta-formulario">
                  Deporte <span className="requerido">*</span>
                </label>
                <select
                  id="deporte_id"
                  name="deporte_id"
                  className={'selector-formulario' + (errores.deporte_id ? ' entrada-formulario--error' : '')}
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
                {errores.deporte_id && <p className="error-campo-formulario">{errores.deporte_id[0]}</p>}
              </div>

            </div>
          </div>

          {/* ── Configuración ──────────────────────────── */}
          <div className="seccion-formulario">
            <div className="seccion-formulario-cabecera">
              <span className="seccion-formulario-numero">02</span>
              <span className="seccion-formulario-titulo">Configuración</span>
            </div>
            <div className="seccion-formulario-cuerpo">

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
                    placeholder="1"
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
                    ELO mínimo <span className="requerido">*</span>
                  </label>
                  <input
                    id="elo_minimo"
                    name="elo_minimo"
                    type="number"
                    className={'entrada-formulario' + (errores.elo_minimo ? ' entrada-formulario--error' : '')}
                    value={form.elo_minimo}
                    onChange={handleChange}
                    min={0}
                    placeholder="Ej: 400"
                    required
                  />
                  {errores.elo_minimo && <p className="error-campo-formulario">{errores.elo_minimo[0]}</p>}
                </div>

                <div className="campo-formulario">
                  <label htmlFor="elo_maximo" className="etiqueta-formulario">
                    ELO máximo <span className="requerido">*</span>
                  </label>
                  <input
                    id="elo_maximo"
                    name="elo_maximo"
                    type="number"
                    className={'entrada-formulario' + (errores.elo_maximo ? ' entrada-formulario--error' : '')}
                    value={form.elo_maximo}
                    onChange={handleChange}
                    min={0}
                    placeholder="Ej: 1200"
                    required
                  />
                  {errores.elo_maximo && <p className="error-campo-formulario">{errores.elo_maximo[0]}</p>}
                </div>
              </div>

            </div>
          </div>

          {/* ── Localización ───────────────────────────── */}
          <div className="seccion-formulario">
            <div className="seccion-formulario-cabecera">
              <span className="seccion-formulario-numero">03</span>
              <span className="seccion-formulario-titulo">Localización</span>
            </div>
            <div className="seccion-formulario-cuerpo">

              <div className="campo-formulario">
                <label htmlFor="direccion" className="etiqueta-formulario">
                  Dirección <span className="requerido">*</span>
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  className={'entrada-formulario' + (errores.direccion ? ' entrada-formulario--error' : '')}
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Calle Mayor 12, pabellón B"
                  maxLength={255}
                  required
                />
                {errores.direccion && <p className="error-campo-formulario">{errores.direccion[0]}</p>}
              </div>

              <div className="fila-formulario">
                <div className="campo-formulario">
                  <label htmlFor="provincia" className="etiqueta-formulario">
                    Provincia <span className="requerido">*</span>
                  </label>
                  <select
                    id="provincia"
                    name="provincia"
                    className={'selector-formulario' + (errores.provincia ? ' entrada-formulario--error' : '')}
                    value={form.provincia}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una provincia</option>
                    {PROVINCIAS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errores.provincia && <p className="error-campo-formulario">{errores.provincia[0]}</p>}
                </div>

                <div className="campo-formulario">
                  <label htmlFor="ciudad" className="etiqueta-formulario">
                    Ciudad <span className="requerido">*</span>
                  </label>
                  <select
                    id="ciudad"
                    name="ciudad"
                    className={'selector-formulario' + (errores.ciudad ? ' entrada-formulario--error' : '')}
                    value={form.ciudad}
                    onChange={handleChange}
                    disabled={!form.provincia}
                    required
                  >
                    <option value="">
                      {form.provincia ? 'Selecciona una ciudad' : 'Primero selecciona provincia'}
                    </option>
                    {ciudadesDisponibles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errores.ciudad && <p className="error-campo-formulario">{errores.ciudad[0]}</p>}
                </div>
              </div>

            </div>
          </div>

          {/* ── Fechas ─────────────────────────────────── */}
          <div className="seccion-formulario">
            <div className="seccion-formulario-cabecera">
              <span className="seccion-formulario-numero">04</span>
              <span className="seccion-formulario-titulo">Fechas <span className="ayuda-formulario">(opcionales)</span></span>
            </div>
            <div className="seccion-formulario-cuerpo">

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
                    max={form.fecha_fin || undefined}
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

            </div>
          </div>

          {/* ── Acciones ───────────────────────────────── */}
          <div className="acciones-formulario">
            <Link to="/torneos" className="btn-cancelar">Cancelar</Link>
            <button type="submit" className="btn-enviar" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear torneo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
