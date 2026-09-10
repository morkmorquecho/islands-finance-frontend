// src/services/modules.service.js
import api from './api'

const BASE = '/portfolio/modules'

export default {
  list(params = {}) {
    return api.get(`${BASE}/`, { params })
  },

  /**
   * @param {{ name: string, type: string, order?: number }} data
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
}
