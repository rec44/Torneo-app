import api from './api'

export const equipoService = {
  getByTorneo: (torneoId) =>
    api.get(`/torneos/${torneoId}/equipos`).then(r => r.data),

  getById: (torneoId, equipoId) =>
    api.get(`/torneos/${torneoId}/equipos/${equipoId}`).then(r => r.data),

  create: (torneoId, datos) =>
    api.post(`/torneos/${torneoId}/equipos`, datos).then(r => r.data),

  unirse: (torneoId, equipoId) =>
    api.post(`/torneos/${torneoId}/equipos/${equipoId}/unirse`).then(r => r.data),

  getInvitacion: (torneoId, equipoId) =>
    api.get(`/torneos/${torneoId}/equipos/${equipoId}/invitacion`).then(r => r.data ?? null).catch(() => null),

  getInvitacionInfo: (codigo) =>
    api.get(`/invitaciones/${codigo}`).then(r => r.data),

  crearInvitacion: (torneoId, equipoId, datos) =>
    api.post(`/torneos/${torneoId}/equipos/${equipoId}/invitacion`, datos).then(r => r.data),

  update: (torneoId, equipoId, datos) =>
    api.patch(`/torneos/${torneoId}/equipos/${equipoId}`, datos).then(r => r.data),

  eliminar: (torneoId, equipoId) =>
    api.delete(`/torneos/${torneoId}/equipos/${equipoId}`),

  expulsarMiembro: (torneoId, equipoId, usuarioId) =>
    api.delete(`/torneos/${torneoId}/equipos/${equipoId}/miembros/${usuarioId}`).then(r => r.data),

  toggleLock: (torneoId, equipoId) =>
    api.patch(`/torneos/${torneoId}/equipos/${equipoId}/lock`).then(r => r.data),

  unirsePorCodigo: (codigo) =>
    api.post('/equipos/unirse-codigo', { codigo }).then(r => r.data),
}
