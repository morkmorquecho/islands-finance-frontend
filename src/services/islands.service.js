// src/services/islands.service.js
import api from './api'

const BASE = '/portfolio/islands'

export default {
  /**
   * @param {{ module?: string, kind?: 'cash'|'asset', page?: number }} params
   */
  list(params = {}) {
    return api.get(`${BASE}/`, { params })
  },

  /**
   * @param {{ module: string, template?: string, name: string, kind: 'cash'|'asset', currency?: string, symbol?: string, asset_type?: 'crypto'|'stock', interest_type?: 'simple'|'compound', annual_rate?: string, color?: string }} data
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
