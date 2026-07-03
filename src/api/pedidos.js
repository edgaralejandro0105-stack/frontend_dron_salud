import api from './client'

export const getPedidos = (params = {}) =>
  api.get('/pedidos', { params }).then(r => r.data)

export const getPedido = (id) =>
  api.get(`/pedidos/${id}`).then(r => r.data)

export const createPedido = (data) =>
  api.post('/pedidos', data).then(r => r.data)

export const updateEstado = (id, estado_pedido) =>
  api.patch(`/pedidos/${id}/estado`, { estado_pedido }).then(r => r.data)

export const asignarDronOperador = (id, data) =>
  api.post(`/pedidos/${id}/asignar`, data).then(r => r.data)

export const liberarPedido = (id) =>
  api.post(`/pedidos/${id}/liberar`).then(r => r.data)
