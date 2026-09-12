<script setup>
import { onMounted, ref } from 'vue'
import islandsService from '@/services/islands.service'
import islandTemplatesService from '@/services/islandTemplates.service'
import modulesService from '@/services/modules.service'
import marketDataService from '@/services/marketData.service'
import cashIcon from '@/assets/cash.png'
import assetIcon from '@/assets/asset.png'

const props = defineProps({
  payload: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['success', 'cancel'])

const modules = ref([])
const templates = ref([])
const loadingContext = ref(true)

const form = ref({
  module: props.payload?.moduleId || '',
  template: '',
  name: '',
  kind: 'cash',
  currency: 'MXN',
  symbol: '',
  asset_type: 'crypto',
  interest_type: '',
  annual_rate: '',
  color: '#2FB8A6',
})

const loading = ref(false)
const errorMsg = ref('')

// ── búsqueda de activos (crypto/stock) ──────────────────────────
const assetQuery = ref('')
const assetResults = ref([])
const searchingAssets = ref(false)

async function searchAssets() {
  if (!assetQuery.value.trim()) return
  searchingAssets.value = true
  try {
    assetResults.value = await marketDataService.searchAssets({
      assetType: form.value.asset_type,
      q: assetQuery.value.trim(),
    })
  } catch {
    assetResults.value = []
  } finally {
    searchingAssets.value = false
  }
}

function pickAsset(result) {
  form.value.symbol = result.id || result.symbol
  form.value.name = form.value.name || result.name
  assetResults.value = []
  assetQuery.value = result.name
}

// ── plantilla: autocompleta algunos campos ──────────────────────
function applyTemplate() {
  const tpl = templates.value.find((t) => t.id === form.value.template)
  if (!tpl) return
  form.value.name = form.value.name || tpl.name
  form.value.kind = tpl.kind
  form.value.color = tpl.color || form.value.color
  if (tpl.kind === 'asset') {
    form.value.symbol = tpl.symbol || form.value.symbol
  } else if (tpl.default_rate) {
    form.value.annual_rate = tpl.default_rate
    form.value.interest_type = form.value.interest_type || 'compound'
  }
}

async function loadContext() {
  loadingContext.value = true
  try {
    const [tplData, ...rest] = await Promise.all([
      islandTemplatesService.list(),
      props.payload?.moduleId ? Promise.resolve(null) : modulesService.list(),
    ])
    templates.value = tplData.results
    if (rest[0]) modules.value = rest[0].results
  } catch {
    // catálogos son opcionales para poder seguir creando la isla a mano
  } finally {
    loadingContext.value = false
  }
}

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const payload = { ...form.value }
    if (!payload.template) delete payload.template
    if (payload.kind === 'cash') {
      delete payload.symbol
      delete payload.asset_type
    } else {
      delete payload.currency
      delete payload.interest_type
      delete payload.annual_rate
    }
    if (!payload.interest_type) delete payload.interest_type
    if (!payload.annual_rate) delete payload.annual_rate

    const created = await islandsService.create(payload)
    emit('success', created)
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadContext)
</script>

<template>
  <form class="tropical-form" @submit.prevent="handleSubmit">
    <div class="field" v-if="!props.payload?.moduleId">
      <label for="island-module">Archipiélago</label>
      <div class="input-shell">
        <select id="island-module" v-model="form.module" required>
          <option value="" disabled>Selecciona uno</option>
          <option v-for="mod in modules" :key="mod.id" :value="mod.id">{{ mod.name }}</option>
        </select>
      </div>
    </div>

    <div class="field" v-if="templates.length">
      <label for="island-template">Plantilla (opcional)</label>
      <div class="input-shell">
        <select id="island-template" v-model="form.template" @change="applyTemplate">
          <option value="">Sin plantilla</option>
          <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label for="island-name">Nombre de la isla</label>
      <div class="input-shell">
        <input id="island-name" v-model="form.name" type="text" placeholder="ej. Nu ahorro" required />
      </div>
    </div>

    <div class="kind-toggle" role="radiogroup" aria-label="Tipo de isla">
      <button
        type="button"
        class="kind-option"
        :class="{ active: form.kind === 'cash' }"
        @click="form.kind = 'cash'"
      >
        <img :src="cashIcon" alt="" class="kind-icon" />
        Efectivo
      </button>
      <button
        type="button"
        class="kind-option"
        :class="{ active: form.kind === 'asset' }"
        @click="form.kind = 'asset'"
      >
        <img :src="assetIcon" alt="" class="kind-icon" />
        Activo
      </button>
    </div>

    <template v-if="form.kind === 'cash'">
      <div class="field">
        <label for="island-currency">Moneda</label>
        <div class="input-shell">
          <input id="island-currency" v-model="form.currency" type="text" placeholder="MXN" required />
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="island-interest-type">Interés (opcional)</label>
          <div class="input-shell">
            <select id="island-interest-type" v-model="form.interest_type">
              <option value="">Sin interés</option>
              <option value="simple">Simple</option>
              <option value="compound">Compuesto</option>
            </select>
          </div>
        </div>
        <div class="field" v-if="form.interest_type">
          <label for="island-rate">Tasa anual</label>
          <div class="input-shell">
            <input id="island-rate" v-model="form.annual_rate" type="number" step="0.0001" placeholder="0.10" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="field">
        <label for="island-asset-type">Tipo de activo</label>
        <div class="input-shell">
          <select id="island-asset-type" v-model="form.asset_type">
            <option value="crypto">Cripto</option>
            <option value="stock">Acción</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="asset-search">Buscar activo</label>
        <div class="asset-search-row">
          <div class="input-shell">
            <input
              id="asset-search"
              v-model="assetQuery"
              type="text"
              placeholder="ej. bitcoin, apple"
              @keydown.enter.prevent="searchAssets"
            />
          </div>
          <button type="button" class="search-button" @click="searchAssets" :disabled="searchingAssets">
            {{ searchingAssets ? '…' : 'Buscar' }}
          </button>
        </div>

        <ul v-if="assetResults.length" class="asset-results">
          <li v-for="result in assetResults" :key="result.id || result.symbol" @click="pickAsset(result)">
            <span class="asset-name">{{ result.name }}</span>
            <span class="asset-symbol">{{ (result.symbol || result.id)?.toUpperCase() }}</span>
          </li>
        </ul>
      </div>

      <div class="field">
        <label for="island-symbol">Símbolo</label>
        <div class="input-shell">
          <input id="island-symbol" v-model="form.symbol" type="text" placeholder="ej. bitcoin / AAPL" required />
        </div>
      </div>
    </template>

    <div class="field">
      <label for="island-color">Color</label>
      <div class="color-row">
        <input id="island-color" v-model="form.color" type="color" />
        <span class="color-value">{{ form.color }}</span>
      </div>
    </div>

    <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

    <div class="form-actions">
      <button type="button" class="modal-cancel" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="submit-button" :disabled="loading || loadingContext">
        {{ loading ? 'Creando…' : 'Crear isla' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.tropical-form { display: flex; flex-direction: column; gap: 16px; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.kind-toggle { display: flex; gap: 8px; }
.kind-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 10px 8px;
  border: 1px solid color-mix(in oklab, var(--foreground) 20%, transparent);
  border-radius: 12px;
  color: var(--foreground);
  background: color-mix(in oklab, var(--label) 40%, transparent);
  font: 700 13px var(--font-sans);
  cursor: pointer;
  transition: transform 140ms ease, border-color 140ms ease;
}
.kind-icon {
  width: 23px;
  height: 23px;
  object-fit: contain;
  flex-shrink: 0;
}
.kind-option.active {
  border-color: var(--ocean-deep);
  background: color-mix(in oklab, var(--ocean-deep) 14%, transparent);
  transform: translateY(-1px);
}

.asset-search-row { display: flex; gap: 8px; }
.asset-search-row .input-shell { flex: 1; }
.search-button {
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  color: var(--label);
  background: var(--ocean-deep);
  font: 700 13px var(--font-sans);
  cursor: pointer;
}
.search-button:disabled { opacity: 0.6; cursor: not-allowed; }

.asset-results {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent);
  border-radius: 10px;
}
.asset-results li {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
.asset-results li:hover { background: color-mix(in oklab, var(--ocean-deep) 10%, transparent); }
.asset-symbol { color: var(--label-ink); }

.color-row { display: flex; align-items: center; gap: 10px; }
.color-row input[type="color"] {
  width: 40px; height: 40px; padding: 0; border: 0; border-radius: 10px; cursor: pointer; background: none;
}
.color-value { font-size: 13px; color: var(--label-ink); }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.modal-cancel {
  padding: 0 16px; min-height: 46px; border: 1px solid color-mix(in oklab, var(--foreground) 22%, transparent);
  border-radius: 12px; color: var(--foreground); background: transparent; font: 700 14px var(--font-sans); cursor: pointer;
}
.modal-cancel:hover { background: color-mix(in oklab, var(--foreground) 6%, transparent); }
</style>