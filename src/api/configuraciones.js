import api from './client'

export const getConfiguraciones = () =>
  api.get('/configuraciones').then(r => r.data)

export const getConfiguracion = (clave) =>
  api.get(`/configuraciones/${clave}`).then(r => r.data)

export const updateConfiguracion = (clave, valor, descripcion) =>
  api.put('/configuraciones', { clave, valor, descripcion }).then(r => r.data)
