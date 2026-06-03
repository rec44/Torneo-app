import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usuarioService } from '../../services/usuarioService'
import { TorneoCard } from '../../components/TorneoCard'

const esFinalizado = t => t.estado === 'finalizado'
const PASO = 8

function SeccionHistorial({ titulo, torneos, vacio, navigate, loading }) {
  const [visibles, setVisibles] = useState(PASO)
  const mostrados = torneos.slice(0, visibles)

  return (
    <section className="mb-10">
      <h2 className="text-[18px] font-semibold text-skin-heading mb-4">{titulo}</h2>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[14px] p-[18px] bg-skin-card rounded-2xl min-w-[240px] flex-shrink-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="shimmer h-[13px] w-2/5 rounded-md" />
              <div className="shimmer h-[18px] w-[70%] rounded-md" />
              <div className="shimmer h-[13px] rounded-md" />
            </div>
          ))}
        </div>
      ) : torneos.length === 0 ? (
        <p className="text-[14px] text-skin-text">{vacio}</p>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mostrados.map(t => (
              <div key={t.id} className="min-w-[260px] flex-shrink-0">
                <TorneoCard torneo={t} onVerDetalle={id => navigate(`/torneos/${id}`)} />
              </div>
            ))}
          </div>
          {visibles < torneos.length && (
            <button
              onClick={() => setVisibles(v => v + PASO)}
              className="mt-4 px-4 py-[7px] text-[13px] font-semibold text-skin-text bg-transparent border border-skin-border rounded-lg cursor-pointer transition-colors hover:text-skin-heading hover:border-skin-heading"
            >
              Ver más · {torneos.length - visibles} restante{torneos.length - visibles !== 1 ? 's' : ''}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export function PerfilPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const esPropio = String(id) === String(user?.id)

  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    usuarioService.getById(id)
      .then(setPerfil)
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [id])

  const elosDeporte      = [...(perfil?.elosDeporte    ?? [])].sort((a, b) => b.elo - a.elo)
  const torneosCreados   = perfil?.torneos_creados   ?? []
  const torneosInscritos = perfil?.torneos_inscritos ?? []
  const eloGlobal = elosDeporte.length > 0
    ? Math.round(elosDeporte.reduce((sum, e) => sum + e.elo, 0) / elosDeporte.length)
    : 500

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 w-full box-border max-md:px-4 max-md:py-6">

      {!esPropio && (
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 mb-6 text-[13px] font-medium text-skin-text bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-skin-heading">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
      )}

      {/* ── Header ── */}
      <header className="flex items-center gap-5 mb-8 max-sm:flex-col max-sm:text-center max-sm:items-center">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-[26px] font-bold text-skin-bg">
          {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold text-skin-heading m-0 tracking-tight">
            {perfil?.nombre ?? '…'}
          </h1>
          {esPropio && <p className="text-[14px] text-skin-text m-0">{perfil?.email}</p>}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 text-[12px] font-bold bg-accent text-white rounded-full">
              ELO {eloGlobal}
            </span>
            {elosDeporte.map(e => (
              <span key={e.deporte_id} className="inline-flex items-center px-2 py-[3px] text-[11px] font-semibold bg-skin-code text-skin-heading border border-skin-border rounded-[4px]">
                {e.deporte?.nombre} · {e.elo}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="flex items-center gap-0 mb-10 bg-skin-card border border-skin-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {[
          { valor: torneosInscritos.length, label: 'Participados' },
          { valor: torneosCreados.length,   label: 'Organizados' },
          { valor: perfil?.torneos_ganados ?? 0, label: 'Ganados' },
        ].map(({ valor, label }, i, arr) => (
          <div key={label} className={`flex-1 flex flex-col items-center py-5 px-4 ${i < arr.length - 1 ? 'border-r border-skin-border' : ''}`}>
            <span className="text-[26px] font-bold text-skin-heading leading-none">{valor}</span>
            <span className="text-[12px] font-medium text-skin-text mt-1 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-[18px] py-[14px] text-[14px] text-red-600 bg-red-500/8 rounded-lg mb-6">{error}</div>
      )}

      {/* ── ELO por deporte ── */}
      <section className="mb-10">
        <h2 className="text-[18px] font-semibold text-skin-heading mb-4">ELO por deporte</h2>

        <div className="bg-skin-card border border-skin-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Tarjeta ELO global */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-skin-border">
            <div>
              <p className="text-[13px] font-semibold text-skin-heading m-0">ELO global</p>
              <p className="text-[12px] text-skin-text m-0">Media de los deportes · solo informativo</p>
            </div>
            <span className="text-[22px] font-bold text-accent">{eloGlobal}</span>
          </div>

          {elosDeporte.length > 0 ? (
            <div className="divide-y divide-skin-border">
              {elosDeporte.map(e => (
                <div key={e.deporte_id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[14px] text-skin-heading font-medium">{e.deporte?.nombre}</span>
                  <span className="text-[14px] font-bold text-skin-heading">{e.elo}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-skin-text px-5 py-4 m-0">
              {esPropio
                ? 'Todavía no tienes ELO en ningún deporte. Participa en torneos para acumularlo.'
                : 'Este usuario todavía no tiene ELO en ningún deporte.'}
            </p>
          )}
        </div>
      </section>

      <SeccionHistorial
        titulo="Historial torneos organizados"
        torneos={torneosCreados.filter(esFinalizado)}
        vacio={esPropio ? 'No tienes historial de torneos organizados.' : 'Este usuario no tiene torneos organizados finalizados.'}
        navigate={navigate} loading={loading}
      />
      <SeccionHistorial
        titulo="Historial torneos participados"
        torneos={torneosInscritos.filter(esFinalizado)}
        vacio={esPropio ? 'No tienes historial de torneos en los que hayas participado.' : 'Este usuario no tiene torneos participados finalizados.'}
        navigate={navigate} loading={loading}
      />
    </div>
  )
}
