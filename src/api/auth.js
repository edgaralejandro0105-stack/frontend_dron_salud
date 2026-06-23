import api from './client'

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const register = (userData) =>
  api.post('/auth/register', userData).then(r => r.data)

export const getProfile = () =>
  api.get('/auth/profile').then(r => r.data)

export const changePassword = (currentPassword, newPassword) =>
  api.patch('/auth/password', { currentPassword, newPassword }).then(r => r.data)

export const updateProfile = (data) =>
  api.put('/auth/profile', data).then(r => r.data)
