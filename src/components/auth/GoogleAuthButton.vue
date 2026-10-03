<template>
  <div class="form-social-group">
    <div class="google-btn-wrapper">
      <div
        ref="googleButtonRef"
        class="google-button-container"
        :class="{ 'is-hidden': hidden }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // 'signup_with' | 'signin_with' | 'continue_with' | 'signin'
  text: { type: String, default: 'signup_with' },
  theme: { type: String, default: 'outline' },
  size: { type: String, default: 'medium' },
  shape: { type: String, default: 'pill' },
  locale: { type: String, default: 'es' },
  // Tiempo antes de que el botón sea visible (ms)
  delay: { type: Number, default: 1500 },
})

// success → { credential }   error → string con el mensaje
const emit = defineEmits(['success', 'error'])

const googleButtonRef = ref(null)
const hidden = ref(true)
let timeoutId = null

function handleCredential({ credential, error }) {
  if (error || !credential) {
    emit('error', 'No se pudo conectar con Google')
    return
  }
  emit('success', credential)
}

onMounted(() => {
  if (!window.google?.accounts?.id) {
    emit('error', 'El SDK de Google no está disponible')
    return
  }

  // Se inicializa y renderiza de inmediato (invisible)
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleCredential,
  })

  window.google.accounts.id.renderButton(googleButtonRef.value, {
    theme: props.theme,
    size: props.size,
    shape: props.shape,
    text: props.text,
    locale: props.locale,
  })

  // Pasado el delay, se revela con fade-in
  timeoutId = setTimeout(() => {
    hidden.value = false
  }, props.delay)
})

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.google-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-left: 1.8rem;
}

.google-button-container {
  display: flex;
  justify-content: center;
  min-width: 280px;
  max-width: 400px;
  width: 100%;
  transform: scale(1.05);
  opacity: 1;
  visibility: visible;
  transition:
    transform 0.2s ease,
    opacity 0.6s ease,
    visibility 0.6s ease;
}

.google-button-container:hover {
  transform: scale(1.08);
}

/* Invisible e inclickeable, pero ocupa su espacio (sin saltos de layout)
   y el botón de Google se sigue renderizando por dentro */
.google-button-container.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.google-button-container :deep(iframe) {
  width: 100% !important;
  min-width: 280px !important;
}

@media (max-width: 768px) {
  .google-btn-wrapper {
    justify-content: flex-start;
    margin-left: 1.5rem;
  }

  .google-button-container,
  .google-button-container:hover {
    transform: scale(1);
    min-width: auto;
  }

  .google-button-container :deep(iframe) {
    min-width: auto !important;
    width: auto !important;
  }
}
</style>