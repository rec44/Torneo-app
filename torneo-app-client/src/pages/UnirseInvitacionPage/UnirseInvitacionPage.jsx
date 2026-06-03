import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { equipoService } from '../../services/equipoService'
import './UnirseInvitacionPage.css'

export function UnirseInvitacionPage() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [info, setInfo]       = useState(null)
  const [estado, setEstado]   = useState('cargando') // cargando | ok | invalida | unido
  const [error, setError]     = useState(null)
  const [uniendo, setUniendo] = useState(false)

  useEffect(() => {
    equipoService.getInvitacionInfo(codigo)
      .then(data => {
        setInfo(data)
        setEstado(data.vigente ? 'ok' : 'invalida')
      })
      .catch(() => setEstado('invalida'))
  }, [codigo])

  const handleUnirse = async () => {
    setUniendo(true)
    setError(null)
    try {
      await equipoService.unirsePorCodigo(codigo)
      setEstado('unido')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al unirse al equipo.')
      setUniendo(false)
    }
  }

  if (estado === 'cargando') {
    return (
      <div className="unirse-page">
        <div className="unirse-card">
          <p className="unirse-cargando">Verificando invitación…</p>
        </div>
      </div>
    )
  }

  if (estado === 'invalida') {
    return (
      <div className="unirse-page">
        <div className="unirse-card">
          <div className="unirse-icono unirse-icono--error">
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="unirse-titulo">Invitación inválida</h2>
          <p className="unirse-descripcion">Este enlace ha expirado, ya fue usado o no existe.</p>
          <Link to="/torneos" className="btn-primario">Ver torneos disponibles</Link>
        </div>
      </div>
    )
  }

  if (estado === 'unido') {
    return (
      <div className="unirse-page">
        <div className="unirse-card">
          <div className="unirse-icono unirse-icono--ok">
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="unirse-titulo">¡Ya eres parte del equipo!</h2>
          <p className="unirse-descripcion">
            Ahora formas parte de <strong>{info.equipo.nombre}</strong> en el torneo{' '}
            <strong>{info.torneo.nombre}</strong>.
          </p>
          <button className="btn-primario" onClick={() => navigate(`/torneos/${info.torneo.id}`)}>
            Ver el torneo
          </button>
        </div>
      </div>
    )
  }

  const redirectParam = encodeURIComponent(location.pathname)

  return (
    <div className="unirse-page">
      <div className="unirse-card">
        {info.torneo.deporte && (
          <span className="unirse-deporte">{info.torneo.deporte.nombre}</span>
        )}
        <h2 className="unirse-titulo">{info.torneo.nombre}</h2>

        <div className="unirse-equipo-caja">
          <div className="unirse-equipo-etiqueta">Te han invitado al equipo</div>
          <div className="unirse-equipo-nombre">{info.equipo.nombre}</div>
          <div className="unirse-equipo-meta">
            {info.equipo.miembros_count} miembro{info.equipo.miembros_count !== 1 ? 's' : ''} · Torneo {info.torneo.estado === 'abierto' ? 'abierto' : info.torneo.estado}
          </div>
        </div>

        {error && <p className="unirse-error">{error}</p>}

        {user ? (
          <button className="btn-primario unirse-boton" onClick={handleUnirse} disabled={uniendo}>
            {uniendo ? 'Uniéndose…' : `Unirse a ${info.equipo.nombre}`}
          </button>
        ) : (
          <div className="unirse-auth">
            <p className="unirse-auth-pista">Necesitas una cuenta para unirte a este equipo.</p>
            <div className="unirse-auth-acciones">
              <Link to={`/login?redirect=${redirectParam}`} className="btn-primario">
                Iniciar sesión
              </Link>
              <Link to={`/register?redirect=${redirectParam}`} className="btn-secundario">
                Crear cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
