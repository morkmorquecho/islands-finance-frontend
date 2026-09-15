<script setup>
import { ref, computed } from 'vue'
import modulesService from '@/services/modules.service'

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

function buildInitialForm() {
  const mod = existingModule.value
  if (!mod) return { name: '', type: 'savings', customType: '' }
  const typeIsPreset = isPresetType(mod.type)
  return {
    name: mod.name ?? '',
    type: typeIsPreset ? mod.type : 'other',
    customType: typeIsPreset ? '' : (mod.type ?? ''),
  }
}

const form = ref(buildInitialForm())
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const type = form.value.type === 'other' ? form.value.customType.trim() : form.value.type
    const data = { name: form.value.name.trim(), type }
    const result = editing.value
      ? await modulesService.update(existingModule.value.id, data)
      : await modulesService.create(data)
    emit('success', result)
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

async function deleteModule() {
  if (!editing.value) return
  if (!window.confirm(`¿Eliminar el archipiélago "${existingModule.value.name}"? Esta acción no se puede deshacer.`)) return

  loading.value = true
  errorMsg.value = ''
  try {
    await modulesService.destroy(existingModule.value.id)
    emit('deleted')
  } catch (err) {
    errorMsg.value = err.message ?? 'No se pudo eliminar el archipiélago.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="tropical-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="module-name">Nombre del archipiélago (Propósitos financieros)</label>
      <div class="input-shell">
        <input id="module-name" v-model="form.name" type="text" placeholder="ej. Fondo de emergencias" required />
      </div>
    </div>

    <div class="field">
      <label for="module-type">Motivo / objetivo</label>
      <div class="input-shell">
        <select id="module-type" v-model="form.type">
          <option v-for="opt in TYPE_PRESETS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>


    <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

    <div class="form-actions">
      <button v-if="editing" type="button" class="delete-button" :disabled="loading" @click="deleteModule">Eliminar archipiélago</button>
      <button type="button" class="modal-cancel" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? (editing ? 'Guardando…' : 'Creando…') : (editing ? 'Guardar cambios' : 'Crear archipiélago') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.tropical-form { display: flex; flex-direction: column; gap: 16px; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.modal-cancel {
  padding: 0 16px; min-height: 46px; border: 1px solid color-mix(in oklab, var(--foreground) 22%, transparent);
  border-radius: 12px; color: var(--foreground); background: transparent; font: 700 14px var(--font-sans); cursor: pointer;
}
.modal-cancel:hover { background: color-mix(in oklab, var(--foreground) 6%, transparent); }
.delete-button { margin-right: auto; padding: 0 12px; min-height: 46px; border: 1px solid color-mix(in oklab, #a13d30 45%, transparent); border-radius: 12px; color: #a13d30; background: transparent; font: 700 13px var(--font-sans); cursor: pointer; }
.delete-button:disabled { opacity: .6; cursor: wait; }
</style>