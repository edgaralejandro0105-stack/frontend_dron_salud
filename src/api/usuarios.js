import api from './client'

export const getUsuarios = (tipo) =>
  api.get('/usuarios', { params: { tipo } }).then(r => r.data)

export const getUsuario = (id) =>
  api.get(`/usuarios/${id}`).then(r => r.data)

export const updateUsuario = (id, data) =>
  api.put(`/usuarios/${id}`, data).then(r => r.data)

export const updateUsuarioEstado = (id, estado) =>
  api.patch(`/usuarios/${id}/estado`, { estado }).then(r => r.data)

export const removeUsuario = (id) =>
  api.delete(`/usuarios/${id}`).then(r => r.data)
