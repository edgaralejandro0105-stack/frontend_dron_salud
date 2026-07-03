import api from './client'

export const getNotifications = (params = {}) =>
  api.get('/notifications', { params }).then(r => r.data)
