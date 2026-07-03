import api from './client'

export const getDrones = () =>
  api.get('/drones').then(r => r.data)

export const getDronesDisponibles = () =>
  api.get('/drones/disponibles').then(r => r.data)

export const getDron = (id) =>
  api.get(`/drones/${id}`).then(r => r.data)

export const createDron = (data) =>
  api.post('/drones', data).then(r => r.data)

export const updateDron = (id, data) =>
  api.put(`/drones/${id}`, data).then(r => r.data)

export const removeDron = (id) =>
  api.delete(`/drones/${id}`).then(r => r.data)

export const getDronHistorial = (id) =>
  api.get(`/drones/${id}/historial`).then(r => r.data)

export const getMantenimientosByDron = (id_dron) =>
  api.get(`/mantenimiento/dron/${id_dron}`).then(r => r.data)

export const createMantenimiento = (data) =>
  api.post('/mantenimiento', data).then(r => r.data)

export const completarMantenimiento = (id) =>
  api.patch(`/mantenimiento/${id}/completar`).then(r => r.data)
