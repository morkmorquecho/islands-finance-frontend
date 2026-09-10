<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/auth.service'
import usersService from '@/services/users.service'

const router = useRouter()
const auth = useAuthStore()

const pwForm = ref({ current_password: '', new_password: '', confirm_new_password: '' })
const pwMsg = ref('')
const pwLoading = ref(false)

const emailForm = ref({ email: '', password: '' })
const emailMsg = ref('')
const emailLoading = ref(false)

async function changePassword() {
  pwMsg.value = ''
  pwLoading.value = true
  try {
    await authService.changePassword(pwForm.value)
    pwMsg.value = 'Contraseña actualizada.'
    pwForm.value = { current_password: '', new_password: '', confirm_new_password: '' }
  } catch (err) {
    pwMsg.value = err.message
  } finally {
    pwLoading.value = false
  }
}

async function requestEmailChange() {
  emailMsg.value = ''
  emailLoading.value = true
  try {
    await usersService.requestEmailChange(emailForm.value)
    emailMsg.value = 'Revisa tu nuevo correo para confirmar el cambio.'
  } catch (err) {
    emailMsg.value = err.message
  } finally {
    emailLoading.value = false
  }
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="settings">
    <router-link :to="{ name: 'dashboard' }">&larr; Volver</router-link>
    <h1>Ajustes</h1>

    <section>
      <h2>Cambiar contraseña</h2>
      <form @submit.prevent="changePassword">
        <input v-model="pwForm.current_password" type="password" placeholder="Contraseña actual" required />
        <input v-model="pwForm.new_password" type="password" placeholder="Nueva contraseña" required />
        <input v-model="pwForm.confirm_new_password" type="password" placeholder="Confirmar nueva contraseña" required />
        <button type="submit" :disabled="pwLoading">{{ pwLoading ? 'Guardando...' : 'Actualizar' }}</button>
      </form>
      <p v-if="pwMsg">{{ pwMsg }}</p>
    </section>

    <section>
      <h2>Cambiar correo</h2>
      <form @submit.prevent="requestEmailChange">
        <input v-model="emailForm.email" type="email" placeholder="Nuevo correo" required />
        <input v-model="emailForm.password" type="password" placeholder="Contraseña actual" required />
        <button type="submit" :disabled="emailLoading">{{ emailLoading ? 'Enviando...' : 'Solicitar cambio' }}</button>
      </form>
      <p v-if="emailMsg">{{ emailMsg }}</p>
    </section>

    <button class="logout" @click="handleLogout">Cerrar sesión</button>
  </div>
</template>

<style scoped>
.settings { padding: 2rem; max-width: 480px; margin: 0 auto; }
section { margin-bottom: 2rem; }
form { display: flex; flex-direction: column; gap: 0.6rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.logout { background: #c0392b; }
</style>
