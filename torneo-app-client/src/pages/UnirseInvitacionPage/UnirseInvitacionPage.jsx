import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { equipoService } from '../../services/equipoService'

const cardCls = 'w-full max-w-sm mx-auto bg-skin-card border border-skin-border rounded-2xl p-8 flex flex-col items-center text-center gap-5'
const btnPrimario = 'inline-flex items-center justify-center w-full px-5 py-[10px] text-[14px] font-bold uppercase tracking-[0.03em] text-skin-bg bg-accent border-none rounded-lg cursor-pointer transition-opacity hover:opacity-90 no-underline'
const btnSecundario = 'inline-flex items-center justify-center w-full px-5 py-[10px] text-[14px] font-semibold text-skin-heading bg-transparent border border-skin-border rounded-lg cursor-pointer transition-colors hover:border-skin-heading no-underline'

function IconoEstado({ tipo }) {
  const esOk = tipo === 'ok'
  return (
    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${esOk ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
      <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
        {esOk
          ? <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        }
      </svg>
    </div>
  )
}

export function UnirseInvitacionPage() {
  const { codigo } = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useAuth()

  const [info,    setInfo]    = useState(null)
  const [estado,  setEstado]  = useState('cargando')
  const [error,   setError]   = useState(null)
  const [uniendo, setUniendo] = useState(false)

  useEffect(() => {
    equipoService.getInvitacionInfo(codigo)
      .then(data => { setInfo(data); setEstado(data.vigente ? 'ok' : 'invalida') })
      .catch(() => setEstado('invalida'))
  }, [codigo])

  const handleUnirse = async () => {
    setUniendo(true); setError(null)
    try {
      await equipoService.unirsePorCodigo(codigo)
      setEstado('unido')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al unirse al equipo.')
      setUniendo(false)
    }
  }

  const page = (children) => (
    <div className="flex-1 flex items-center justify-center px-4 py-12">{children}</div>
  )

  if (estado === 'cargando') return page(
    <div className={cardCls}>
      <div className="shimmer h-4 w-2/3 rounded-md" />
      <div className="shimmer h-3 w-1/2 rounded-md" />
    </div>
  )

  if (estado === 'invalida') return page(
    <div className={cardCls}>
      <IconoEstado tipo="error" />
      <div>
        <h2 className="text-[20px] font-semibold text-skin-heading m-0 mb-2">Invitación inválida</h2>
        <p className="text-[14px] text-skin-text">Este enlace ha expirado, ya fue usado o no existe.</p>
      </div>
      <Link to="/torneos" className={btnPrimario}>Ver torneos disponibles</Link>
    </div>
  )

  if (estado === 'unido') return page(
    <div className={cardCls}>
      <IconoEstado tipo="ok" />
      <div>
        <h2 className="text-[20px] font-semibold text-skin-heading m-0 mb-2">¡Ya eres parte del equipo!</h2>
        <p className="text-[14px] text-skin-text">
          Ahora formas parte de <strong className="text-skin-heading">{info.equipo.nombre}</strong> en el torneo{' '}
          <strong className="text-skin-heading">{info.torneo.nombre}</strong>.
        </p>
      </div>
      <button className={btnPrimario} onClick={() => navigate(`/torneos/${info.torneo.id}`)}>
        Ver el torneo
      </button>
    </div>
  )

  const redirectParam = encodeURIComponent(location.pathname)

  return page(
    <div className={cardCls}>
      {info.torneo.deporte && (
        <span className="inline-flex items-center px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.06em] bg-skin-code text-skin-heading border border-skin-border rounded-[4px]">
          {info.torneo.deporte.nombre}
        </span>
      )}
      <h2 className="text-[20px] font-semibold text-skin-heading m-0">{info.torneo.nombre}</h2>

      {/* Caja equipo */}
      <div className="w-full bg-skin-code border border-skin-border rounded-xl px-5 py-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-skin-text mb-1">Te han invitado al equipo</p>
        <p className="text-[17px] font-bold text-skin-heading mb-1">{info.equipo.nombre}</p>
        <p className="text-[13px] text-skin-text">
          {info.equipo.miembros_count} miembro{info.equipo.miembros_count !== 1 ? 's' : ''} · Torneo{' '}
          {info.torneo.estado === 'abierto' ? 'abierto' : info.torneo.estado}
        </p>
      </div>

      {error && <p className="text-[13px] text-red-600 m-0">{error}</p>}

      {user ? (
        <button className={btnPrimario} onClick={handleUnirse} disabled={uniendo}>
          {uniendo ? 'Uniéndose…' : `Unirse a ${info.equipo.nombre}`}
        </button>
      ) : (
        <div className="w-full flex flex-col gap-3">
          <p className="text-[13px] text-skin-text m-0">Necesitas una cuenta para unirte a este equipo.</p>
          <Link to={`/login?redirect=${redirectParam}`}    className={btnPrimario}>Iniciar sesión</Link>
          <Link to={`/register?redirect=${redirectParam}`} className={btnSecundario}>Crear cuenta</Link>
        </div>
      )}
    </div>
  )
}
