<script setup>
import { ref } from 'vue'
import modulesService from '@/services/modules.service'

const props = defineProps({
  payload: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['success', 'cancel'])

const TYPE_PRESETS = [
  { value: 'savings', label: 'Ahorro' },
  { value: 'investment', label: 'Inversión' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'leisure', label: 'Ocio' },
  { value: 'debt', label: 'Deudas' },
  { value: 'other', label: 'Otro' },
]

const form = ref({ name: '', type: 'savings', customType: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const type = form.value.type === 'other' ? form.value.customType.trim() : form.value.type
    const created = await modulesService.create({ name: form.value.name.trim(), type })
    emit('success', created)
  } catch (err) {
    errorMsg.value = err.message
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

    <div class="field" v-if="form.type === 'other'">
      <label for="module-custom-type">Describe el motivo</label>
      <div class="input-shell">
        <input id="module-custom-type" v-model="form.customType" type="text" placeholder="ej. Boda" required />
      </div>
    </div>

    <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

    <div class="form-actions">
      <button type="button" class="modal-cancel" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? 'Creando…' : 'Crear archipiélago' }}
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
</style>
