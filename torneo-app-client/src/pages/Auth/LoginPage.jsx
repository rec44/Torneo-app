import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

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
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] border border-skin-border rounded-2xl px-8 py-9 text-left max-[480px]:px-5 max-[480px]:py-7">

        <div className="mb-7">
          <h2 className="text-2xl font-semibold text-skin-heading m-0">Iniciar sesión</h2>
        </div>

        {error && (
          <div className="px-[14px] py-[10px] mb-4 text-[14px] text-red-600 bg-red-500/8 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="email" className="text-[14px] font-medium text-skin-heading">Email</label>
            <input
              id="email" name="email" type="email"
              className="w-full px-3 py-[10px] text-[15px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-bg border border-skin-border rounded-lg transition-all placeholder:text-skin-text/60 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]"
              value={form.email} onChange={handleChange}
              placeholder="tu@email.com" autoComplete="email" required
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label htmlFor="contrasena" className="text-[14px] font-medium text-skin-heading">Contraseña</label>
            <input
              id="contrasena" name="contrasena" type="password"
              className="w-full px-3 py-[10px] text-[15px] font-[family-name:var(--font-family-sans)] text-skin-heading bg-skin-bg border border-skin-border rounded-lg transition-all placeholder:text-skin-text/60 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)]"
              value={form.contrasena} onChange={handleChange}
              placeholder="••••••••" autoComplete="current-password" required
            />
          </div>

          <button
            type="submit" disabled={cargando}
            className="w-full mt-1 py-[11px] text-[15px] font-semibold text-white bg-accent border-none rounded-lg cursor-pointer transition-all hover:enabled:opacity-90 hover:enabled:shadow-[0_4px_14px_var(--color-accent-muted)] disabled:opacity-60 disabled:cursor-default focus-ring"
          >
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-5 text-center text-[14px] text-skin-text">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-accent no-underline font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
