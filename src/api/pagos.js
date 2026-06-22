import api from './client'

export const getPagos = (params = {}) =>
  api.get('/pagos', { params }).then(r => r.data)

export const createPago = (data) =>
  api.post('/pagos', data).then(r => r.data)

export const confirmarPago = (id) =>
  api.patch(`/pagos/${id}/confirmar`).then(r => r.data)
