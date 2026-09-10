// src/services/goals.service.js
import api from './api'

// El schema documenta este recurso con doble slash: /api/v1//goals/
// (probablemente por como esta registrado el router vacio en el backend).
// Se respeta tal cual para que coincida con las rutas reales expuestas.
const BASE = '/goals'

export default {
  /**
   * @param {{ active?: boolean, island?: number, page?: number }} params
   */
  list(params = {}) {
    return api.get(`${BASE}/`, { params })
  },

  /**
   * @param {{ island: number, target_amount: string, frequency_days: number, start_date: string, active?: boolean }} data
   */
  create(data) {
    return api.post(`${BASE}/`, data)
  },

  retrieve(id) {
    return api.get(`${BASE}/${id}/`)
  },

  update(id, data) {
    return api.put(`${BASE}/${id}/`, data)
  },

  partialUpdate(id, data) {
    return api.patch(`${BASE}/${id}/`, data)
  },

  destroy(id) {
    return api.delete(`${BASE}/${id}/`)
  },

  getCompletions(id) {
    return api.get(`${BASE}/${id}/completions/`)
  },

  /**
   * @param {number|string} id
   * @param {{ expected_date: string, transaction_id?: number, actual_amount?: number }} data
   */
  markCompletion(id, data) {
    return api.post(`${BASE}/${id}/completions/mark/`, data)
  },
}
