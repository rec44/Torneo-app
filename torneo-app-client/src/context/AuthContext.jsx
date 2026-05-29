import { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    authService.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, contrasena) => {
    const data = await authService.login(email, contrasena)
    localStorage.setItem('token', data.token)
    setUser(data.usuario)
    return data
  }

  const register = async (nombre, email, contrasena, contrasena_confirmation) => {
    const data = await authService.register(nombre, email, contrasena, contrasena_confirmation)
    localStorage.setItem('token', data.token)
    setUser(data.usuario)
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const esAdmin = user?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, esAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
