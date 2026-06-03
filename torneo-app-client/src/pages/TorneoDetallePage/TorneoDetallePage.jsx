import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTorneo } from '../../hooks/useTorneo'
import { useEquipos } from '../../hooks/useEquipos'
import { useAuth } from '../../hooks/useAuth'
import { BracketView } from '../../components/BracketView'
import { ResultadoModal } from '../../components/ResultadoModal'
import { partidoService } from '../../services/partidoService'
import DatePicker, { registerLocale } from 'react-datepicker'
import jsPDF from 'jspdf'
import { es } from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import './TorneoDetallePage.css'

registerLocale('es', es)

const FORMATO_LABELS = {
  eliminacion_simple: 'Eliminación directa',
  eliminacion_doble:  'Doble eliminación',
  round_robin:        'Round Robin',
  suizo:              'Sistema Suizo',
}

const ESTADO_LABELS = {
  abierto:       'Abierto',
  programacion:  'Programación',
  en_curso:      'En curso',
  finalizado:    'Finalizado',
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

function formatFechaHora(fechaStr) {
  if (!fechaStr) return null
  return new Date(fechaStr).toLocaleString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function toDatetimeLocal(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const ALL_TABS   = ['bracket', 'calendario', 'mi_equipo', 'equipos', 'partidos']
const TAB_LABELS = { bracket: 'Bracket', calendario: 'Calendario', equipos: 'Equipos', mi_equipo: 'Mi equipo', partidos: 'Historial' }

export function TorneoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { torneo, loading, error, cargar, iniciar, confirmar, eliminar } = useTorneo()
  const { crearEquipo, subirEscudo, unirse: unirseEquipo, actualizar: actualizarEquipo, unirsePorCodigo, getInvitacion, crearInvitacion, eliminar: eliminarEquipo, expulsarMiembro, toggleLock } = useEquipos()
  const { user } = useAuth()

  const [tab, setTab] = useState('bracket')

  // form nuevo equipo
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [escudoNuevo, setEscudoNuevo] = useState(null)
  const [escudoPreview, setEscudoPreview] = useState(null)
  const [escudoCambiandoId, setEscudoCambiandoId] = useState(null)

  // editar nombre del equipo en el sitio
  const [editandoId, setEditandoId] = useState(null)
  const [nombreEditar, setNombreEditar] = useState('')

  const [confirmarIniciar,       setConfirmarIniciar]       = useState(false)
  const [confirmarConfirmar,     setConfirmarConfirmar]     = useState(false)
  const [confirmarEliminar,      setConfirmarEliminar]      = useState(null)
  const [confirmarBorrarTorneo,  setConfirmarBorrarTorneo]  = useState(false)

  // mapa de fechas locales por id de partido
  const [fechasPartidos, setFechasPartidos] = useState({})
  const [guardandoFecha, setGuardandoFecha] = useState({})
  const [errorFecha, setErrorFecha]         = useState({})
  const [generandoPDF, setGenerandoPDF]     = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  const [modalFecha,     setModalFecha]     = useState(null) 
  const [modalPartido,   setModalPartido]   = useState(null)
  const [invitacion,     setInvitacion]     = useState(null)

  const [accionLoading, setAccionLoading] = useState(false)
  const [accionError, setAccionError]   = useState(null)
  const [accionOk, setAccionOk]         = useState(null)
  const [copiadoOk, setCopiadoOk]       = useState(false)
  const [expandidos, setExpandidos]     = useState(new Set())

  const toggleExpandido = (id) => setExpandidos(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  
  const miEquipoPrev = torneo?.equipos?.find(e => e.miembros?.some(m => m.id === user?.id))

  useEffect(() => { cargar(id) }, [id, cargar])

  useEffect(() => {
    if (!torneo?.partidos) return
    const map = {}
    torneo.partidos.forEach(p => { map[p.id] = toDatetimeLocal(p.programado_en) })
    setFechasPartidos(map)
  }, [torneo?.partidos])

  useEffect(() => {
    if (tab !== 'calendario' || !torneo?.partidos) return
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const proximo = torneo.partidos
      .filter(p => p.programado_en && new Date(p.programado_en) >= hoy)
      .sort((a, b) => new Date(a.programado_en) - new Date(b.programado_en))[0]
    if (proximo) setDiaSeleccionado(new Date(proximo.programado_en))
  }, [tab, torneo?.partidos])

  useEffect(() => {
    if (tab !== 'mi_equipo' || !miEquipoPrev) return
    getInvitacion(id, miEquipoPrev.id).then(inv => setInvitacion(inv ? { codigo: inv.codigo } : null))
  }, [tab, miEquipoPrev?.id])

  if (loading) {
    return (
      <div className="detalle-page">
        <div className="detalle-esqueleto">
          <div className="linea-esqueleto linea-esqueleto--corta" />
          <div className="linea-esqueleto linea-esqueleto--titulo" />
          <div className="linea-esqueleto" />
          <div className="linea-esqueleto linea-esqueleto--corta" />
        </div>
      </div>
    )
  }

  if (error || !torneo) {
    return (
      <div className="detalle-page">
        <div className="detalle-error">
          <p>{error ?? 'Torneo no encontrado.'}</p>
          <button className="btn-secundario" onClick={() => navigate('/torneos')}>
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
  const enProgramacion   = torneo.estado === 'programacion'
  const puedeConfirmar   = esOrganizador && enProgramacion
  const puedeCrearEquipo = user && !yaEnEquipo && torneo.estado === 'abierto'

  const partidos            = torneo.partidos ?? []
  const sinFechaCount       = partidos.filter(p => !p.programado_en && p.estado !== 'finalizado').length
  const todasTienenFecha    = partidos.length > 0 && sinFechaCount === 0
  const rondasUnicas        = [...new Set(partidos.map(p => p.ronda))].sort((a, b) => a - b)
  const maxRonda            = rondasUnicas.at(-1) ?? 1

  function labelRonda(r) {
    if (r === maxRonda) return 'Final'
    if (r === maxRonda - 1 && maxRonda > 1) return 'Semifinal'
    if (r === maxRonda - 2 && maxRonda > 2) return 'Cuartos de final'
    return `Ronda ${r}`
  }

  const notify = (ok, err = null) => { setAccionOk(ok); setAccionError(err) }

  const withLoading = async (fn) => {
    setAccionLoading(true)
    setAccionOk(null)
    setAccionError(null)
    try { await fn() }
    catch (err) { setAccionError(err.response?.data?.message ?? 'Error inesperado.') }
    finally { setAccionLoading(false) }
  }

  // handlers

  const handleEscudoChange = (e) => {
    const file = e.target.files?.[0] ?? null
    setEscudoNuevo(file)
    setEscudoPreview(file ? URL.createObjectURL(file) : null)
  }

  const resetFormCrear = () => {
    setNombreNuevo('')
    setEscudoNuevo(null)
    setEscudoPreview(null)
    setMostrarFormCrear(false)
  }

  const handleCrearEquipo = async (e) => {
    e.preventDefault()
    if (!nombreNuevo.trim()) return
    await withLoading(async () => {
      await crearEquipo(id, nombreNuevo.trim(), escudoNuevo)
      await cargar(id)
      const msg = esOrganizador
        ? `Equipo "${nombreNuevo}" creado.`
        : `Equipo "${nombreNuevo}" creado. ¡Eres el capitán!`
      notify(msg)
      resetFormCrear()
      setTab('equipos')
    })
  }

  const handleCambiarEscudo = async (equipoId, file) => {
    if (!file) return
    setEscudoCambiandoId(equipoId)
    try {
      await subirEscudo(id, equipoId, file)
      notify('Escudo actualizado correctamente.')
    } catch (err) {
      setAccionError(err.response?.data?.message ?? 'Error al subir el escudo.')
    } finally {
      setEscudoCambiandoId(null)
    }
  }

  const handleIniciarEdicion = (equipo) => {
    setEditandoId(equipo.id)
    setNombreEditar(equipo.nombre)
    setAccionOk(null)
    setAccionError(null)
  }

  const handleEliminarEquipo = (equipo) => setConfirmarEliminar(equipo)

  const confirmarEliminarEquipo = async () => {
    const equipo = confirmarEliminar
    setConfirmarEliminar(null)
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
      notify(res?.message ?? 'Bracket generado. Ahora asigna fechas a los partidos.')
      setTab('calendario')
    })
  }

  const handleConfirmar = async () => {
    await withLoading(async () => {
      const res = await confirmar(id)
      await cargar(id)
      notify(res?.message ?? 'Torneo en curso.')
    })
  }

  const descargarCalendarioPDF = async () => {
    setGenerandoPDF(true)
    try {
    const doc       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const anchoPage = doc.internal.pageSize.getWidth()
    const M         = 14
    const anchoUtil = anchoPage - M * 2
    let y = M

    const nuevaPagina = (espacio = 12) => {
      if (y + espacio > 278) { doc.addPage(); y = M }
    }

    const conFecha = partidos
      .filter(p => p.programado_en)
      .sort((a, b) => new Date(a.programado_en) - new Date(b.programado_en))

    // cabecera del PDF con el nombre del torneo
    doc.setFillColor(249, 115, 22)
    doc.rect(0, 0, anchoPage, 26, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(torneo.nombre, M, 12)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`Calendario de partidos · ${torneo.deporte?.nombre ?? ''}`, M, 20)
    y = 34

    if (conFecha.length === 0) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.text('No hay partidos con fecha asignada.', M, y)
      doc.save(`${torneo.nombre.replace(/\s+/g, '_')}_calendario.pdf`)
      return
    }

    // el mini calendario mensual
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const porMes = {}
    conFecha.forEach(p => {
      const d = new Date(p.programado_en)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (!porMes[k]) porMes[k] = { año: d.getFullYear(), mes: d.getMonth(), dias: new Set() }
      porMes[k].dias.add(d.getDate())
    })

    const dibujarMes = (año, mes, diasConPartido) => {
      const cellW = anchoUtil / 7
      const cellH = 9
      nuevaPagina(75)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 21, 14)
      doc.text(`${MESES[mes]} ${año}`, M + anchoUtil / 2, y + 5, { align: 'center' })
      y += 10

      const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
      diasSemana.forEach((d, i) => {
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(160, 155, 148)
        doc.text(d, M + i * cellW + cellW / 2, y + 4, { align: 'center' })
      })
      y += 7

      doc.setDrawColor(232, 227, 219)
      doc.setLineWidth(0.3)
      doc.line(M, y, M + anchoUtil, y)
      y += 1

      const primerDia = (new Date(año, mes, 1).getDay() + 6) % 7
      const totalDias = new Date(año, mes + 1, 0).getDate()
      let dia = 1

      for (let semana = 0; semana < 6 && dia <= totalDias; semana++) {
        for (let dow = 0; dow < 7; dow++) {
          if (semana === 0 && dow < primerDia) continue
          if (dia > totalDias) break
          const cx = M + dow * cellW + cellW / 2
          const cy = y + cellH / 2
          if (diasConPartido.has(dia)) {
            doc.setFillColor(249, 115, 22)
            doc.circle(cx, cy, 3.8, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFont('helvetica', 'bold')
          } else {
            doc.setTextColor(24, 21, 14)
            doc.setFont('helvetica', 'normal')
          }
          doc.setFontSize(8.5)
          doc.text(String(dia), cx, cy + 1, { align: 'center', baseline: 'middle' })
          dia++
        }
        y += cellH
      }
      y += 6
    }

    Object.values(porMes)
      .sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes)
      .forEach(({ año, mes, dias }) => dibujarMes(año, mes, dias))

    nuevaPagina(10)
    doc.setDrawColor(232, 227, 219)
    doc.setLineWidth(0.4)
    doc.line(M, y, M + anchoUtil, y)
    y += 8

    // lista de partidos agrupada por ronda
    rondasUnicas.forEach(ronda => {
      const ps = conFecha.filter(p => p.ronda === ronda)
      if (ps.length === 0) return

      nuevaPagina(16)
      doc.setFillColor(245, 244, 242)
      doc.roundedRect(M, y, anchoUtil, 7.5, 1.5, 1.5, 'F')
      doc.setTextColor(100, 95, 90)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(labelRonda(ronda).toUpperCase(), M + 4, y + 5.2)
      y += 11

      ps.forEach(p => {
        nuevaPagina(13)
        const fecha    = new Date(p.programado_en)
        const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
        const horaStr  = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        const eq1 = p.equipo1?.nombre ?? 'Por definir'
        const eq2 = p.equipo2?.nombre ?? 'Por definir'

        doc.setFillColor(249, 115, 22)
        doc.rect(M, y + 1, 2, 8, 'F')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')

        doc.setTextColor(...(p.equipo1 ? [24, 21, 14] : [160, 155, 148]))
        doc.text(eq1, M + 6, y + 6)
        const anchoEq1 = doc.getTextWidth(eq1)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 115, 106)
        doc.text('  vs  ', M + 6 + anchoEq1, y + 6)
        const anchoVs = doc.getTextWidth('  vs  ')

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...(p.equipo2 ? [24, 21, 14] : [160, 155, 148]))
        doc.text(eq2, M + 6 + anchoEq1 + anchoVs, y + 6)
        doc.setTextColor(120, 115, 106)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`${fechaStr} · ${horaStr}`, M + 6, y + 10.5)
        y += 14
      })
      y += 3
    })

    // pie de página
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(7)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} · RiseCup`, M, 291)

    doc.save(`${torneo.nombre.replace(/\s+/g, '_')}_calendario.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
      setAccionError('Error al generar el PDF: ' + (err.message ?? 'Error desconocido'))
    } finally {
      setGenerandoPDF(false)
    }
  }

  const handleGuardarFecha = async (partidoId) => {
    const valorLocal = fechasPartidos[partidoId]
    // el input devuelve hora local, hay que pasar a UTC antes de enviar
    const valorUTC = valorLocal ? new Date(valorLocal).toISOString().slice(0, 16) : null
    setGuardandoFecha(prev => ({ ...prev, [partidoId]: true }))
    setErrorFecha(prev => ({ ...prev, [partidoId]: null }))
    try {
      await partidoService.actualizarFecha(partidoId, valorUTC)
      await cargar(id)
      const nuevaFecha = valorLocal ? new Date(valorLocal) : null
      if (nuevaFecha) setDiaSeleccionado(nuevaFecha)
      setModalFecha(null)
    } catch (err) {
      setErrorFecha(prev => ({ ...prev, [partidoId]: err.response?.data?.message ?? 'Error al guardar.' }))
    } finally {
      setGuardandoFecha(prev => ({ ...prev, [partidoId]: false }))
    }
  }

  const handleEliminarTorneo = async () => {
    await withLoading(async () => {
      await eliminar(id)
      navigate('/torneos')
    })
  }

  // variables derivadas del torneo

  const minMiembros = torneo.min_miembros ?? 1

  const equiposOrdenados  = [...(torneo.equipos ?? [])].sort((a, b) => {
    if (a.bloqueado !== b.bloqueado) return a.bloqueado ? -1 : 1
    return (a.semilla ?? 999) - (b.semilla ?? 999)
  })

  const equiposConfirmados  = equiposOrdenados.filter(e => e.bloqueado)
  const equiposIncompletos  = equiposOrdenados.filter(e => (e.miembros?.length ?? 0) < minMiembros)
  const hayIncompletos      = equiposIncompletos.length > 0
  const minEquipos          = Math.floor((torneo.max_jugadores ?? 4) / 2) + 1
  const cumpleMinimo        = equiposConfirmados.length >= minEquipos
  const partidosOrdenados = [...(torneo.partidos ?? [])].sort(
    (a, b) => (a.ronda ?? 0) - (b.ronda ?? 0)
  )

  const partidosHistorial = [...(torneo.partidos ?? [])]
    .filter(p => p.resultado_e1 !== null && p.resultado_e2 !== null)
    .sort((a, b) => (b.ronda ?? 0) - (a.ronda ?? 0))

  return (
    <div className="detalle-page">
      {/* volver atrás */}
      <button className="btn-volver" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      {/* cabecera del torneo */}
      <header className="detalle-header">
        <div className="detalle-header-top">
          <div className="detalle-header-badges">
            {torneo.deporte && (
              <span className="insignia-deporte">{torneo.deporte.nombre}</span>
            )}
            <span className={`insignia-estado insignia-estado--${torneo.estado}`}>
              {ESTADO_LABELS[torneo.estado] ?? torneo.estado}
            </span>
          </div>
          {esOrganizador && torneo.estado === 'abierto' && (
            <div className="detalle-header-acciones">
              <Link to={`/torneos/${id}/editar`} className="btn-editar-torneo">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                  <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                Editar
              </Link>
              <button className="btn-eliminar-torneo" onClick={() => setConfirmarBorrarTorneo(true)}>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                  <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>

        <h1 className="detalle-titulo">{torneo.nombre}</h1>

        <dl className="detalle-meta">
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
          {(torneo.ciudad || torneo.provincia || torneo.direccion) && (
            <div className="detalle-meta-row">
              <dt>Lugar</dt>
              <dd>
                {[torneo.direccion, torneo.ciudad, torneo.provincia]
                  .filter(Boolean).join(', ')}
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

        {/* botón para crear equipo si aún no estás en ninguno */}
        {user && !yaEnEquipo && torneo.estado === 'abierto' && (
          <div className="detalle-acciones">
            <button
              className="btn-primario"
              onClick={() => setMostrarFormCrear(v => !v)}
            >
              Crear equipo
            </button>
          </div>
        )}

        {/* form crear equipo */}
        {mostrarFormCrear && puedeCrearEquipo && (
          <form className="detalle-formulario-inline" onSubmit={handleCrearEquipo}>
            <input
              type="text" className="filtro-entrada" placeholder="Nombre del equipo"
              value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)}
              maxLength={100} required
            />
            <label className="btn-secundario escudo-upload-label" title="Subir escudo (jpg/png/webp, máx. 2 MB)">
              {escudoPreview
                ? <img src={escudoPreview} alt="preview" className="escudo-preview-mini" />
                : '🖼 Escudo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleEscudoChange} />
            </label>
            <button type="submit" className="btn-primario" disabled={accionLoading}>
              {accionLoading ? 'Creando…' : 'Crear'}
            </button>
            <button type="button" className="btn-secundario" onClick={resetFormCrear}>
              Cancelar
            </button>
          </form>
        )}

        {accionError && <p className="detalle-accion-error">{accionError}</p>}
        {accionOk    && <p className="detalle-accion-ok">{accionOk}</p>}

        {/* botón confirmar inicio */}
        {puedeConfirmar && (
          <div className="detalle-acciones-iniciar">
            {!todasTienenFecha && (
              <p className="iniciar-advertencia">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Faltan fechas en {sinFechaCount} partido{sinFechaCount !== 1 ? 's' : ''}.
                Asígnalas en la pestaña <strong>Calendario</strong>.
              </p>
            )}
            <button
              className="btn-iniciar"
              onClick={() => setConfirmarConfirmar(true)}
              disabled={!todasTienenFecha || accionLoading}
            >
              {todasTienenFecha ? 'Confirmar inicio del torneo' : `Faltan ${sinFechaCount} fecha${sinFechaCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* botón iniciar torneo */}
        {puedeIniciar && (
          <div className="detalle-acciones-iniciar">
            {!cumpleMinimo && (
              <p className="iniciar-advertencia">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Se necesitan al menos <strong>{minEquipos} equipos confirmados</strong> para iniciar.
                Ahora hay {equiposConfirmados.length}.
              </p>
            )}
            {cumpleMinimo && hayIncompletos && (
              <p className="iniciar-advertencia">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {equiposIncompletos.length} equipo{equiposIncompletos.length !== 1 ? 's' : ''} sin completar
                ({equiposIncompletos.map(e => e.nombre).join(', ')})
                {' '}será{equiposIncompletos.length !== 1 ? 'n' : ''} eliminado{equiposIncompletos.length !== 1 ? 's' : ''} al iniciar.
              </p>
            )}
            <button
              className="btn-iniciar"
              onClick={() => setConfirmarIniciar(true)}
              disabled={accionLoading || !cumpleMinimo}
            >
              {cumpleMinimo ? 'Iniciar torneo' : `Faltan ${minEquipos - equiposConfirmados.length} equipo${minEquipos - equiposConfirmados.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </header>

      {/* pestañas de navegación */}
      <div className="detalle-pestanas" role="tablist">
        {ALL_TABS.filter(t => {
          if (t === 'mi_equipo') return yaEnEquipo
          if (t === 'bracket')   return torneo.estado !== 'abierto'
          if (t === 'calendario') return torneo.estado !== 'abierto'
          return true
        }).map(t => (
          <button key={t} role="tab" aria-selected={tab === t}
            className={`detalle-pestana ${tab === t ? 'detalle-pestana--activo' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
            {t === 'equipos'   && <span className="pestana-contador">{torneo.equipos?.length ?? 0}</span>}
            {t === 'mi_equipo' && <span className="pestana-contador">{miEquipo?.miembros?.length ?? 0}</span>}
          </button>
        ))}
      </div>

      <div className="detalle-contenido">

        {/* bracket */}
        {tab === 'bracket' && (
          <BracketView
            partidos={partidosOrdenados}
            esOrganizador={esOrganizador}
            onPartidoClick={torneo.estado === 'en_curso' ? setModalPartido : undefined}
            torneoFinalizado={torneo.estado === 'finalizado'}
          />
        )}

        {/* calendario */}
        {tab === 'calendario' && (
          <div className="calendario-tab">

            <div className="calendario-toolbar">
              {enProgramacion && esOrganizador && (
                <p className="calendario-info" style={{ margin: 0, flex: 1 }}>
                  Asigna fecha y hora a cada partido. Cuando todos tengan fecha podrás confirmar el inicio.
                </p>
              )}
              {partidos.some(p => p.programado_en) && (
                <button className="calendario-btn-pdf" onClick={descargarCalendarioPDF} disabled={generandoPDF}>
                  {generandoPDF ? (
                    <>Generando…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                        <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Descargar PDF
                    </>
                  )}
                </button>
              )}
            </div>

            {rondasUnicas.length === 0 ? (
              <p className="detalle-vacio">No hay partidos generados todavía.</p>
            ) : (
              <div className="calendario-layout">

                {/* minicalendario mensual */}
                <div className="calendario-col-izq">
                  <DatePicker
                    inline
                    selected={diaSeleccionado}
                    onChange={date => setDiaSeleccionado(date)}
                    onMonthChange={() => setDiaSeleccionado(null)}
                    locale="es"
                    highlightDates={partidos
                      .filter(p => p.programado_en)
                      .map(p => new Date(p.programado_en))
                    }
                    calendarClassName="calendario-selector-calendario calendario-inline"
                  />
                  <p className="calendario-leyenda">
                    <span className="calendario-leyenda-punto" /> Días con partido
                  </p>
                </div>

                {/* partidos del día que se ha pinchado */}
                <div className="calendario-col-der">
                  {!diaSeleccionado ? (
                    <div className="calendario-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" width="32" height="32" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 9h18M8 2v2M16 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p>Selecciona un día del calendario para ver sus partidos</p>
                    </div>
                  ) : (() => {
                    const diaStr = diaSeleccionado.toDateString()
                    const partidosDia = partidos
                      .filter(p => p.programado_en && new Date(p.programado_en).toDateString() === diaStr)
                      .sort((a, b) => new Date(a.programado_en) - new Date(b.programado_en))

                    const puedeEditar = esOrganizador && (enProgramacion || torneo.estado === 'en_curso')

                    return (
                      <div className="calendario-dia-panel">
                        <h3 className="calendario-dia-titulo">
                          {diaSeleccionado.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>

                        {partidosDia.length === 0 ? (
                          <div className="calendario-dia-vacio">
                            <p>No hay partidos programados para este día.</p>
                            {puedeEditar && <p className="calendario-dia-vacio-hint">Puedes asignar este día a un partido desde la lista de abajo.</p>}
                          </div>
                        ) : (
                          partidosDia.map(partido => {
                            const fechaLocal  = fechasPartidos[partido.id] ?? ''
                            const guardando   = guardandoFecha[partido.id]
                            const sinCambios  = fechaLocal === toDatetimeLocal(partido.programado_en)
                            const fechaSel    = fechaLocal ? new Date(fechaLocal) : null
                            const hora        = partido.programado_en
                              ? new Date(partido.programado_en).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                              : null

                            return (
                              <div key={partido.id} className="calendario-dia-partido">
                                <div className="calendario-dia-hora">{hora}</div>
                                <div className="calendario-dia-info">
                                  <span className="calendario-dia-ronda">{labelRonda(partido.ronda)}</span>
                                  <div className="calendario-partido-equipos">
                                    <span className={`calendario-equipo${!partido.equipo1 ? ' nombre-pendiente' : ''}`}>{partido.equipo1?.nombre ?? 'Por definir'}</span>
                                    <span className="calendario-vs">vs</span>
                                    <span className={`calendario-equipo${!partido.equipo2 ? ' nombre-pendiente' : ''}`}>{partido.equipo2?.nombre ?? 'Por definir'}</span>
                                  </div>
                                </div>
                                {puedeEditar && (
                                  <button
                                    className="calendario-btn-editar"
                                    onClick={() => setModalFecha(partido)}
                                    title="Editar fecha"
                                  >
                                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                                    </svg>
                                    Editar
                                  </button>
                                )}
                              </div>
                            )
                          })
                        )}

                        {/* sin fecha */}
                        {puedeEditar && sinFechaCount > 0 && (
                          <div className="calendario-sin-fecha-lista">
                            <h4 className="calendario-sin-fecha-titulo">Sin fecha asignada ({sinFechaCount})</h4>
                            {partidos.filter(p => !p.programado_en && p.estado !== 'finalizado').map(partido => {
                              const fechaLocal = fechasPartidos[partido.id] ?? ''
                              const guardando  = guardandoFecha[partido.id]
                              const sinCambios = fechaLocal === toDatetimeLocal(partido.programado_en)
                              const fechaSel   = fechaLocal ? new Date(fechaLocal) : null

                              return (
                                <div key={partido.id} className="calendario-dia-partido calendario-dia-partido--pendiente">
                                  <div className="calendario-dia-info">
                                    <span className="calendario-dia-ronda">{labelRonda(partido.ronda)}</span>
                                    <div className="calendario-partido-equipos">
                                      <span className="calendario-equipo">{partido.equipo1?.nombre ?? 'Por definir'}</span>
                                      <span className="calendario-vs">vs</span>
                                      <span className="calendario-equipo">{partido.equipo2?.nombre ?? 'Por definir'}</span>
                                    </div>
                                  </div>
                                  <button
                                    className="calendario-btn-editar calendario-btn-editar--asignar"
                                    onClick={() => setModalFecha(partido)}
                                  >
                                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                                      <path d="M2 7h12M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                    </svg>
                                    Asignar fecha
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* equipos */}
        {tab === 'equipos' && (
          <div className="equipos-lista">

            {/* el organizador también puede crear equipos desde esta tab */}
            {esOrganizador && torneo.estado === 'abierto' && (
              <div className="equipos-barra-organizador">
                {!mostrarFormCrear ? (
                  <button
                    className="btn-primario"
                    onClick={() => { setMostrarFormCrear(true); setEditandoId(null) }}
                  >
                    + Crear equipo
                  </button>
                ) : (
                  <form className="detalle-formulario-inline" onSubmit={handleCrearEquipo}>
                    <input
                      type="text" className="filtro-entrada" placeholder="Nombre del equipo"
                      value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)}
                      maxLength={100} autoFocus required
                    />
                    <label className="btn-secundario escudo-upload-label" title="Subir escudo (jpg/png/webp, máx. 2 MB)">
                      {escudoPreview
                        ? <img src={escudoPreview} alt="preview" className="escudo-preview-mini" />
                        : '🖼 Escudo'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleEscudoChange} />
                    </label>
                    <button type="submit" className="btn-primario" disabled={accionLoading}>
                      {accionLoading ? 'Creando…' : 'Crear'}
                    </button>
                    <button type="button" className="btn-secundario" onClick={resetFormCrear}>
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
                  <div key={equipo.id} className={`tarjeta-equipo ${esMiEquipo ? 'tarjeta-equipo--propio' : ''} ${equipo.bloqueado ? 'tarjeta-equipo--inscrita' : ''}`}>
                    {/* cabecera tarjeta equipo */}
                    <div className="tarjeta-equipo-cabecera">
                      <div className="tarjeta-equipo-cabecera-izq">
                        {/* escudo */}
                        <div className="equipo-escudo-wrap">
                          {equipo.escudo_url
                            ? <img src={equipo.escudo_url} alt={`Escudo ${equipo.nombre}`} className="equipo-escudo" />
                            : <div className="equipo-escudo equipo-escudo--placeholder" aria-hidden="true">🛡</div>
                          }
                          {(esMiEquipo || esOrganizador) && torneo.estado !== 'finalizado' && (
                            <label className="equipo-escudo-cambiar" title="Cambiar escudo">
                              {escudoCambiandoId === equipo.id ? '…' : '✎'}
                              <input
                                type="file" accept="image/jpeg,image/png,image/webp" hidden
                                onChange={e => handleCambiarEscudo(equipo.id, e.target.files?.[0])}
                              />
                            </label>
                          )}
                        </div>
                        <div>
                        {estaEditando ? (
                          <form className="equipo-editar-inline" onSubmit={handleGuardarEdicion}>
                            <input
                              type="text" className="equipo-editar-input"
                              value={nombreEditar}
                              onChange={e => setNombreEditar(e.target.value)}
                              maxLength={100} autoFocus required
                            />
                            <button type="submit" className="btn-primario btn--pequeno"
                              disabled={accionLoading}>
                              {accionLoading ? '…' : 'Guardar'}
                            </button>
                            <button type="button" className="btn-secundario btn--pequeno"
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
                              <span className="insignia-inscrito-confirmado">
                                <svg viewBox="0 0 12 12" fill="none" width="11" height="11" aria-hidden="true">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Inscrito
                              </span>
                            )}
                            {esMiEquipo && <span className="insignia-mi-equipo">Mi equipo</span>}
                          </>
                        )}
                        </div>
                      </div>

                      <div className="tarjeta-equipo-acciones">
                        <span className="equipo-capitan">Cap. {equipo.capitan?.nombre}</span>
                        {esOrganizador && !estaEditando && torneo.estado === 'abierto' && (
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

                    {/* toggle */}
                    <button
                      className="equipo-toggle-btn"
                      onClick={() => toggleExpandido(equipo.id)}
                      aria-expanded={expandidos.has(equipo.id)}
                    >
                      <span className={
                        torneo.max_miembros && numMiembros >= torneo.max_miembros
                          ? 'equipo-limite--lleno'
                          : !confirmado
                            ? 'equipo-limite--incompleto'
                            : 'equipo-limite--ok'
                      }>
                        {numMiembros}
                        {torneo.max_miembros ? ` / ${torneo.max_miembros}` : ''} miembro{numMiembros !== 1 ? 's' : ''}
                        {!confirmado && ` · Faltan ${minMiembros - numMiembros}`}
                        {torneo.max_miembros && numMiembros >= torneo.max_miembros && ' · Completo'}
                      </span>
                      <svg
                        className={`equipo-toggle-chevron ${expandidos.has(equipo.id) ? 'equipo-toggle-chevron--abierto' : ''}`}
                        viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true"
                      >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* miembros */}
                    {expandidos.has(equipo.id) && (
                      <div className="equipo-miembros">
                        {numMiembros === 0
                          ? <span className="equipo-sin-miembros">Sin miembros aún</span>
                          : equipo.miembros?.map(m => (
                            <div key={m.id} className="equipo-miembro">
                              <span className="equipo-miembro-nombre">{m.nombre}</span>
                              <span className="miembro-elo">
                                {torneo.deporte?.nombre ?? 'Deporte'} · {m.elo_al_unirse ?? m.elo} ELO
                              </span>
                              <Link to={`/usuarios/${m.id}`} className="equipo-miembro-perfil">
                                Ver perfil
                              </Link>
                            </div>
                          ))
                        }
                      </div>
                    )}

                    {/* unirse */}
                    {puedoUnirme && !(torneo.max_miembros && equipo.miembros?.length >= torneo.max_miembros) && (
                      <button className="btn-unirse-equipo"
                        onClick={() => handleUnirseEquipo(equipo.id)} disabled={accionLoading}>
                        Unirse a este equipo
                      </button>
                    )}

                    {/* desinscribirse */}
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

        {/* mi equipo */}
        {tab === 'mi_equipo' && miEquipo && (
          <div className="mi-equipo-tab">

            {/* cabecera mi equipo */}
            <div className="mi-equipo-header">
              <div className="mi-equipo-header-info">
                <div className="equipo-escudo-wrap" style={{ marginRight: 12, flexShrink: 0 }}>
                  {miEquipo.escudo_url
                    ? <img src={miEquipo.escudo_url} alt={`Escudo ${miEquipo.nombre}`} className="equipo-escudo" />
                    : <div className="equipo-escudo equipo-escudo--placeholder" aria-hidden="true">🛡</div>
                  }
                  {(esCapitan || esOrganizador) && torneo.estado !== 'finalizado' && (
                    <label className="equipo-escudo-cambiar" title="Cambiar escudo">
                      {escudoCambiandoId === miEquipo.id ? '…' : '✎'}
                      <input
                        type="file" accept="image/jpeg,image/png,image/webp" hidden
                        onChange={e => handleCambiarEscudo(miEquipo.id, e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
                <div>
                <h3 className="mi-equipo-nombre">{miEquipo.nombre}</h3>
                {miEquipo.bloqueado && (
                  <span className="insignia-inscrito-confirmado">
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Inscrito
                  </span>
                )}
                {miEquipo.bloqueado && (
                  <span className="insignia-bloqueada">Bloqueado</span>
                )}
                </div>
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

            {/* miembros */}
            <div className="mi-equipo-miembros">
              {miEquipo.miembros?.map(m => (
                <div key={m.id} className="mi-equipo-miembro">
                  <div className="mi-equipo-miembro-info">
                    <Link to={`/usuarios/${m.id}`} className="mi-equipo-miembro-nombre mi-equipo-miembro-link">{m.nombre}</Link>
                    {m.id === miEquipo.capitan?.id && <span className="insignia-capitan">Capitán</span>}
                    <span className="mi-equipo-miembro-elo">{m.elo_al_unirse ?? m.elo} ELO</span>
                  </div>
                  <div className="mi-equipo-miembro-acciones">
                    <Link to={`/usuarios/${m.id}`} className="equipo-miembro-perfil">
                      Ver perfil
                    </Link>
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
                </div>
              ))}
            </div>

            {/* invitaciones — solo si el equipo no está bloqueado */}
            {(esCapitan || esOrganizador) && torneo.estado === 'abierto' && !miEquipo.bloqueado && (
              <div className="mi-equipo-invitar">
                {invitacion?.codigo ? (
                  <div className="invitacion-codigo">
                    <code className="invitacion-codigo-texto">
                      {`${window.location.origin}/unirse/${invitacion.codigo}`}
                    </code>
                    <button className="btn-secundario btn--pequeno"
                      onClick={() => handleCopiarCodigo(`${window.location.origin}/unirse/${invitacion.codigo}`)}>
                      {copiadoOk ? '¡Copiado!' : 'Copiar'}
                    </button>
                    <button className="btn-secundario btn--pequeno"
                      onClick={() => setInvitacion(null)}>
                      Ocultar
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-secundario"
                    onClick={handleGenerarCodigoMiEquipo}
                    disabled={invitacion?.loading}
                  >
                    {invitacion?.loading ? 'Generando…' : '+ Invitar jugadores'}
                  </button>
                )}
              </div>
            )}

            {/* retirar equipo del torneo */}
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

        {/* historial de partidos */}
        {tab === 'partidos' && (
          <div className="partidos-historial">
            {partidosHistorial.length === 0 ? (
              <p className="detalle-vacio">No hay partidos jugados todavía.</p>
            ) : (() => {
              // agrupar por ronda descendente (Final primero)
              const porRonda = partidosHistorial.reduce((acc, p) => {
                const r = p.ronda ?? 0
                if (!acc[r]) acc[r] = []
                acc[r].push(p)
                return acc
              }, {})
              const rondasDesc = Object.keys(porRonda).map(Number).sort((a, b) => b - a)

              return rondasDesc.map(ronda => (
                <div key={ronda} className="historial-grupo-ronda">
                  <div className="historial-ronda-cabecera">
                    <span className="historial-ronda-label">{labelRonda(ronda)}</span>
                    <span className="historial-ronda-count">{porRonda[ronda].length} partido{porRonda[ronda].length !== 1 ? 's' : ''}</span>
                  </div>

                  {porRonda[ronda].map(p => {
                    const enEquipo1   = p.equipo1?.id === miEquipo?.id
                    const enEquipo2   = p.equipo2?.id === miEquipo?.id
                    const deltaPropio = enEquipo1 ? p.delta_elo_e1 : enEquipo2 ? p.delta_elo_e2 : null
                    const abierto     = expandidos.has(p.id)
                    const eq1         = (torneo.equipos ?? []).find(e => e.id === p.equipo1?.id)
                    const eq2         = (torneo.equipos ?? []).find(e => e.id === p.equipo2?.id)

                    return (
                      <div key={p.id} className="partido-bloque">
                        <div
                          className={`partido-fila partido-fila--${p.estado} partido-fila--clickable`}
                          onClick={() => toggleExpandido(p.id)}
                          role="button"
                          aria-expanded={abierto}
                        >
                          <div className="partido-enfrentamiento">
                            <span className={p.ganador_equipo_id === p.equipo1?.id ? 'partido-ganador' : (!p.equipo1 ? 'nombre-pendiente' : '')}>
                              {p.equipo1?.nombre ?? 'Por definir'}
                            </span>
                            <span className="partido-resultado">
                              {p.resultado_e1} – {p.resultado_e2}
                            </span>
                            <span className={p.ganador_equipo_id === p.equipo2?.id ? 'partido-ganador' : (!p.equipo2 ? 'nombre-pendiente' : '')}>
                              {p.equipo2?.nombre ?? 'Por definir'}
                            </span>
                          </div>
                          {deltaPropio !== null && (
                            <span className={`partido-delta ${deltaPropio >= 0 ? 'partido-delta--pos' : 'partido-delta--neg'}`}>
                              {deltaPropio >= 0 ? '+' : ''}{deltaPropio} ELO
                            </span>
                          )}
                          <svg className={`partido-chevron ${abierto ? 'partido-chevron--abierto' : ''}`}
                            viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>

                        {abierto && (
                          <div className="partido-detalle">
                            {[
                              { equipo: eq1 ?? p.equipo1, delta: p.delta_elo_e1, esGanador: p.ganador_equipo_id === p.equipo1?.id },
                              { equipo: eq2 ?? p.equipo2, delta: p.delta_elo_e2, esGanador: p.ganador_equipo_id === p.equipo2?.id },
                            ].map(({ equipo, delta, esGanador }) => equipo && (
                              <div key={equipo.id} className="partido-detalle-equipo">
                                <div className="partido-detalle-equipo-header">
                                  <span className={`partido-detalle-nombre ${esGanador ? 'partido-detalle-nombre--ganador' : ''}`}>
                                    {esGanador && '🏆 '}{equipo.nombre}
                                  </span>
                                  {delta !== null && (
                                    <span className={`partido-delta ${delta >= 0 ? 'partido-delta--pos' : 'partido-delta--neg'}`}>
                                      {delta >= 0 ? '+' : ''}{delta} ELO
                                    </span>
                                  )}
                                </div>
                                <div className="partido-detalle-miembros">
                                  {(equipo.miembros ?? []).map(m => {
                                    const snap = (p.historial_elo ?? []).find(h => h.usuario_id === m.id)
                                    return (
                                      <div key={m.id} className="partido-detalle-miembro">
                                        <span className="partido-detalle-miembro-nombre">{m.nombre}</span>
                                        {snap ? (
                                          <>
                                            <span className="partido-detalle-elo-progresion">
                                              {snap.elo_antes} → {snap.elo_despues}
                                            </span>
                                            <span className={`partido-delta partido-delta--sm ${snap.delta >= 0 ? 'partido-delta--pos' : 'partido-delta--neg'}`}>
                                              {snap.delta >= 0 ? '+' : ''}{snap.delta}
                                            </span>
                                          </>
                                        ) : (
                                          delta !== null && (
                                            <span className={`partido-delta partido-delta--sm ${delta >= 0 ? 'partido-delta--pos' : 'partido-delta--neg'}`}>
                                              {delta >= 0 ? '+' : ''}{delta} ELO
                                            </span>
                                          )
                                        )}
                                      </div>
                                    )
                                  })}
                                  {(!equipo.miembros || equipo.miembros.length === 0) && (
                                    <span className="partido-detalle-sin-miembros">Sin miembros registrados</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            })()}
          </div>
        )}

      </div>

      {confirmarBorrarTorneo && (
        <div className="modal-fondo" onMouseDown={() => setConfirmarBorrarTorneo(false)}>
          <div className="modal-tarjeta" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">¿Eliminar torneo?</h3>
              <button className="modal-cerrar" onClick={() => setConfirmarBorrarTorneo(false)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-formulario">
              <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                Se eliminará el torneo <strong>{torneo.nombre}</strong> junto con todos sus equipos e inscripciones.
                Esta acción no se puede deshacer.
              </p>
              <div className="modal-acciones">
                <button className="btn-secundario" onClick={() => setConfirmarBorrarTorneo(false)} disabled={accionLoading}>
                  Cancelar
                </button>
                <button className="btn-eliminar-confirmar" onClick={async () => { setConfirmarBorrarTorneo(false); await handleEliminarTorneo() }} disabled={accionLoading}>
                  {accionLoading ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmarEliminar && (
        <div className="modal-fondo" onMouseDown={() => setConfirmarEliminar(null)}>
          <div className="modal-tarjeta" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">¿Eliminar equipo?</h3>
              <button className="modal-cerrar" onClick={() => setConfirmarEliminar(null)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-formulario">
              <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                Se eliminará el equipo <strong>{confirmarEliminar.nombre}</strong> y todos sus miembros
                serán desinscritos. Esta acción no se puede deshacer.
              </p>
              <div className="modal-acciones">
                <button className="btn-secundario" onClick={() => setConfirmarEliminar(null)} disabled={accionLoading}>
                  Cancelar
                </button>
                <button className="btn-eliminar-confirmar" onClick={confirmarEliminarEquipo} disabled={accionLoading}>
                  {accionLoading ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmarIniciar && (
        <div className="modal-fondo" onMouseDown={() => setConfirmarIniciar(false)}>
          <div className="modal-tarjeta" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">¿Iniciar el torneo?</h3>
              <button className="modal-cerrar" onClick={() => setConfirmarIniciar(false)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-formulario">
              <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                Se generará el bracket y el torneo pasará a fase de <strong>Programación</strong>.
                Después podrás asignar fechas a cada partido y confirmar el inicio.
                {hayIncompletos && (
                  <> Los equipos sin confirmar (<strong>{equiposIncompletos.map(e => e.nombre).join(', ')}</strong>) serán eliminados.</>
                )}
              </p>
              <div className="modal-acciones">
                <button className="btn-secundario" onClick={() => setConfirmarIniciar(false)} disabled={accionLoading}>
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

      {confirmarConfirmar && (
        <div className="modal-fondo" onMouseDown={() => setConfirmarConfirmar(false)}>
          <div className="modal-tarjeta" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3 className="modal-titulo">¿Confirmar inicio del torneo?</h3>
              <button className="modal-cerrar" onClick={() => setConfirmarConfirmar(false)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-formulario">
              <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                El torneo pasará a <strong>En curso</strong> y los resultados podrán registrarse.
                Las fechas de los partidos aún podrán editarse después.
              </p>
              <div className="modal-acciones">
                <button className="btn-secundario" onClick={() => setConfirmarConfirmar(false)} disabled={accionLoading}>
                  Cancelar
                </button>
                <button
                  className="btn-iniciar"
                  disabled={accionLoading}
                  onClick={async () => { setConfirmarConfirmar(false); await handleConfirmar() }}
                >
                  {accionLoading ? 'Confirmando…' : 'Sí, iniciar torneo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalFecha && (
        <div className="modal-fondo" onMouseDown={() => setModalFecha(null)}>
          <div className="modal-tarjeta modal-tarjeta--fecha" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <div>
                <h3 className="modal-titulo">Editar fecha del partido</h3>
                <p className="modal-subtitulo">
                  <span className={!modalFecha.equipo1 ? 'nombre-pendiente' : ''}>{modalFecha.equipo1?.nombre ?? 'Por definir'}</span>
                  <span style={{ margin: '0 6px', color: 'var(--text)' }}>vs</span>
                  <span className={!modalFecha.equipo2 ? 'nombre-pendiente' : ''}>{modalFecha.equipo2?.nombre ?? 'Por definir'}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text)' }}>· {labelRonda(modalFecha.ronda)}</span>
                </p>
              </div>
              <button className="modal-cerrar" onClick={() => setModalFecha(null)} aria-label="Cerrar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-formulario">
              <div className="modal-fecha-selector">
                <DatePicker
                  inline
                  selected={fechasPartidos[modalFecha.id] ? new Date(fechasPartidos[modalFecha.id]) : null}
                  onChange={date => {
                    if (!date) return
                    const pad = n => String(n).padStart(2, '0')
                    const str = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
                    setFechasPartidos(prev => ({ ...prev, [modalFecha.id]: str }))
                  }}
                  minDate={new Date()}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Hora"
                  locale="es"
                  calendarClassName="calendario-selector-calendario calendario-inline"
                />
              </div>
              {errorFecha[modalFecha.id] && (
                <p className="calendario-error-fecha">{errorFecha[modalFecha.id]}</p>
              )}
              <div className="modal-acciones">
                <button className="btn-secundario" onClick={() => setModalFecha(null)}>
                  Cancelar
                </button>
                <button
                  className="btn-iniciar"
                  onClick={() => handleGuardarFecha(modalFecha.id)}
                  disabled={
                    guardandoFecha[modalFecha.id] ||
                    !fechasPartidos[modalFecha.id] ||
                    fechasPartidos[modalFecha.id] === toDatetimeLocal(modalFecha.programado_en)
                  }
                >
                  {guardandoFecha[modalFecha.id] ? 'Guardando…' : 'Guardar fecha'}
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
