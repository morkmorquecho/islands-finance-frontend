// src/services/islandTemplates.service.js
import api from './api'

const BASE = '/portfolio/island-templates'

export default {
  /**
   * Catálogo de solo lectura, administrado desde Django Admin.
   * @param {{ kind?: 'cash'|'asset', search?: string, page?: number }} params
   */
  list(params = {}) {
    return api.get(`${BASE}/`, { params })
  },

  retrieve(id) {
    return api.get(`${BASE}/${id}/`)
  },
}
