import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const inputBase = 'w-full px-3 py-[10px] text-[15px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-bg border border-skin-border rounded-lg transition-all placeholder:text-skin-text/60 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]'
const inputError = 'border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'

export function RegisterPage() {
  const { user, loading: loadingAuth, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/torneos'

  const [form, setForm] = useState({
    nombre: '', email: '', contrasena: '', contrasena_confirmation: '',
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
    if (Object.keys(errs).length > 0) { setErrores(errs); return }
    setCargando(true)
    setErrores({})
    setErrorGeneral(null)
    try {
      await register(form.nombre, form.email, form.contrasena, form.contrasena_confirmation)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.response?.data?.errors) setErrores(err.response.data.errors)
      else setErrorGeneral(err.response?.data?.message ?? 'Error al crear la cuenta.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] border border-skin-border rounded-2xl px-8 py-9 text-left max-[480px]:px-5 max-[480px]:py-7">

        <div className="mb-7">
          <h2 className="text-2xl font-semibold text-skin-heading m-0">Crear cuenta</h2>
        </div>

        {errorGeneral && (
          <div className="px-[14px] py-[10px] mb-4 text-[14px] text-red-600 bg-red-500/8 border border-red-500/20 rounded-lg">
            {errorGeneral}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {[
            { id: 'nombre',                 label: 'Nombre',              type: 'text',     placeholder: 'Tu nombre',          auto: 'name' },
            { id: 'email',                  label: 'Email',               type: 'email',    placeholder: 'tu@email.com',       auto: 'email' },
            { id: 'contrasena',             label: 'Contraseña',          type: 'password', placeholder: 'Mínimo 8 caracteres',auto: 'new-password' },
            { id: 'contrasena_confirmation',label: 'Confirmar contraseña',type: 'password', placeholder: 'Repite tu contraseña',auto: 'new-password' },
          ].map(({ id, label, type, placeholder, auto }) => (
            <div key={id} className="flex flex-col gap-[6px]">
              <label htmlFor={id} className="text-[14px] font-medium text-skin-heading">{label}</label>
              <input
                id={id} name={id} type={type}
                className={`${inputBase} ${errores[id] ? inputError : ''}`}
                value={form[id]} onChange={handleChange}
                placeholder={placeholder} autoComplete={auto}
              />
              {errores[id] && (
                <p className="text-[13px] text-red-600 m-0">{errores[id][0]}</p>
              )}
            </div>
          ))}

          <button
            type="submit" disabled={cargando}
            className="w-full mt-1 py-[11px] text-[15px] font-semibold text-white bg-accent border-none rounded-lg cursor-pointer transition-all hover:enabled:opacity-90 disabled:opacity-60 disabled:cursor-default focus-ring"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-5 text-center text-[14px] text-skin-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent no-underline font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
