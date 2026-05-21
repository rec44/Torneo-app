import api from './api'

export const authService = {
  login: (email, contrasena) =>
    api.post('/login', { email, contrasena }).then(r => r.data),

  register: (nombre, email, contrasena, contrasena_confirmation) =>
    api.post('/register', { nombre, email, contrasena, contrasena_confirmation }).then(r => r.data),

  logout: () =>
    api.post('/logout').then(r => r.data),

  me: () =>
    api.get('/me').then(r => r.data),
}
