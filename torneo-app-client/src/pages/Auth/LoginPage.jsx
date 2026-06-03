import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AuthPage.css'

export function LoginPage() {
  const { user, loading: loadingAuth, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/torneos'

  const [form, setForm] = useState({ email: '', contrasena: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  if (!loadingAuth && user) return <Navigate to={redirectTo} replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      await login(form.email, form.contrasena)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        'Error al iniciar sesión.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pag-auth">
      <div className="tarjeta-auth">
        <div className="tarjeta-auth-cabecera">
          <h2>Iniciar sesión</h2>
        </div>

        {error && <div className="error-general-auth">{error}</div>}

        <form className="formulario-auth" onSubmit={handleSubmit} noValidate>
          <div className="campo-auth">
            <label htmlFor="email" className="etiqueta-auth">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="entrada-auth"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="campo-auth">
            <label htmlFor="contrasena" className="etiqueta-auth">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              className="entrada-auth"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-auth-enviar" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-pie">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
