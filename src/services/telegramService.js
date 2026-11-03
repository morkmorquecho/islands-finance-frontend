// src/services/telegramService.js
import api from './api'

export const telegramService = {
  // { linked: false } o { linked: true, telegram_username, default_island }
  getLink: () => api.get('/telegram/link/'),

  // { code, expires_in, deep_link }
  createLinkCode: () => api.post('/telegram/link-code/'),

  // Responde 204 sin cuerpo (tu interceptor lo convierte en null)
  unlink: () => api.delete('/telegram/link/'),
}