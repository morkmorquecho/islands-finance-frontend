<script setup>
import { ref, computed, onMounted } from 'vue'
import modulesService from '@/services/modules.service'
import islandsService from '@/services/islands.service'
import islandTemplatesService from '@/services/islandTemplates.service'
import marketDataService from '@/services/marketData.service'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composable/useConfirmDialog.js'
import cashIcon from '@/assets/cash.png'
import assetIcon from '@/assets/asset.png'

const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

const props = defineProps({
  payload: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['success', 'cancel', 'deleted'])

const TYPE_PRESETS = [
  { value: 'savings', label: 'Ahorro' },
  { value: 'investment', label: 'Inversión' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'leisure', label: 'Ocio' },
  { value: 'debt', label: 'Deudas' },
]

const existingModule = computed(() => props.payload?.module ?? null)
const editing = computed(() => !!existingModule.value?.id)

const isPresetType = (type) => TYPE_PRESETS.some((opt) => opt.value === type)

function buildInitialModuleForm() {
  const mod = existingModule.value
  if (!mod) return { name: '', type: 'savings', customType: '', order: 1 }
  const typeIsPreset = isPresetType(mod.type)
  return {
    name: mod.name ?? '',
    type: typeIsPreset ? mod.type : 'other',
    customType: typeIsPreset ? '' : (mod.type ?? ''),
    order: mod.order ?? 1,
  }
}

function buildInitialIslandForm() {
  return {
    template: '',
    name: '',
    kind: 'cash',
    currency: 'MXN',
    symbol: '',
    mic_code: '',
    asset_type: 'crypto',
    interest_type: '',
    annual_rate: '',
    color: '#2FB8A6',
  }
}

// step 1 (siempre) y, solo al crear, step 2 para la isla
const step = ref(1)
const moduleForm = ref(buildInitialModuleForm())
const islandForm = ref(buildInitialIslandForm())

const loading = ref(false)
const errorMsg = ref('')

// ── catálogos para el paso de la isla (plantillas + búsqueda de activos) ──
const templates = ref([])
const templatesLoaded = ref(false)
const loadingContext = ref(false)

async function loadIslandContext() {
  if (templatesLoaded.value || loadingContext.value) return
  loadingContext.value = true
  try {
    const tplData = await islandTemplatesService.list()
    templates.value = tplData.results
    templatesLoaded.value = true
  } catch {
    // las plantillas son opcionales, se puede seguir sin ellas
  } finally {
    loadingContext.value = false
  }
}

const assetQuery = ref('')
const assetResults = ref([])
const searchingAssets = ref(false)

async function searchAssets() {
  if (!assetQuery.value.trim()) return
  searchingAssets.value = true
  try {
    assetResults.value = await marketDataService.searchAssets({
      assetType: islandForm.value.asset_type,
      q: assetQuery.value.trim(),
    })
  } catch {
    assetResults.value = []
  } finally {
    searchingAssets.value = false
  }
}

function pickAsset(result) {
  islandForm.value.symbol = result.id || result.symbol
  islandForm.value.name = islandForm.value.name || result.name
  islandForm.value.mic_code = result.mic_code || ''
  islandForm.value.currency = (result.currency || '').toUpperCase() || islandForm.value.currency
  assetResults.value = []
  assetQuery.value = result.name
}

function applyTemplate() {
  const tpl = templates.value.find((t) => t.id === islandForm.value.template)
  if (!tpl) return
  islandForm.value.name = islandForm.value.name || tpl.name
  islandForm.value.kind = tpl.kind
  islandForm.value.color = tpl.color || islandForm.value.color
  if (tpl.kind === 'asset') {
    islandForm.value.symbol = tpl.symbol || islandForm.value.symbol
  } else if (tpl.default_rate) {
    islandForm.value.annual_rate = tpl.default_rate
    islandForm.value.interest_type = islandForm.value.interest_type || 'compound'
  }
}

function buildIslandPayload(moduleId) {
  const payload = { ...islandForm.value, module: moduleId }
  if (!payload.template) delete payload.template
  if (payload.kind === 'cash') {
    payload.currency = (payload.currency || '').toUpperCase()
    delete payload.symbol
    delete payload.asset_type
    delete payload.mic_code
  } else {
    payload.currency = (payload.currency || '').toUpperCase()
    delete payload.interest_type
    delete payload.annual_rate
    if (!payload.mic_code) delete payload.mic_code
  }
  if (!payload.interest_type) delete payload.interest_type
  if (!payload.annual_rate) delete payload.annual_rate
  return payload
}

// ── paso 1 → paso 2 (solo al crear) ──────────────────────────────
function goToIslandStep() {
  if (!moduleForm.value.name.trim()) return
  errorMsg.value = ''
  step.value = 2
  loadIslandContext()
}

function backToModuleStep() {
  errorMsg.value = ''
  step.value = 1
}

// ── submit: editar módulo existente (sin isla) ───────────────────
async function submitEdit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const type = moduleForm.value.type === 'other' ? moduleForm.value.customType.trim() : moduleForm.value.type
    const data = {
      name: moduleForm.value.name.trim(),
      type,
      order: Number(moduleForm.value.order) || 1,
    }
    const result = await modulesService.update(existingModule.value.id, data)
    emit('success', result)
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

// ── submit final: crear módulo + isla juntos, con rollback si falla la isla ──
async function submitCreateWithIsland() {
  errorMsg.value = ''
  if (islandForm.value.kind === 'asset' && !islandForm.value.currency) {
    errorMsg.value = 'Selecciona el activo desde el buscador para determinar su moneda.'
    return
  }
  loading.value = true
  let createdModule = null
  try {
    const type = moduleForm.value.type === 'other' ? moduleForm.value.customType.trim() : moduleForm.value.type
    createdModule = await modulesService.create({
      name: moduleForm.value.name.trim(),
      type,
      order: Number(moduleForm.value.order) || 1,
    })
    const islandPayload = buildIslandPayload(createdModule.id)
    await islandsService.create(islandPayload)

    emit('success', createdModule)
  } catch (err) {
    if (createdModule) {
      try {
        await modulesService.destroy(createdModule.id)
      } catch {
        // best-effort rollback; si esto también falla, queda un módulo huérfano que
        // habría que limpiar a mano — vale la pena loggear en el backend
      }
    }
    errorMsg.value = err.message ?? 'No se pudo crear la isla. El archipiélago no se guardó.'
  } finally {
    loading.value = false
  }
}

function handleSubmit() {
  if (editing.value) return submitEdit()
  if (step.value === 1) return goToIslandStep()
  return submitCreateWithIsland()
}

function deleteModule() {
  if (!editing.value) return

  openConfirm({
    title: `¿Eliminar el archipiélago "${existingModule.value.name}"?`,
    message: 'Esta acción no se puede deshacer. Se eliminarán también los datos asociados a este archipiélago.',
    confirmText: 'Eliminar archipiélago',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      loading.value = true
      errorMsg.value = ''
      try {
        await modulesService.destroy(existingModule.value.id)
        emit('deleted')
      } catch (err) {
        errorMsg.value = err.message ?? 'No se pudo eliminar el archipiélago.'
        throw err
      } finally {
        loading.value = false
      }
    },
  })
}

onMounted(() => {
  // si vamos a editar, nunca necesitamos el paso de isla
  if (editing.value) step.value = 1
})
</script>

<template>
  <form class="tropical-form" @submit.prevent="handleSubmit">
    <p v-if="!editing" class="step-indicator">Paso {{ step }} de 2 — {{ step === 1 ? 'Archipiélago' : 'Primera isla' }}</p>

    <!-- ── paso 1: datos del módulo ─────────────────────────────── -->
    <template v-if="step === 1">
      <div class="field">
        <label for="module-name">Nombre del archipiélago (Propósitos financieros)</label>
        <div class="input-shell">
          <input id="module-name" v-model="moduleForm.name" type="text" placeholder="ej. Fondo de emergencias" required />
        </div>
      </div>

      <div class="field">
        <label for="module-type">Motivo / objetivo</label>
        <div class="input-shell">
          <select id="module-type" v-model="moduleForm.type">
            <option v-for="opt in TYPE_PRESETS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="module-order">Orden</label>
        <div class="input-shell">
          <input
            id="module-order"
            v-model.number="moduleForm.order"
            type="number"
            min="0"
            step="1"
            placeholder="1"
          />
        </div>
      </div>

      <div class="field" v-if="moduleForm.type === 'other'">
        <label for="module-custom-type">Especifica el motivo</label>
        <div class="input-shell">
          <input id="module-custom-type" v-model="moduleForm.customType" type="text" placeholder="ej. Boda" />
        </div>
      </div>

      <p v-if="!editing" class="hint-message">Para crear un archipiélago necesitas darle al menos una isla. En el siguiente paso la configuramos.</p>
    </template>

    <!-- ── paso 2: primera isla (solo al crear) ─────────────────── -->
    <template v-else>
      <div class="field" v-if="templates.length">
        <label for="island-template">Plantilla (opcional)</label>
        <div class="input-shell">
          <select id="island-template" v-model="islandForm.template" @change="applyTemplate">
            <option value="">Sin plantilla</option>
            <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="island-name">Nombre de la isla</label>
        <div class="input-shell">
          <input id="island-name" v-model="islandForm.name" type="text" placeholder="ej. Mi ahorro" required />
        </div>
      </div>

      <div class="kind-toggle" role="radiogroup" aria-label="Tipo de isla">
        <button type="button" class="kind-option" :class="{ active: islandForm.kind === 'cash' }" @click="islandForm.kind = 'cash'">
          <img :src="cashIcon" alt="" class="kind-icon" />
          Efectivo
        </button>
        <button type="button" class="kind-option" :class="{ active: islandForm.kind === 'asset' }" @click="islandForm.kind = 'asset'">
          <img :src="assetIcon" alt="" class="kind-icon" />
          Activo
        </button>
      </div>

      <template v-if="islandForm.kind === 'cash'">
        <div class="field">
          <label for="island-currency">Moneda</label>
          <div class="input-shell">
            <select id="island-currency" v-model="islandForm.currency" required>
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="island-interest-type">Interés (opcional)</label>
            <div class="input-shell">
              <select id="island-interest-type" v-model="islandForm.interest_type">
                <option value="">Sin interés</option>
                <option value="simple">Simple</option>
                <option value="compound">Compuesto</option>
              </select>
            </div>
          </div>
          <div class="field" v-if="islandForm.interest_type">
            <label for="island-rate">Tasa anual</label>
            <div class="input-shell">
              <input id="island-rate" v-model="islandForm.annual_rate" type="number" step="0.0001" placeholder="0.10" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="field">
          <label for="island-asset-type">Tipo de activo</label>
          <div class="input-shell">
            <select id="island-asset-type" v-model="islandForm.asset_type">
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

        <div class="field" v-if="islandForm.symbol">
          <label>Moneda del activo</label>
          <div class="currency-chip">
            {{ islandForm.currency || 'Selecciona el activo para detectarla' }}
          </div>
        </div>

        <div class="field">
          <label for="island-symbol">Símbolo</label>
          <div class="input-shell">
            <input id="island-symbol" v-model="islandForm.symbol" type="text" placeholder="ej. bitcoin / AAPL" required />
          </div>
        </div>
      </template>

      <div class="field">
        <label for="island-color">Color</label>
        <div class="color-row">
          <input id="island-color" v-model="islandForm.color" type="color" />
          <span class="color-value">{{ islandForm.color }}</span>
        </div>
      </div>
    </template>

    <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

    <div class="form-actions">
      <button v-if="editing" type="button" class="delete-button" :disabled="loading" @click="deleteModule">Eliminar archipiélago</button>

      <button
        v-if="!editing && step === 2"
        type="button"
        class="modal-cancel"
        :disabled="loading"
        @click="backToModuleStep"
      >
        Atrás
      </button>
      <button type="button" class="modal-cancel" @click="emit('cancel')">Cancelar</button>

      <button type="submit" class="submit-button" :disabled="loading || loadingContext">
        <template v-if="editing">{{ loading ? 'Guardando…' : 'Guardar cambios' }}</template>
        <template v-else-if="step === 1">Siguiente</template>
        <template v-else>{{ loading ? 'Creando…' : 'Crear archipiélago' }}</template>
      </button>
    </div>
  </form>

  <ConfirmDialog
    v-model="confirmDialog.open"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    :confirm-text="confirmDialog.confirmText"
    :cancel-text="confirmDialog.cancelText"
    :loading="confirmDialog.loading"
    @confirm="handleConfirm"
    @cancel="closeConfirm"
  />
</template>

<style scoped>
.tropical-form { display: flex; flex-direction: column; gap: 16px; }

.step-indicator {
  margin: -4px 0 0;
  font: 700 12px var(--font-sans);
  letter-spacing: 0.02em;
  color: var(--label-ink);
  text-transform: uppercase;
}

.hint-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--label-ink);
}

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

.currency-chip {
  padding: 10px 14px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--ocean-deep) 10%, transparent);
  color: var(--foreground);
  font: 700 13px var(--font-sans);
}

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.modal-cancel {
  padding: 0 16px; min-height: 46px; border: 1px solid color-mix(in oklab, var(--foreground) 22%, transparent);
  border-radius: 12px; color: var(--foreground); background: transparent; font: 700 14px var(--font-sans); cursor: pointer;
}
.modal-cancel:hover { background: color-mix(in oklab, var(--foreground) 6%, transparent); }
.delete-button { margin-right: auto; padding: 0 12px; min-height: 46px; border: 1px solid color-mix(in oklab, #a13d30 45%, transparent); border-radius: 12px; color: #a13d30; background: transparent; font: 700 13px var(--font-sans); cursor: pointer; }
.delete-button:disabled { opacity: .6; cursor: wait; }
</style>