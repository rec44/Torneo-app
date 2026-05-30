import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTorneo } from '../hooks/useTorneo'
import { useEquipos } from '../hooks/useEquipos'
import { useAuth } from '../hooks/useAuth'
import { BracketView } from '../components/BracketView'
import { ResultadoModal } from '../components/ResultadoModal'
import './TorneoDetallePage.css'

const FORMATO_LABELS = {
  eliminacion_simple: 'Eliminación directa',
  eliminacion_doble:  'Doble eliminación',
  round_robin:        'Round Robin',
  suizo:              'Sistema Suizo',
}

const ESTADO_LABELS = {
  abierto:    'Abierto',
  en_curso:   'En curso',
  finalizado: 'Finalizado',
  cancelado:  'Cancelado',
}

const ESTADO_PARTIDO_LABELS = {
  pendiente:  'Pendiente',
  en_curso:   'En curso',
  finalizado: 'Finalizado',
  cancelado:  'Cancelado',
}

function formatFecha(fechaStr) {
  if (!fechaStr) return null
  return new Date(fechaStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const ALL_TABS   = ['bracket', 'mi_equipo', 'equipos', 'partidos']
const TAB_LABELS = { bracket: 'Bracket', equipos: 'Equipos', mi_equipo: 'Mi equipo', partidos: 'Historial' }

export function TorneoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { torneo, loading, error, cargar, iniciar } = useTorneo()
  const { crearEquipo, unirse: unirseEquipo, actualizar: actualizarEquipo, unirsePorCodigo, getInvitacion, crearInvitacion, eliminar: eliminarEquipo, expulsarMiembro, toggleLock } = useEquipos()
  const { user } = useAuth()

  const [tab, setTab] = useState('bracket')

  // Formulario crear equipo (usado tanto por usuario como por dueño)
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')

  // Edición inline de un equipo (solo dueño)
  const [editandoId, setEditandoId] = useState(null)
  const [nombreEditar, setNombreEditar] = useState('')

  const [confirmarIniciar, setConfirmarIniciar] = useState(false)

  const [modalPartido,   setModalPartido]   = useState(null)
  const [invitacion,     setInvitacion]     = useState(null)

  const [accionLoading, setAccionLoading] = useState(false)
  const [accionError, setAccionError]   = useState(null)
  const [accionOk, setAccionOk]         = useState(null)
  const [copiadoOk, setCopiadoOk]       = useState(false)

  // Calculado antes de los guards para poder usarlo en effects
  const miEquipoPrev = torneo?.equipos?.find(e => e.miembros?.some(m => m.id === user?.id))

  useEffect(() => { cargar(id) }, [id, cargar])

  useEffect(() => {
    if (tab !== 'mi_equipo' || !miEquipoPrev) return
    getInvitacion(id, miEquipoPrev.id).then(inv => setInvitacion(inv ? { codigo: inv.codigo } : null))
  }, [tab, miEquipoPrev?.id])

  if (loading) {
    return (
      <div className="detalle-page">
        <div className="detalle-skeleton">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      </div>
    )
  }

  if (error || !torneo) {
    return (
      <div className="detalle-page">
        <div className="detalle-error">
          <p>{error ?? 'Torneo no encontrado.'}</p>
          <button className="btn-secondary" onClick={() => navigate('/torneos')}>
            Volver a torneos
          </button>
        </div>
      </div>
    )
  }

  const torneoCreadorId = torneo.creado_por?.id ?? torneo.creado_por
  const esOrganizador = user && (user.id === torneoCreadorId || user.rol === 'admin')
  const miEquipo      = miEquipoPrev
  const yaEnEquipo    = !!miEquipo
  const esCapitan     = miEquipo?.capitan?.id === user?.id

  const puedeIniciar     = esOrganizador && torneo.estado === 'abierto'
  // Cualquier usuario (incluido el organizador) puede crear equipo si no está ya en uno
  const puedeCrearEquipo = user && !yaEnEquipo && torneo.estado === 'abierto'

  const notify = (ok, err = null) => { setAccionOk(ok); setAccionError(err) }

  const withLoading = async (fn) => {
    setAccionLoading(true)
    setAccionOk(null)
    setAccionError(null)
    try { await fn() }
    catch (err) { setAccionError(err.response?.data?.message ?? 'Error inesperado.') }
    finally { setAccionLoading(false) }
  }

  /* ── Handlers ─────────────────────────────────────────────── */

  const handleCrearEquipo = async (e) => {
    e.preventDefault()
    if (!nombreNuevo.trim()) return
    await withLoading(async () => {
      await crearEquipo(id, nombreNuevo.trim())
      await cargar(id)
      const msg = esOrganizador
        ? `Equipo "${nombreNuevo}" creado.`
        : `Equipo "${nombreNuevo}" creado. ¡Eres el capitán!`
      notify(msg)
      setNombreNuevo('')
      setMostrarFormCrear(false)
      setTab('equipos')
    })
  }

  const handleIniciarEdicion = (equipo) => {
    setEditandoId(equipo.id)
    setNombreEditar(equipo.nombre)
    setAccionOk(null)
    setAccionError(null)
  }

  const handleEliminarEquipo = async (equipo) => {
    if (!window.confirm(`¿Eliminar el equipo "${equipo.nombre}"?`)) return
    await withLoading(async () => {
      await eliminarEquipo(id, equipo.id)
      await cargar(id)
      notify(`Equipo "${equipo.nombre}" eliminado.`)
    })
  }

  const handleExpulsar = async (miembro) => {
    if (!window.confirm(`¿Expulsar a "${miembro.nombre}" del equipo?`)) return
    await withLoading(async () => {
      await expulsarMiembro(id, miEquipo.id, miembro.id)
      await cargar(id)
      notify(`${miembro.nombre} ha sido expulsado del equipo.`)
    })
  }

  const handleToggleLock = async () => {
    await withLoading(async () => {
      await toggleLock(id, miEquipo.id)
      await cargar(id)
      const bloqueadoNuevo = !miEquipo.bloqueado
      notify(bloqueadoNuevo ? 'Equipo bloqueado. No se aceptan nuevos miembros.' : 'Equipo desbloqueado.')
    })
  }

  const handleCopiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
    setCopiadoOk(true)
    setTimeout(() => setCopiadoOk(false), 2000)
  }

  const handleGenerarCodigoMiEquipo = async () => {
    setInvitacion({ codigo: null, loading: true })
    try {
      const inv = await crearInvitacion(id, miEquipo.id, {})
      setInvitacion({ codigo: inv.codigo, loading: false })
    } catch (err) {
      setInvitacion(null)
      setAccionError(err.response?.data?.message ?? 'Error al generar el código.')
    }
  }

  const handleDesinscribirse = async (equipo) => {
    if (!window.confirm(`¿Retirar el equipo "${equipo.nombre}" del torneo?`)) return
    await withLoading(async () => {
      await eliminarEquipo(id, equipo.id)
      await cargar(id)
      notify(`Te has retirado del torneo.`)
    })
  }

  const handleGuardarEdicion = async (e) => {
    e.preventDefault()
    if (!nombreEditar.trim()) return
    await withLoading(async () => {
      await actualizarEquipo(id, editandoId, nombreEditar.trim())
      await cargar(id)
      notify('Equipo renombrado correctamente.')
      setEditandoId(null)
    })
  }

  const handleUnirseEquipo = async (equipoId) => {
    await withLoading(async () => {
      await unirseEquipo(id, equipoId)
      await cargar(id)
      notify('Te has unido al equipo correctamente.')
    })
  }

  const handleUnirseCodigo = async (e) => {
    e.preventDefault()
    if (!codigoInvitacion.trim()) return
    await withLoading(async () => {
      const result = await unirsePorCodigo(codigoInvitacion.trim())
      await cargar(id)
      notify(result.message ?? 'Te has unido al equipo correctamente.')
      setCodigoInvitacion('')
      setMostrarFormCodigo(false)
      setTab('equipos')
    })
  }

  const handleIniciar = async () => {
    await withLoading(async () => {
      const res = await iniciar(id)
      await cargar(id)
      notify(res?.message ?? 'Torneo iniciado correctamente.')
    })
  }

  /* ── Datos ordenados + confirmación ──────────────────────── */

  const minMiembros = torneo.min_miembros ?? 1

  const equiposOrdenados  = [...(torneo.equipos ?? [])].sort((a, b) => {
    if (a.bloqueado !== b.bloqueado) return a.bloqueado ? -1 : 1
    return (a.semilla ?? 999) - (b.semilla ?? 999)
  })

  const equiposConfirmados  = equiposOrdenados.filter(e => e.bloqueado)
  const equiposIncompletos  = equiposOrdenados.filter(e => (e.miembros?.length ?? 0) < minMiembros)
  const hayIncompletos      = equiposIncompletos.length > 0
  const partidosOrdenados = [...(torneo.partidos ?? [])].sort(
    (a, b) => (a.ronda ?? 0) - (b.ronda ?? 0)
  )

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="detalle-page">
      {/* Breadcrumb */}
      <nav className="detalle-breadcrumb">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
        <span className="breadcrumb-sep">/</span>
        <span>{torneo.nombre}</span>
      </nav>

      {/* Header */}
      <header className="detalle-header">
        <div className="detalle-header-top">
          <div className="detalle-header-badges">
            {torneo.deporte && (
              <span className="badge-deporte">{torneo.deporte.nombre}</span>
            )}
            <span className={`badge-estado badge-estado--${torneo.estado}`}>
              {ESTADO_LABELS[torneo.estado] ?? torneo.estado}
            </span>
          </div>
          {esOrganizador && torneo.estado === 'abierto' && (
            <Link to={`/torneos/${id}/editar`} className="btn-editar-torneo">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              Editar torneo
            </Link>
          )}
        </div>

        <h1 className="detalle-titulo">{torneo.nombre}</h1>

        <dl className="detalle-meta">
          <div className="detalle-meta-row">
            <dt>Formato</dt>
            <dd>{FORMATO_LABELS[torneo.formato] ?? torneo.formato}</dd>
          </div>
          <div className="detalle-meta-row">
            <dt>Equipos</dt>
            <dd>
              {equiposConfirmados.length} inscritos / {torneo.max_jugadores} máx
              {hayIncompletos && torneo.estado === 'abierto' && (
                <span className="meta-incompletos"> · {equiposIncompletos.length} en formación</span>
              )}
            </dd>
          </div>
          {(torneo.min_miembros || torneo.max_miembros) && (
            <div className="detalle-meta-row">
              <dt>Miembros/equipo</dt>
              <dd>
                {torneo.min_miembros && torneo.max_miembros
                  ? `${torneo.min_miembros} – ${torneo.max_miembros}`
                  : torneo.max_miembros
                    ? `Máx. ${torneo.max_miembros}`
                    : `Mín. ${torneo.min_miembros}`}
              </dd>
            </div>
          )}
          {(torneo.elo_minimo || torneo.elo_maximo) && (
            <div className="detalle-meta-row">
              <dt>ELO</dt>
              <dd>
                {torneo.elo_minimo && torneo.elo_maximo
                  ? `${torneo.elo_minimo} – ${torneo.elo_maximo}`
                  : torneo.elo_minimo ? `Mín. ${torneo.elo_minimo}` : `Máx. ${torneo.elo_maximo}`}
              </dd>
            </div>
          )}
          {(torneo.fecha_inicio || torneo.fecha_fin) && (
            <div className="detalle-meta-row">
              <dt>Fechas</dt>
              <dd>
                {formatFecha(torneo.fecha_inicio) && formatFecha(torneo.fecha_fin)
                  ? `${formatFecha(torneo.fecha_inicio)} – ${formatFecha(torneo.fecha_fin)}`
                  : formatFecha(torneo.fecha_inicio)
                    ? `Desde ${formatFecha(torneo.fecha_inicio)}`
                    : `Hasta ${formatFecha(torneo.fecha_fin)}`}
              </dd>
            </div>
          )}
          {torneo.creado_por?.nombre && (
            <div className="detalle-meta-row">
              <dt>Organiza</dt>
              <dd>{torneo.creado_por.nombre}</dd>
            </div>
          )}
        </dl>

        {/* Acciones de participación — solo si no está ya en un equipo */}
        {user && !yaEnEquipo && torneo.estado === 'abierto' && (
          <div className="detalle-acciones">
            <button
              className="btn-primary"
              onClick={() => setMostrarFormCrear(v => !v)}
            >
              Crear equipo
            </button>
          </div>
        )}

        {/* Formulario crear equipo */}
        {mostrarFormCrear && puedeCrearEquipo && (
          <form className="detalle-form-inline" onSubmit={handleCrearEquipo}>
            <input
              type="text" className="filtro-input" placeholder="Nombre del equipo"
              value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)}
              maxLength={100} required
            />
            <button type="submit" className="btn-primary" disabled={accionLoading}>
              {accionLoading ? 'Creando…' : 'Crear'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setMostrarFormCrear(false)}>
              Cancelar
            </button>
          </form>
        )}

        {accionError && <p className="detalle-accion-error">{accionError}</p>}
        {accionOk    && <p className="detalle-accion-ok">{accionOk}</p>}

        {/* Acción iniciar torneo — separada visualmente */}
        {puedeIniciar && (
          <div className="detalle-acciones-iniciar">
            {hayIncompletos && (
              <p className="iniciar-advertencia">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {equiposIncompletos.length} equipo{equiposIncompletos.length !== 1 ? 's' : ''} sin completar
                ({equiposIncompletos.map(e => e.nombre).join(', ')})
                {' '}será{equiposIncompletos.length !== 1 ? 'n' : ''} eliminado{equiposIncompletos.length !== 1 ? 's' : ''} al iniciar
                por no alcanzar el mínimo de {minMiembros} miembro{minMiembros !== 1 ? 's' : ''}.
              </p>
            )}
            <button className="btn-iniciar" onClick={() => setConfirmarIniciar(true)} disabled={accionLoading}>
              Iniciar torneo
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="detalle-tabs" role="tablist">
        {ALL_TABS.filter(t => t !== 'mi_equipo' || yaEnEquipo).map(t => (
          <button key={t} role="tab" aria-selected={tab === t}
            className={`detalle-tab ${tab === t ? 'detalle-tab--activo' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
            {t === 'equipos'   && <span className="tab-count">{torneo.equipos?.length ?? 0}</span>}
            {t === 'partidos'  && <span className="tab-count">{torneo.partidos?.length ?? 0}</span>}
            {t === 'mi_equipo' && <span className="tab-count">{miEquipo?.miembros?.length ?? 0}</span>}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="detalle-contenido">

        {/* ── BRACKET ──────────────────────────────────────── */}
        {tab === 'bracket' && (
          <BracketView
            partidos={partidosOrdenados}
            formato={torneo.formato}
            esOrganizador={esOrganizador}
            onPartidoClick={setModalPartido}
          />
        )}

        {/* ── EQUIPOS ──────────────────────────────────────── */}
        {tab === 'equipos' && (
          <div className="equipos-lista">

            {/* Botón crear equipo para el organizador */}
            {esOrganizador && torneo.estado === 'abierto' && (
              <div className="equipos-owner-toolbar">
                {!mostrarFormCrear ? (
                  <button
                    className="btn-primary"
                    onClick={() => { setMostrarFormCrear(true); setEditandoId(null) }}
                  >
                    + Crear equipo
                  </button>
                ) : (
                  <form className="detalle-form-inline" onSubmit={handleCrearEquipo}>
                    <input
                      type="text" className="filtro-input" placeholder="Nombre del equipo"
                      value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)}
                      maxLength={100} autoFocus required
                    />
                    <button type="submit" className="btn-primary" disabled={accionLoading}>
                      {accionLoading ? 'Creando…' : 'Crear'}
                    </button>
                    <button type="button" className="btn-secondary"
                      onClick={() => { setMostrarFormCrear(false); setNombreNuevo('') }}>
                      Cancelar
                    </button>
                  </form>
                )}
              </div>
            )}

            {equiposOrdenados.length === 0 ? (
              <p className="detalle-vacio">No hay equipos inscritos todavía.</p>
            ) : (
              equiposOrdenados.map(equipo => {
                const esMiEquipo    = equipo.id === miEquipo?.id
                const estaEditando  = editandoId === equipo.id
                const puedoUnirme   = torneo.estado === 'abierto' && user && !yaEnEquipo
                const numMiembros   = equipo.miembros?.length ?? 0
                const confirmado    = numMiembros >= minMiembros

                return (
                  <div key={equipo.id} className={`equipo-card ${esMiEquipo ? 'equipo-card--propio' : ''} ${equipo.bloqueado ? 'equipo-card--inscrito' : ''}`}>
                    {/* Cabecera del equipo */}
                    <div className="equipo-card-header">
                      <div>
                        {estaEditando ? (
                          <form className="equipo-editar-inline" onSubmit={handleGuardarEdicion}>
                            <input
                              type="text" className="equipo-editar-input"
                              value={nombreEditar}
                              onChange={e => setNombreEditar(e.target.value)}
                              maxLength={100} autoFocus required
                            />
                            <button type="submit" className="btn-primary btn--sm"
                              disabled={accionLoading}>
                              {accionLoading ? '…' : 'Guardar'}
                            </button>
                            <button type="button" className="btn-secondary btn--sm"
                              onClick={() => setEditandoId(null)}>
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="equipo-nombre">{equipo.nombre}</span>
                            {equipo.semilla && (
                              <span className="equipo-semilla">#{equipo.semilla}</span>
                            )}
                            {equipo.bloqueado && (
                              <span className="badge-inscrito-confirmado">
                                <svg viewBox="0 0 12 12" fill="none" width="11" height="11" aria-hidden="true">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Inscrito
                              </span>
                            )}
                            {esMiEquipo && <span className="badge-mi-equipo">Mi equipo</span>}
                          </>
                        )}
                      </div>

                      <div className="equipo-card-acciones">
                        <span className="equipo-capitan">Cap. {equipo.capitan?.nombre}</span>
                        {esOrganizador && !estaEditando && (
                          <>
                            <button
                              className="btn-editar-equipo"
                              onClick={() => handleIniciarEdicion(equipo)}
                              title="Renombrar equipo"
                            >
                              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                                <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"
                                  stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              </svg>
                              Editar
                            </button>
                            <button
                              className="btn-eliminar-equipo"
                              onClick={() => handleEliminarEquipo(equipo)}
                              title="Eliminar equipo"
                              disabled={accionLoading}
                            >
                              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                              </svg>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Miembros */}
                    <div className="equipo-miembros">
                      {equipo.miembros?.length === 0
                        ? <span className="equipo-sin-miembros">Sin miembros aún</span>
                        : equipo.miembros?.map(m => (
                          <span key={m.id} className="equipo-miembro">
                            <Link to={`/usuarios/${m.id}`} className="equipo-miembro-link">{m.nombre}</Link>
                            <span className="miembro-elo">ELO {m.pivot?.elo_al_unirse ?? m.elo}</span>
                          </span>
                        ))
                      }
                    </div>

                    {/* Contador de miembros */}
                    <div className="equipo-limite">
                      <span className={
                        torneo.max_miembros && numMiembros >= torneo.max_miembros
                          ? 'equipo-limite--lleno'
                          : !confirmado
                            ? 'equipo-limite--incompleto'
                            : 'equipo-limite--ok'
                      }>
                        {numMiembros}
                        {torneo.max_miembros ? ` / ${torneo.max_miembros}` : ''} miembro{numMiembros !== 1 ? 's' : ''}
                        {!confirmado && ` · Faltan ${minMiembros - numMiembros} para inscribirse`}
                        {torneo.max_miembros && numMiembros >= torneo.max_miembros && ' · Equipo completo'}
                      </span>
                    </div>

                    {/* Botón unirse (usuario normal) */}
                    {puedoUnirme && !(torneo.max_miembros && equipo.miembros?.length >= torneo.max_miembros) && (
                      <button className="btn-unirse-equipo"
                        onClick={() => handleUnirseEquipo(equipo.id)} disabled={accionLoading}>
                        Unirse a este equipo
                      </button>
                    )}

                    {/* Botón desinscribirse (solo el capitán, torneo abierto) */}
                    {!esOrganizador && equipo.capitan?.id === user?.id && torneo.estado === 'abierto' && (
                      <button className="btn-desinscribirse"
                        onClick={() => handleDesinscribirse(equipo)} disabled={accionLoading}>
                        Retirar equipo
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── MI EQUIPO ────────────────────────────────────── */}
        {tab === 'mi_equipo' && miEquipo && (
          <div className="mi-equipo-tab">

            {/* Cabecera */}
            <div className="mi-equipo-header">
              <div className="mi-equipo-header-info">
                <h3 className="mi-equipo-nombre">{miEquipo.nombre}</h3>
                {miEquipo.bloqueado && (
                  <span className="badge-inscrito-confirmado">
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Inscrito
                  </span>
                )}
                {miEquipo.bloqueado && (
                  <span className="badge-bloqueado">Bloqueado</span>
                )}
              </div>
              {(esCapitan || esOrganizador) && torneo.estado === 'abierto' && (
                <button
                  className={`btn-lock ${miEquipo.bloqueado ? 'btn-lock--activo' : ''}`}
                  onClick={handleToggleLock}
                  disabled={accionLoading}
                  title={miEquipo.bloqueado ? 'Desbloquear equipo' : 'Bloquear equipo (cerrar inscripciones)'}
                >
                  {miEquipo.bloqueado ? (
                    <><svg viewBox="0 0 16 16" fill="none" width="13" height="13"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> Bloqueado</>
                  ) : (
                    <><svg viewBox="0 0 16 16" fill="none" width="13" height="13"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> Bloquear</>
                  )}
                </button>
              )}
            </div>

            {/* Lista de miembros */}
            <div className="mi-equipo-miembros">
              {miEquipo.miembros?.map(m => (
                <div key={m.id} className="mi-equipo-miembro">
                  <div className="mi-equipo-miembro-info">
                    <Link to={`/usuarios/${m.id}`} className="mi-equipo-miembro-nombre mi-equipo-miembro-link">{m.nombre}</Link>
                    {m.id === miEquipo.capitan?.id && <span className="badge-capitan">Capitán</span>}
                    <span className="mi-equipo-miembro-elo">ELO {m.pivot?.elo_al_unirse ?? m.elo}</span>
                  </div>
                  {(esCapitan || esOrganizador) && m.id !== miEquipo.capitan?.id && torneo.estado === 'abierto' && (
                    <button
                      className="btn-expulsar"
                      onClick={() => handleExpulsar(m)}
                      disabled={accionLoading}
                    >
                      Expulsar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Invitar jugadores */}
            {(esCapitan || esOrganizador) && torneo.estado === 'abierto' && !miEquipo.bloqueado && (
              <div className="mi-equipo-invitar">
                {invitacion?.codigo ? (
                  <div className="invitacion-codigo">
                    <code className="invitacion-codigo-text">
                      {`${window.location.origin}/unirse/${invitacion.codigo}`}
                    </code>
                    <button className="btn-secondary btn--sm"
                      onClick={() => handleCopiarCodigo(`${window.location.origin}/unirse/${invitacion.codigo}`)}>
                      {copiadoOk ? '¡Copiado!' : 'Copiar'}
                    </button>
                    <button className="btn-secondary btn--sm"
                      onClick={() => setInvitacion(null)}>
                      Ocultar
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={handleGenerarCodigoMiEquipo}
                    disabled={invitacion?.loading}
                  >
                    {invitacion?.loading ? 'Generando…' : '+ Invitar jugadores'}
                  </button>
                )}
              </div>
            )}

            {/* Retirar equipo */}
            {esCapitan && !esOrganizador && torneo.estado === 'abierto' && (
              <div className="mi-equipo-retirar">
                <button
                  className="btn-desinscribirse"
                  onClick={() => handleDesinscribirse(miEquipo)}
                  disabled={accionLoading}
                >
                  Retirar equipo del torneo
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── PARTIDOS ─────────────────────────────────────── */}
        {tab === 'partidos' && (
          <div className="partidos-historial">
            {partidosOrdenados.filter(p => p.resultado_e1 !== null && p.resultado_e2 !== null).length === 0 ? (
              <p className="detalle-vacio">No hay partidos jugados todavía.</p>
            ) : (
              partidosOrdenados.filter(p => p.resultado_e1 !== null && p.resultado_e2 !== null).map(p => (
                <div key={p.id} className={`partido-fila partido-fila--${p.estado}`}>
                  <span className="partido-ronda">R{p.ronda ?? '?'}</span>
                  <div className="partido-enfrentamiento">
                    <span className={p.ganador_equipo_id === p.equipo1?.id ? 'partido-ganador' : ''}>
                      {p.equipo1?.nombre ?? 'TBD'}
                    </span>
                    <span className="partido-resultado">
                      {p.estado === 'finalizado'
                        ? `${p.resultado_e1} – ${p.resultado_e2}`
                        : 'vs'}
                    </span>
                    <span className={p.ganador_equipo_id === p.equipo2?.id ? 'partido-ganador' : ''}>
                      {p.equipo2?.nombre ?? 'TBD'}
                    </span>
                  </div>
                  <span className={`badge-partido-estado badge-partido-estado--${p.estado}`}>
                    {ESTADO_PARTIDO_LABELS[p.estado] ?? p.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {confirmarIniciar && (
        <div className="modal-overlay" onMouseDown={() => setConfirmarIniciar(false)}>
          <div className="modal-card" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">¿Iniciar el torneo?</h3>
              <button className="modal-cerrar" onClick={() => setConfirmarIniciar(false)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-form">
              <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                Se generará el bracket y el torneo pasará a <strong>En curso</strong>.
                {hayIncompletos && (
                  <> Los equipos sin confirmar (<strong>{equiposIncompletos.map(e => e.nombre).join(', ')}</strong>) serán eliminados.</>
                )}
                {' '}Esta acción no se puede deshacer.
              </p>
              <div className="modal-acciones">
                <button className="btn-secondary" onClick={() => setConfirmarIniciar(false)} disabled={accionLoading}>
                  Cancelar
                </button>
                <button
                  className="btn-iniciar"
                  disabled={accionLoading}
                  onClick={async () => { setConfirmarIniciar(false); await handleIniciar() }}
                >
                  {accionLoading ? 'Iniciando…' : 'Sí, iniciar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalPartido && (
        <ResultadoModal
          partido={modalPartido}
          onClose={() => setModalPartido(null)}
          onGuardado={async () => {
            setModalPartido(null)
            await cargar(id)
          }}
        />
      )}
    </div>
  )
}
