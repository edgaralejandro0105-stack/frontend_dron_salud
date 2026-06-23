import api from './client'

export const getDirecciones = () =>
  api.get('/direcciones').then(r => r.data)

export const createDireccion = (data) =>
  api.post('/direcciones', data).then(r => r.data)

export const deleteDireccion = (id) =>
  api.delete(`/direcciones/${id}`).then(r => r.data)
