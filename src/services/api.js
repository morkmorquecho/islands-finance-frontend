// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const MANY_REQUESTS_MESSAGE =
  'Has excedido el número de intentos permitidos. Intenta nuevamente más tarde.'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  '/auth/login/',
  '/auth/register/',
  '/auth/token/refresh/',
  '/auth/oauth/google/',
  '/auth/oauth/facebook/',
]

function isAuthEndpointWithoutRefresh(url) {
  return AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => url?.includes(path))
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function isTokenExpiringSoon(token, secondsBefore = 60) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now() + secondsBefore * 1000
  } catch {
    return true
  }
}

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  failedQueue = []
}

function normalizeFieldErrors(context) {
  if (!context || typeof context !== 'object') return context

  const normalized = {}
  for (const key in context) {
    const value = context[key]
    normalized[key] = Array.isArray(value) ? value : typeof value === 'string' ? [value] : value
  }
  return normalized
}

function resolveErrorType(context) {
  if (typeof context === 'string' && context.length > 0) return 'message_error'

  if (typeof context === 'object' && context !== null) {
    const keys = Object.keys(context)
    // {detail: "..."} es un mensaje único; {detail: {campo: [...]}} son
    // errores de un serializer (DRF los envuelve así en ValidationError)
    if (keys.length === 1 && keys[0] === 'detail') {
      return typeof context.detail === 'string' ? 'message_error' : 'field_errors'
    }
    if (keys.length > 0) return 'field_errors'
  }

  return 'unknown'
}

function createApiError(responseData) {
  const rawContext = responseData.errors?.context ?? {}
  const type = resolveErrorType(rawContext)

  const isDetailMessage =
    type === 'message_error' && typeof rawContext === 'object' && rawContext !== null

  // Cuando el error viene envuelto como {detail: {campo: [...]}} (serializer
  // de DRF), los errores de campo reales están un nivel más adentro.
  const isWrappedDetail =
    type === 'field_errors' &&
    typeof rawContext === 'object' &&
    rawContext !== null &&
    Object.keys(rawContext).length === 1 &&
    'detail' in rawContext &&
    typeof rawContext.detail === 'object' &&
    rawContext.detail !== null

  const fieldSource = isWrappedDetail ? rawContext.detail : rawContext

  const context = type === 'field_errors' ? normalizeFieldErrors(fieldSource) : {}

  const message =
    responseData.message ||
    (typeof rawContext === 'string'
      ? rawContext
      : isDetailMessage
        ? rawContext.detail
        : 'Error inesperado')

  const error = new Error(message)
  error.errors = responseData.errors
  error.code = responseData.errors?.code || null
  error.source = responseData.errors?.source || null
  error.context = context
  error.type = type

  return error
}

function isFormattedApiError(response) {
  return response?.data?.success === false
}

function createDetailError(data) {
  const message = data?.detail || data?.message
  if (!message) return null
  return new Error(typeof message === 'string' ? message : 'Error inesperado')
}

async function doRefresh(authStore) {
  const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/token/refresh/`, {
    refresh: authStore.refreshToken,
  })
  const { access, refresh } = data.data
  // El store expone setSession({ access, refresh, user }), no setTokens(access, refresh).
  // Si el backend no rota el refresh token (ROTATE_REFRESH_TOKENS=False en SIMPLE_JWT),
  // 'refresh' viene undefined: conservamos el que ya teníamos para no perderlo.
  authStore.setSession({ access, refresh: refresh ?? authStore.refreshToken })
  return access
}

// ── INTERCEPTORS ─────────────────────────────────────────────────────────────
export function setupInterceptors(pinia) {
  const authStore = useAuthStore(pinia)
  const uiStore = useUIStore(pinia)

  // ── REQUEST ──────────────────────────────────────────────────────────────
  api.interceptors.request.use(
    async (config) => {
      let token = authStore.accessToken

      if (token && authStore.refreshToken && isTokenExpiringSoon(token, 60)) {
        if (isRefreshing) {
          token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
        } else {
          isRefreshing = true
          try {
            token = await doRefresh(authStore)
            processQueue(null, token)
          } catch (err) {
            processQueue(err, null)
            authStore.clearSession()
            const { default: router } = await import('@/router')
            router.push({ name: 'login' })
            return Promise.reject(err)
          } finally {
            isRefreshing = false
          }
        }
      }

      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error),
  )

  // ── RESPONSE ─────────────────────────────────────────────────────────────
  api.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'blob') {
        return response
      }

      if (response.status === 204 || response.status === 304 || !response.data) {
        return null
      }

      const { success, data, errors, message } = response.data
      if (!success) {
        return Promise.reject(createApiError({ success, errors, message }))
      }
      return data
    },

    async (error) => {
      const { response, config: originalRequest } = error

      if (response?.status === 429) {
        uiStore.showModal(MANY_REQUESTS_MESSAGE)
        return Promise.reject(
          createApiError({
            success: false,
            message: MANY_REQUESTS_MESSAGE,
            errors: { code: 'RATE_LIMIT_EXCEEDED', context: MANY_REQUESTS_MESSAGE },
          }),
        )
      }

      // ── 401: intentar refresh SIEMPRE primero, antes de tocar el body ────
      // (incluye requests con responseType: 'blob' — si no, un token
      // expirado en una descarga nunca dispara el refresh)
        if (
          response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpointWithoutRefresh(originalRequest.url)) 
          {
            if (!authStore.refreshToken) {
            authStore.clearSession()
            const { default: router } = await import('@/router')
            router.push({ name: 'login' })
            return Promise.reject(error)
          }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const token = await doRefresh(authStore)
          processQueue(null, token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          authStore.clearSession()
          const { default: router } = await import('@/router')
          router.push({ name: 'login' })
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Si pedimos blob pero el backend respondió un error (no 401), axios igual
      // envuelve el body como Blob. Hay que leerlo como texto y parsear
      // el JSON real antes de poder formatear el error.
      if (originalRequest?.responseType === 'blob' && response?.data instanceof Blob) {
        try {
          const text = await response.data.text()
          const parsed = JSON.parse(text)
          if (parsed?.success === false) return Promise.reject(createApiError(parsed))
          const detailError = createDetailError(parsed)
          if (detailError) return Promise.reject(detailError)
        } catch {
          // el blob no era JSON parseable; cae al manejo genérico de abajo
        }
      }

      // Cualquier otro error formateado por la API (400, 403, 404, 500, etc.)
      if (isFormattedApiError(response)) {
        return Promise.reject(createApiError(response.data))
      }

      const detailError = createDetailError(response?.data)
      if (detailError) return Promise.reject(detailError)

      // Error de red, timeout, CORS, etc. (sin response del servidor)
      return Promise.reject(error)
    },
  )
}

export default api