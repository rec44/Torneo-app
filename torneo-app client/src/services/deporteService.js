import api from './api'

export const deporteService = {
  getAll: () =>
    api.get('/deportes').then(r => r.data),

  getById: (id) =>
    api.get(`/deportes/${id}`).then(r => r.data),

  create: (datos) =>
    api.post('/deportes', datos).then(r => r.data),

  update: (id, datos) =>
    api.put(`/deportes/${id}`, datos).then(r => r.data),

  delete: (id) =>
    api.delete(`/deportes/${id}`),
}
