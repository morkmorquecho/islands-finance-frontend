export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayLocal() {
  return toLocalDateString(new Date())
}

/** Devuelve un mensaje de error, o '' si la fecha es válida. */
export function validateNotFutureDate(dateStr) {
  if (!dateStr) return 'Selecciona una fecha.'
  if (dateStr > todayLocal()) return 'La fecha no puede ser posterior a hoy.'
  return ''
}