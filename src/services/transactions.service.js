// src/services/transactions.service.js
import api from './api'

// Igual que goals y market-data, el schema documenta doble slash aqui.
const BASE = '/transactions'

export default {
  /**
   * @param {{ island?: string, type?: string, category?: string, date__gte?: string, date__lte?: string, ordering?: string, page?: number }} params
   */
  list(params = {}) {
    return api.get(`${BASE}/`, { params })
  },

  /**
   * Islas cash: requieren `amount`. Islas asset: requieren `quantity` y `price_at_tx`.
   * @param {{ island: string, type: string, date: string, amount?: string, quantity?: string, price_at_tx?: string, category?: string, note?: string }} data
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
