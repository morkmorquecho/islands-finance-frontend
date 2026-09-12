// src/types/island-form.ts

export interface IslandFieldsModel {
  template: string
  name: string
  kind: 'cash' | 'asset'
  currency: string
  symbol: string
  asset_type: 'crypto' | 'stock'
  interest_type: '' | 'simple' | 'compound'
  annual_rate: string
  color: string
}

export function createEmptyIslandFields(): IslandFieldsModel {
  return {
    template: '',
    name: '',
    kind: 'cash',
    currency: 'MXN',
    symbol: '',
    asset_type: 'crypto',
    interest_type: '',
    annual_rate: '',
    color: '#2FB8A6',
  }
}

/**
 * Arma el payload final para POST /api/v1/portfolio/islands/, quitando
 * los campos que no aplican según el tipo de isla (cash vs asset).
 */
export function buildIslandPayload(fields: IslandFieldsModel, moduleId: string): Record<string, any> {
  const payload: Record<string, any> = { ...fields, module: moduleId }

  if (!payload.template) delete payload.template

  if (payload.kind === 'cash') {
    delete payload.symbol
    delete payload.asset_type
  } else {
    delete payload.currency
    delete payload.interest_type
    delete payload.annual_rate
  }

  if (!payload.interest_type) delete payload.interest_type
  if (!payload.annual_rate) delete payload.annual_rate

  return payload
}
