import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usuarioService } from '../services/usuarioService'
import './PerfilPage.css'

export function PerfilPublicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    usuarioService.getById(id)
      .then(setUsuario)
      .catch(() => setError('No se pudo cargar el perfil de este usuario.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="perfil-pub-page">
        <div className="perfil-pub-skeleton">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      </div>
    )
  }

  if (error || !usuario) {
    return (
      <div className="perfil-pub-page">
        <p className="perfil-pub-error">{error ?? 'Usuario no encontrado.'}</p>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  return (
    <div className="perfil-pub-page">
      <button className="btn-volver" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      <header className="perfil-pub-header">
        <div className="perfil-avatar perfil-pub-avatar">
          {usuario.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="perfil-pub-nombre">{usuario.nombre}</h1>
          <span className="perfil-elo-badge">ELO {usuario.elo ?? 500}</span>
        </div>
      </header>

      <section className="perfil-pub-elo">
        <p className="perfil-pub-seccion-titulo">ELO por deporte</p>
        {usuario.elosDeporte?.length > 0 ? (
          <div className="perfil-elo-lista">
            {usuario.elosDeporte.map(e => (
              <div key={e.deporte_id} className="perfil-elo-fila">
                <span className="perfil-elo-deporte">{e.deporte?.nombre}</span>
                <span className="perfil-elo-valor">{e.elo}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="perfil-vacio">
            Este usuario todavía no tiene ELO registrado en ningún deporte.
          </p>
        )}
      </section>
    </div>
  )
}
