// src/services/marketData.service.js
import api from './api'

// Igual que goals y transactions, el schema documenta doble slash aqui.
const BASE = '/market-data'

export default {
  /**
   * Busca activos financieros (crypto vía CoinGecko, stock vía Twelve Data).
   * @param {{ assetType: 'crypto'|'stock', q: string }} params
   */
  searchAssets({ assetType, q }) {
    return api.get(`${BASE}/assets/search/`, {
      params: { asset_type: assetType, q },
    })
  },
}
