<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const status = ref('loading') // loading | success | error
const errorMsg = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    status.value = 'error'
    errorMsg.value = 'Falta el token de verificación.'
    return
  }
  try {
    await authService.verifyEmail(token)
    status.value = 'success'
    setTimeout(() => router.push({ name: 'login' }), 2500)
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message
  }
})
</script>

<template>
  <div class="status-page">
    <p v-if="status === 'loading'">Verificando tu cuenta...</p>
    <p v-else-if="status === 'success'">Cuenta verificada. Redirigiendo a inicio de sesión...</p>
    <p v-else class="error">{{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.status-page { display: flex; justify-content: center; padding: 4rem 1rem; text-align: center; }
.error { color: #c0392b; }
</style>
