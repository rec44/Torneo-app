import api from './api'

export const torneoService = {
  getAll: (params = {}) =>
    api.get('/torneos', { params }).then(r => r.data),

  getMisTorneos: () =>
    api.get('/mis-torneos').then(r => r.data),

  getById: (id) =>
    api.get(`/torneos/${id}`).then(r => r.data),

  create: (datos) =>
    api.post('/torneos', datos).then(r => r.data),

  update: (id, datos) =>
    api.put(`/torneos/${id}`, datos).then(r => r.data),

  delete: (id) =>
    api.delete(`/torneos/${id}`),

  unirse: (id) =>
    api.post(`/torneos/${id}/unirse`).then(r => r.data),

  iniciar: (id) =>
    api.post(`/torneos/${id}/iniciar`).then(r => r.data),

  crearInvitacion: (id, datos) =>
    api.post(`/torneos/${id}/invitacion`, datos).then(r => r.data),

  unirsePorCodigo: (codigo) =>
    api.post('/torneos/unirse-codigo', { codigo }).then(r => r.data),
}
