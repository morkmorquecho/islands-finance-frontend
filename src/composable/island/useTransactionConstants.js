export const CASH_TYPES = [
  { value: 'deposit', label: 'Ingreso de dinero' },
  { value: 'withdrawal', label: 'Retiro' },
  { value: 'expense', label: 'Gasto' },
]

export const ASSET_TYPES = [
  { value: 'buy', label: 'Compra' },
  { value: 'sell', label: 'Venta' },
]

export const CATEGORIES = [
  { value: 'food', label: 'Comida' },
  { value: 'transport', label: 'Transporte' },
  { value: 'subscriptions', label: 'Suscripciones' },
  { value: 'housing', label: 'Vivienda' },
  { value: 'leisure', label: 'Ocio' },
  { value: 'health', label: 'Salud' },
  { value: 'clothing', label: 'Ropa' },
  { value: 'travel', label: 'Viajes' },
  { value: 'education', label: 'Educación' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'family_events', label: 'Eventos familiares' },
  { value: 'taxes', label: 'Impuestos' },
  { value: 'sport', label: 'Deporte' },
  { value: 'work', label: 'Trabajo' },
  { value: 'other', label: 'Otro' },
]

export const TRANSACTION_LABELS = Object.fromEntries(
  [...CASH_TYPES, ...ASSET_TYPES].map(({ value, label }) => [value, label])
)

export const BASE_CURRENCY = 'MXN'