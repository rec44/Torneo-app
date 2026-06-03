import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AuthPage.css'

export function RegisterPage() {
  const { user, loading: loadingAuth, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/torneos'

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    contrasena_confirmation: '',
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [cargando, setCargando] = useState(false)

  if (!loadingAuth && user) return <Navigate to={redirectTo} replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }))
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim())
      errs.nombre = ['El nombre es obligatorio.']
    else if (form.nombre.trim().length > 255)
      errs.nombre = ['El nombre no puede superar los 255 caracteres.']

    if (!form.email.trim())
      errs.email = ['El email es obligatorio.']
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = ['El email no tiene un formato válido.']

    if (!form.contrasena)
      errs.contrasena = ['La contraseña es obligatoria.']
    else if (form.contrasena.length < 8)
      errs.contrasena = ['La contraseña debe tener al menos 8 caracteres.']
    else if (form.contrasena !== form.contrasena_confirmation)
      errs.contrasena = ['Las contraseñas no coinciden.']

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length > 0) {
      setErrores(errs)
      return
    }
    setCargando(true)
    setErrores({})
    setErrorGeneral(null)
    try {
      await register(form.nombre, form.email, form.contrasena, form.contrasena_confirmation)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrores(err.response.data.errors)
      } else {
        setErrorGeneral(err.response?.data?.message ?? 'Error al crear la cuenta.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pag-auth">
      <div className="tarjeta-auth">
        <div className="tarjeta-auth-cabecera">
          <h2>Crear cuenta</h2>
        </div>

        {errorGeneral && <div className="error-general-auth">{errorGeneral}</div>}

        <form className="formulario-auth" onSubmit={handleSubmit} noValidate>
          <div className="campo-auth">
            <label htmlFor="nombre" className="etiqueta-auth">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className={'entrada-auth' + (errores.nombre ? ' entrada-auth--error' : '')}
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
            {errores.nombre && <p className="campo-auth-error">{errores.nombre[0]}</p>}
          </div>

          <div className="campo-auth">
            <label htmlFor="email" className="etiqueta-auth">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={'entrada-auth' + (errores.email ? ' entrada-auth--error' : '')}
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
            {errores.email && <p className="campo-auth-error">{errores.email[0]}</p>}
          </div>

          <div className="campo-auth">
            <label htmlFor="contrasena" className="etiqueta-auth">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              className={'entrada-auth' + (errores.contrasena ? ' entrada-auth--error' : '')}
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            {errores.contrasena && <p className="campo-auth-error">{errores.contrasena[0]}</p>}
          </div>

          <div className="campo-auth">
            <label htmlFor="contrasena_confirmation" className="etiqueta-auth">Confirmar contraseña</label>
            <input
              id="contrasena_confirmation"
              name="contrasena_confirmation"
              type="password"
              className="entrada-auth"
              value={form.contrasena_confirmation}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn-auth-enviar" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-pie">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
