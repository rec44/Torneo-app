import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './Navbar.css'

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
      <nav className="barra-nav">

        {/* Hamburguesa — solo móvil */}
        <button
          className="barra-nav-hamburguesa"
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

        {/* Brand — centrado en móvil, izquierda en desktop */}
        <NavLink to="/torneos" className="barra-nav-marca" onClick={cerrarMenu}>
          <svg className="barra-nav-marca-icono" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          RiseCup
        </NavLink>

        <div className="barra-nav-divisor" />

        {/* Links — ocultos en móvil, en el dropdown */}
        <div className="barra-nav-enlaces">
          <NavLink to="/torneos" className={({ isActive }) => 'barra-nav-enlace' + (isActive ? ' barra-nav-enlace--activo' : '')} end>
            Torneos
          </NavLink>
          {user && (
            <NavLink to="/mis-torneos" className={({ isActive }) => 'barra-nav-enlace' + (isActive ? ' barra-nav-enlace--activo' : '')}>
              Mis torneos
            </NavLink>
          )}
          {user && (
            <NavLink to={`/usuarios/${user.id}`} className={({ isActive }) => 'barra-nav-enlace' + (isActive ? ' barra-nav-enlace--activo' : '')}>
              Perfil
            </NavLink>
          )}
        </div>

        {/* User section */}
        <div className="barra-nav-usuario">
          {user ? (
            <>
              {user.rol === 'admin' && (
                <button className="barra-nav-btn-admin" onClick={abrirPanelAdmin}>
                  Admin
                </button>
              )}
              <div className="barra-nav-info-usuario">
                <span className="barra-nav-avatar">{user.nombre?.[0]?.toUpperCase()}</span>
                <span className="barra-nav-nombre-usuario">{user.nombre}</span>
              </div>
              <button className="barra-nav-btn-salir" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="barra-nav-btn-fantasma">Iniciar sesión</Link>
              <Link to="/register" className="barra-nav-btn-acento">Registrarse</Link>
            </>
          )}
        </div>

      </nav>

      {/* Dropdown móvil */}
      {menuAbierto && (
        <div className="barra-nav-menu-movil">
          <NavLink to="/torneos" className="movil-enlace" onClick={cerrarMenu} end>Torneos</NavLink>
          {user && <NavLink to="/mis-torneos" className="movil-enlace" onClick={cerrarMenu}>Mis torneos</NavLink>}
          {user && <NavLink to={`/usuarios/${user.id}`} className="movil-enlace" onClick={cerrarMenu}>Perfil</NavLink>}
          {!user && <Link to="/login"    className="movil-enlace" onClick={cerrarMenu}>Iniciar sesión</Link>}
          {!user && <Link to="/register" className="movil-enlace movil-enlace--acento" onClick={cerrarMenu}>Registrarse</Link>}
          {user?.rol === 'admin' && (
            <button className="movil-enlace" onClick={() => { abrirPanelAdmin(); cerrarMenu() }}>
              Panel admin
            </button>
          )}
          {user && (
            <button className="movil-enlace movil-enlace--salir" onClick={handleLogout}>
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </>
  )
}
