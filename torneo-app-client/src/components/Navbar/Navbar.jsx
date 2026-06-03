import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const linkBase = 'inline-flex items-center h-[72px] px-4 text-[15px] font-medium text-skin-text no-underline border-b-2 border-transparent -mb-px transition-colors duration-150 hover:text-skin-heading'
const linkActivo = 'text-skin-heading font-semibold border-b-accent'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMenuAbierto(false)
    navigate('/torneos')
  }

  const cerrarMenu = () => setMenuAbierto(false)

  const abrirPanelAdmin = () => {
    const token = localStorage.getItem('token') ?? ''
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'http://localhost:8000/admin/auth'
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'token'
    input.value = token
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="relative flex items-center gap-0 px-9 h-[72px] sticky top-0 z-50
        bg-skin-bg/80 backdrop-blur-[18px] backdrop-saturate-[160%]
        border-b border-skin-border/60"
        style={{ WebkitBackdropFilter: 'saturate(160%) blur(18px)' }}
      >
        {/* Franja naranja top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />

        {/* Hamburguesa — solo móvil */}
        <button
          className="md:hidden inline-flex items-center justify-center w-9 h-9 p-0 text-skin-heading bg-transparent border-none rounded-lg cursor-pointer transition-colors hover:bg-skin-code flex-shrink-0"
          onClick={() => setMenuAbierto(v => !v)}
          aria-label="Menú"
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? (
            <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {/* Brand */}
        <NavLink
          to="/torneos"
          onClick={cerrarMenu}
          className="inline-flex items-center gap-[10px] text-[20px] font-bold text-skin-heading no-underline tracking-tight flex-shrink-0
            max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2"
        >
          <svg className="w-[22px] h-[22px] text-accent flex-shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          RiseCup
        </NavLink>

        {/* Divisor */}
        <div className="hidden md:block w-px h-[22px] bg-skin-border mx-6 flex-shrink-0" />

        {/* Links escritorio */}
        <div className="hidden md:flex gap-0 flex-1">
          <NavLink to="/torneos" end
            className={({ isActive }) => linkBase + (isActive ? ' ' + linkActivo : '')}>
            Torneos
          </NavLink>
          {user && (
            <NavLink to="/mis-torneos"
              className={({ isActive }) => linkBase + (isActive ? ' ' + linkActivo : '')}>
              Mis torneos
            </NavLink>
          )}
          {user && (
            <NavLink to={`/usuarios/${user.id}`}
              className={({ isActive }) => linkBase + (isActive ? ' ' + linkActivo : '')}>
              Perfil
            </NavLink>
          )}
        </div>

        {/* Sección usuario */}
        <div className="flex items-center gap-[10px] ml-auto flex-shrink-0">
          {user ? (
            <>
              {user.rol === 'admin' && (
                <button
                  onClick={abrirPanelAdmin}
                  className="hidden md:inline-block px-[14px] py-[6px] text-[12.5px] font-bold uppercase tracking-[0.05em] text-skin-bg bg-skin-heading rounded-[5px] border-none cursor-pointer transition-opacity hover:opacity-70"
                >
                  Admin
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-accent text-skin-bg text-[14px] font-bold flex-shrink-0">
                  {user.nombre?.[0]?.toUpperCase()}
                </span>
                <span className="hidden lg:inline text-[15px] font-medium text-skin-text">
                  {user.nombre}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:inline-block px-4 py-[7px] text-[14px] font-medium text-skin-text bg-transparent border border-skin-border rounded-md cursor-pointer transition-colors hover:text-skin-heading hover:border-skin-heading"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="hidden md:inline-block px-4 py-[7px] text-[14px] font-medium text-skin-text no-underline border border-skin-border rounded-md transition-colors hover:text-skin-heading hover:border-skin-heading">
                Iniciar sesión
              </Link>
              <Link to="/register"
                className="hidden md:inline-block px-[18px] py-2 text-[13.5px] font-bold uppercase tracking-[0.03em] text-skin-bg no-underline bg-accent rounded-md transition-opacity hover:opacity-90">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Menú móvil ── */}
      {menuAbierto && (
        <div className="md:hidden flex flex-col bg-skin-bg/96 backdrop-blur-[18px] border-b border-skin-border px-0 pb-4 pt-2 sticky top-[72px] z-40"
          style={{ WebkitBackdropFilter: 'saturate(160%) blur(18px)' }}
        >
          <NavLink to="/torneos" end onClick={cerrarMenu}
            className={({ isActive }) => `px-6 py-[13px] text-[15px] font-medium text-skin-heading no-underline transition-colors hover:bg-skin-code ${isActive ? 'text-accent font-semibold' : ''}`}>
            Torneos
          </NavLink>
          {user && (
            <NavLink to="/mis-torneos" onClick={cerrarMenu}
              className={({ isActive }) => `px-6 py-[13px] text-[15px] font-medium text-skin-heading no-underline transition-colors hover:bg-skin-code ${isActive ? 'text-accent font-semibold' : ''}`}>
              Mis torneos
            </NavLink>
          )}
          {user && (
            <NavLink to={`/usuarios/${user.id}`} onClick={cerrarMenu}
              className={({ isActive }) => `px-6 py-[13px] text-[15px] font-medium text-skin-heading no-underline transition-colors hover:bg-skin-code ${isActive ? 'text-accent font-semibold' : ''}`}>
              Perfil
            </NavLink>
          )}
          {!user && (
            <Link to="/login" onClick={cerrarMenu}
              className="px-6 py-[13px] text-[15px] font-medium text-skin-heading no-underline transition-colors hover:bg-skin-code">
              Iniciar sesión
            </Link>
          )}
          {!user && (
            <Link to="/register" onClick={cerrarMenu}
              className="px-6 py-[13px] text-[15px] font-bold text-accent no-underline">
              Registrarse
            </Link>
          )}
          {user?.rol === 'admin' && (
            <button onClick={() => { abrirPanelAdmin(); cerrarMenu() }}
              className="px-6 py-[13px] text-[15px] font-medium text-skin-heading text-left bg-transparent border-none cursor-pointer transition-colors hover:bg-skin-code">
              Panel admin
            </button>
          )}
          {user && (
            <button onClick={handleLogout}
              className="px-6 py-[13px] text-[15px] font-medium text-red-600 text-left bg-transparent border-none border-t border-skin-border mt-1 cursor-pointer">
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </>
  )
}
