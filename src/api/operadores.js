import api from './client'

export const getOperadores = () =>
  api.get('/operadores').then(r => r.data)

export const getOperador = (id) =>
  api.get(`/operadores/${id}`).then(r => r.data)

export const createOperador = (data) =>
  api.post('/operadores', data).then(r => r.data)

export const updateOperador = (id, data) =>
  api.put(`/operadores/${id}`, data).then(r => r.data)

export const removeOperador = (id) =>
  api.delete(`/operadores/${id}`).then(r => r.data)
