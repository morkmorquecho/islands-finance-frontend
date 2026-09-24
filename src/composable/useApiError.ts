// src/composables/useApiError.ts
import { reactive, ref } from 'vue'

export type FieldErrors = Record<string, string[]>

export function useApiError() {
  const errorMessage = ref('')
  const fieldErrors = reactive<FieldErrors>({})
  const code = ref<string | null>(null)
  const retryAfterSeconds = ref<number | null>(null)

  function reset() {
    errorMessage.value = ''
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    code.value = null
    retryAfterSeconds.value = null
  }

  function handle(err: unknown) {
    reset()

    if (!(err instanceof Error)) {
      errorMessage.value = 'Ocurrió un error inesperado.'
      return
    }

    const apiErr = err as Error & {
      code?: string | null
      type?: 'field_errors' | 'message_error' | 'unknown'
      context?: unknown
    }

    code.value = apiErr.code ?? null

    if (apiErr.code === 'RATE_LIMIT_EXCEEDED') {
      const ctx = apiErr.context as { message?: string; retry_after_seconds?: number } | undefined
      retryAfterSeconds.value = ctx?.retry_after_seconds ?? null
      errorMessage.value = ctx?.message || apiErr.message
      return
    }

    if (apiErr.type === 'field_errors') {
      Object.assign(fieldErrors, apiErr.context as FieldErrors)
      return
    }

    errorMessage.value = apiErr.message || 'Ocurrió un error inesperado.'
  }

  return { errorMessage, fieldErrors, code, retryAfterSeconds, handle, reset }
}