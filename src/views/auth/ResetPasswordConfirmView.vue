<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

const form = ref({ new_password: '', confirm_new_password: '' })
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authService.confirmPasswordReset({
      uidb64: route.query.uidb64,
      token: route.query.token,
      ...form.value,
    })
    router.push({ name: 'login' })
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
      <h1>Nueva contraseña</h1>

      <label>
        Nueva contraseña
        <input v-model="form.new_password" type="password" required minlength="6" />
      </label>

      <label>
        Confirmar nueva contraseña
        <input v-model="form.confirm_new_password" type="password" required minlength="6" />
      </label>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 4rem 1rem; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 360px; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.error { color: #c0392b; font-size: 0.85rem; }
</style>
