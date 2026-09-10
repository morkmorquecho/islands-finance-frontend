<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import islandsService from '@/services/islands.service'
import islandTemplatesService from '@/services/islandTemplates.service'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

const islands = ref([])
const templates = ref([])
const loading = ref(true)
const errorMsg = ref('')

const newIsland = ref({
  module: props.id,
  template: '',
  name: '',
  kind: 'cash',
  currency: 'MXN',
  symbol: '',
  asset_type: '',
})
const creating = ref(false)

async function loadIslands() {
  loading.value = true
  try {
    const data = await islandsService.list({ module: props.id })
    islands.value = data.results
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

async function loadTemplates() {
  try {
    const data = await islandTemplatesService.list()
    templates.value = data.results
  } catch {
    // catálogo de plantillas es opcional, se ignora el error silenciosamente
  }
}

async function createIsland() {
  creating.value = true
  errorMsg.value = ''
  try {
    const payload = { ...newIsland.value }
    if (!payload.template) delete payload.template
    if (newIsland.value.kind !== 'asset') delete payload.asset_type
    await islandsService.create(payload)
    newIsland.value = {
      module: props.id,
      template: '',
      name: '',
      kind: 'cash',
      currency: 'MXN',
      symbol: '',
      asset_type: '',
    }
    await loadIslands()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    creating.value = false
  }
}

function goToIsland(islandId) {
  router.push({ name: 'island-detail', params: { id: islandId } })
}

onMounted(() => {
  loadIslands()
  loadTemplates()
})
</script>

<template>
  <div class="module-detail">
    <router-link :to="{ name: 'dashboard' }">&larr; Volver</router-link>
    <h1>Islas</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="loading">Cargando...</p>

    <ul v-else class="island-list">
      <li v-for="island in islands" :key="island.id" @click="goToIsland(island.id)">
        <span class="name">{{ island.name }}</span>
        <span class="kind">{{ island.kind }}</span>
        <span class="value">{{ island.summary?.value_base }} {{ island.summary?.currency }}</span>
      </li>
      <li v-if="!islands.length" class="empty">Este archipiélago todavía no tiene islas.</li>
    </ul>

    <form class="new-island" @submit.prevent="createIsland">
      <h2>Nueva isla</h2>

      <select v-model="newIsland.template">
        <option value="">Sin plantilla</option>
        <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
      </select>

      <input v-model="newIsland.name" type="text" placeholder="Nombre" required />

      <select v-model="newIsland.kind">
        <option value="cash">Efectivo</option>
        <option value="asset">Activo</option>
      </select>

      <input
        v-if="newIsland.kind === 'cash'"
        v-model="newIsland.currency"
        type="text"
        placeholder="Moneda (ej. MXN)"
      />

      <template v-else>
        <input v-model="newIsland.symbol" type="text" placeholder="Símbolo (ej. BTC)" />
        <select v-model="newIsland.asset_type">
          <option value="">Tipo de activo</option>
          <option value="crypto">Cripto</option>
          <option value="stock">Acción</option>
        </select>
      </template>

      <button type="submit" :disabled="creating">
        {{ creating ? 'Creando...' : 'Crear isla' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.module-detail { padding: 2rem; max-width: 720px; margin: 0 auto; }
.island-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; margin: 1.5rem 0; }
.island-list li { display: flex; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
.island-list li:hover { background: #f5f8f8; }
.empty { text-align: center; color: #888; cursor: default; }
.new-island { display: flex; flex-direction: column; gap: 0.75rem; max-width: 320px; }
.new-island input, .new-island select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 0.6rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.error { color: #c0392b; }
</style>
