<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()
const form = ref({ username: '', email: '', password: '', confirm_password: '' })
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    await authService.register(form.value)
    successMsg.value = 'Cuenta creada. Revisa tu correo para verificarla.'
    setTimeout(() => router.push({ name: 'login' }), 2000)
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-form" @submit.prevent="handleSubmit">
      <h1>Crear cuenta</h1>

      <label>
        Usuario
        <input v-model="form.username" type="text" required />
      </label>

      <label>
        Correo
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Contraseña
        <input v-model="form.password" type="password" required />
      </label>

      <label>
        Confirmar contraseña
        <input v-model="form.confirm_password" type="password" required />
      </label>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Registrarme' }}
      </button>

      <router-link :to="{ name: 'login' }">Ya tengo cuenta</router-link>
    </form>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 4rem 1rem; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 360px; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #c0392b; font-size: 0.85rem; }
.success { color: #1f8a4c; font-size: 0.85rem; }
</style>
