import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
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
    form.target = '_blank'
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
      <nav className="navbar">

        {/* Hamburguesa — solo móvil */}
        <button
          className="navbar-hamburguesa"
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
        <NavLink to="/torneos" className="navbar-brand" onClick={cerrarMenu}>
          <svg className="navbar-brand-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          RiseCup
        </NavLink>

        <div className="navbar-divider" />

        {/* Links — ocultos en móvil, en el dropdown */}
        <div className="navbar-links">
          <NavLink to="/torneos" className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')} end>
            Torneos
          </NavLink>
          {user && (
            <NavLink to="/mis-torneos" className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')}>
              Mis torneos
            </NavLink>
          )}
          {user && (
            <NavLink to={`/usuarios/${user.id}`} className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')}>
              Perfil
            </NavLink>
          )}
        </div>

        {/* User section */}
        <div className="navbar-user">
          {user ? (
            <>
              {user.rol === 'admin' && (
                <button className="navbar-btn-admin" onClick={abrirPanelAdmin}>
                  Admin
                </button>
              )}
              <div className="navbar-user-info">
                <span className="navbar-avatar">{user.nombre?.[0]?.toUpperCase()}</span>
                <span className="navbar-username">{user.nombre}</span>
              </div>
              <button className="navbar-btn-logout" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar-btn-ghost">Iniciar sesión</Link>
              <Link to="/register" className="navbar-btn-accent">Registrarse</Link>
            </>
          )}
        </div>

      </nav>

      {/* Dropdown móvil */}
      {menuAbierto && (
        <div className="navbar-mobile-menu">
          <NavLink to="/torneos" className="mobile-link" onClick={cerrarMenu} end>Torneos</NavLink>
          {user && <NavLink to="/mis-torneos" className="mobile-link" onClick={cerrarMenu}>Mis torneos</NavLink>}
          {user && <NavLink to={`/usuarios/${user.id}`} className="mobile-link" onClick={cerrarMenu}>Perfil</NavLink>}
          {!user && <Link to="/login"    className="mobile-link" onClick={cerrarMenu}>Iniciar sesión</Link>}
          {!user && <Link to="/register" className="mobile-link mobile-link--accent" onClick={cerrarMenu}>Registrarse</Link>}
          {user?.rol === 'admin' && (
            <button className="mobile-link" onClick={() => { abrirPanelAdmin(); cerrarMenu() }}>
              Panel admin
            </button>
          )}
          {user && (
            <button className="mobile-link mobile-link--salir" onClick={handleLogout}>
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </>
  )
}
