import api from './api'

export const partidoService = {
  getAll: (params = {}) =>
    api.get('/partidos', { params }).then(r => r.data),

  getById: (id) =>
    api.get(`/partidos/${id}`).then(r => r.data),

  update: (id, datos) =>
    api.put(`/partidos/${id}`, datos).then(r => r.data),

  delete: (id) =>
    api.delete(`/partidos/${id}`),

  registrarResultado: (id, datos) =>
    api.patch(`/partidos/${id}/resultado`, datos).then(r => r.data),
}
