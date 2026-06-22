import api from './client'

export const getProductos = (params = {}) =>
  api.get('/productos', { params }).then(r => r.data)

export const getProducto = (id) =>
  api.get(`/productos/${id}`).then(r => r.data)

export const createProducto = (data) =>
  api.post('/productos', data).then(r => r.data)

export const updateProducto = (id, data) =>
  api.put(`/productos/${id}`, data).then(r => r.data)

export const removeProducto = (id) =>
  api.delete(`/productos/${id}`).then(r => r.data)
