<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import modulesService from '@/services/modules.service'

const router = useRouter()
const modules = ref([])
const loading = ref(true)
const errorMsg = ref('')

const newModule = ref({ name: '', type: '' })
const creating = ref(false)

async function loadModules() {
  loading.value = true
  try {
    const data = await modulesService.list()
    modules.value = data.results
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

async function createModule() {
  if (!newModule.value.name || !newModule.value.type) return
  creating.value = true
  try {
    await modulesService.create(newModule.value)
    newModule.value = { name: '', type: '' }
    await loadModules()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    creating.value = false
  }
}

function goToModule(id) {
  router.push({ name: 'module-detail', params: { id } })
}

onMounted(loadModules)
</script>

<template>
  <div class="dashboard">
    <div class="header">
      <h1>Mis archipiélagos</h1>
      <router-link :to="{ name: 'settings' }">Ajustes</router-link>
    </div>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="loading">Cargando...</p>

    <ul v-else class="module-list">
      <li v-for="mod in modules" :key="mod.id" @click="goToModule(mod.id)">
        <span class="name">{{ mod.name }}</span>
        <span class="type">{{ mod.type }}</span>
        <span class="value">${{ mod.total_value }}</span>
      </li>
      <li v-if="!modules.length" class="empty">Todavía no tienes archipiélagos.</li>
    </ul>

    <form class="new-module" @submit.prevent="createModule">
      <h2>Nuevo archipiélago</h2>
      <input v-model="newModule.name" type="text" placeholder="Nombre" required />
      <input v-model="newModule.type" type="text" placeholder="Tipo (ej. investment)" required />
      <button type="submit" :disabled="creating">
        {{ creating ? 'Creando...' : 'Crear' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.dashboard { padding: 2rem; max-width: 720px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; }
.module-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; margin: 1.5rem 0 2rem; }
.module-list li { display: flex; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
.module-list li:hover { background: #f5f8f8; }
.empty { text-align: center; color: #888; cursor: default; }
.new-module { display: flex; flex-direction: column; gap: 0.75rem; max-width: 320px; }
.new-module input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.error { color: #c0392b; }
</style>
