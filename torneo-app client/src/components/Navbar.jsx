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
        TorneoApp
      </NavLink>

      <div className="navbar-links">
        <NavLink
          to="/torneos"
          className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link--active' : '')}
          end
        >
          Torneos
        </NavLink>
      </div>

      <div className="navbar-user">
        {user ? (
          <>
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
