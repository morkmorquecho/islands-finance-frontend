<script setup>
import { ref } from 'vue'
import authService from '@/services/auth.service'

const email = ref('')
const sent = ref(false)
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authService.requestPasswordReset(email.value)
    sent.value = true
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <form v-if="!sent" class="auth-form" @submit.prevent="handleSubmit">
      <h1>Restablecer contraseña</h1>

      <label>
        Correo
        <input v-model="email" type="email" required />
      </label>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
      </button>
    </form>

    <p v-else>Si el correo existe, recibirás instrucciones para continuar.</p>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 4rem 1rem; text-align: center; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 360px; text-align: left; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.error { color: #c0392b; font-size: 0.85rem; }
</style>
