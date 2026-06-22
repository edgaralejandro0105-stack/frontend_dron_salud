import api from './client'

export const getFarmacias = () =>
  api.get('/farmacias').then(r => r.data)

export const getFarmacia = (id) =>
  api.get(`/farmacias/${id}`).then(r => r.data)

export const createFarmacia = (data) =>
  api.post('/farmacias', data).then(r => r.data)

export const updateFarmacia = (id, data) =>
  api.put(`/farmacias/${id}`, data).then(r => r.data)

export const removeFarmacia = (id) =>
  api.delete(`/farmacias/${id}`).then(r => r.data)
