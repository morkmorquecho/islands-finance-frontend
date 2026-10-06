export function formatAmount(value, currency = 'MXN') {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatFrequency(days) {
  const n = Number(days)
  if (!n) return '—'
  if (n === 1) return 'Todos los días'
  if (n === 7) return 'Cada semana'
  if (n === 15) return 'Cada quincena'
  if (n === 30) return 'Cada mes'
  return `Cada ${n} días`
}