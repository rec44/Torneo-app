import api from './api'

export const usuarioService = {
  getAll: (params = {}) =>
    api.get('/usuarios', { params }).then(r => r.data),

  getById: (id) =>
    api.get(`/usuarios/${id}`).then(r => r.data),

  update: (id, datos) =>
    api.put(`/usuarios/${id}`, datos).then(r => r.data),

  delete: (id) =>
    api.delete(`/usuarios/${id}`),
}
