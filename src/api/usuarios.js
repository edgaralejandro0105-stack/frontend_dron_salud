import api from './client'

export const getUsuarios = ({ tipo, search, page, limit } = {}) =>
  api.get('/usuarios', { params: { tipo, search, page, limit } }).then(r => r.data)

export const getUsuario = (id) =>
  api.get(`/usuarios/${id}`).then(r => r.data)

export const updateUsuario = (id, data) =>
  api.put(`/usuarios/${id}`, data).then(r => r.data)

export const updateUsuarioEstado = (id, estado, motivo_suspension = '') =>
  api.patch(`/usuarios/${id}/estado`, { estado, motivo_suspension }).then(r => r.data)

export const removeUsuario = (id) =>
  api.delete(`/usuarios/${id}`).then(r => r.data)

export const getSuspensionesByUsuario = (id) =>
  api.get(`/suspensiones/usuario/${id}`).then(r => r.data)

export const getSuspensionActiva = (id) =>
  api.get(`/suspensiones/usuario/${id}/activa`).then(r => r.data)
