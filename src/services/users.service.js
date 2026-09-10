// src/services/users.service.js
import api from './api'

const BASE = '/users'

export default {
  /**
   * Solicita el cambio de correo del usuario autenticado.
   * El correo de verificación llega al correo NUEVO.
   * @param {{ email: string, password: string }} data
   */
  requestEmailChange(data) {
    return api.post(`${BASE}/me/email/request-change`, data)
  },
}
