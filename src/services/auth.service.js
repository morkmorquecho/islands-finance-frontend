// src/services/auth.service.js
import api from './api'

const BASE = '/auth'

export default {
  /**
   * @param {{ username?: string, email?: string, password: string }} credentials
   */
  login(credentials) {
    return api.post(`${BASE}/login/`, credentials)
  },

  logout(refresh) {
    return api.post(`${BASE}/logout/`, { refresh })
  },

  /**
   * @param {{ username: string, email: string, password: string, confirm_password: string }} data
   */
  register(data) {
    return api.post(`${BASE}/register/`, data)
  },

  verifyEmail(token) {
    return api.get(`${BASE}/email/verify/`, { params: { token } })
  },

  resendVerification(email) {
    return api.post(`${BASE}/resend-token/`, { email })
  },

  /**
   * @param {{ current_password: string, new_password: string, confirm_new_password: string }} data
   */
  changePassword(data) {
    return api.post(`${BASE}/password/change/`, data)
  },

  requestPasswordReset(email) {
    return api.post(`${BASE}/password/reset/`, { email })
  },

  /**
   * @param {{ uidb64: string, token: string, new_password: string, confirm_new_password: string }} data
   */
  confirmPasswordReset(data) {
    return api.post(`${BASE}/password/reset/confirm/`, data)
  },

  refreshToken(refresh) {
    return api.post(`${BASE}/token/refresh/`, { refresh })
  },

  verifyToken(token) {
    return api.post(`${BASE}/token/verify/`, { token })
  },

  loginWithGoogle(idToken) {
    return api.post(`${BASE}/oauth/google/`, { id_token: idToken })
  },

  loginWithFacebook(idToken) {
    return api.post(`${BASE}/oauth/facebook/`, { id_token: idToken })
  },
}
