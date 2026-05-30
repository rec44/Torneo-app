import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/torneos')
  }

  return (
    <nav className="navbar">
      <NavLink to="/torneos" className="navbar-brand">
        RiseCup
      </NavLink>

      <div className="navbar-links">
        <NavLink
          to="/torneos"
          className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')}
          end
        >
          Torneos
        </NavLink>
        {user && (
          <NavLink
            to="/perfil"
            className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')}
          >
            Perfil
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        {user ? (
          <>
            {user.rol === 'admin' && (
              <a
                href={`http://localhost:8000/admin/auth?token=${localStorage.getItem('token') ?? ''}`}
                className="navbar-btn-admin"
                target="_blank"
                rel="noreferrer"
              >
                Admin
              </a>
            )}
            <span className="navbar-username">{user.nombre}</span>
            <button className="navbar-btn-logout" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn-ghost">
              Iniciar sesión
            </Link>
            <Link to="/register" className="navbar-btn-accent">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
