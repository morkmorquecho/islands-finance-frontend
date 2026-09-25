<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-backdrop" role="presentation" @click.self="cancel">
      <section
        class="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
      >
        <div class="confirm-dialog__icon" aria-hidden="true">!</div>
        <span class="confirm-dialog__eyebrow">Confirmar acción</span>
        <h2 :id="titleId">{{ title }}</h2>
        <p :id="descriptionId">{{ message }}</p>

        <div class="confirm-dialog__actions">
          <button type="button" class="confirm-dialog__button confirm-dialog__button--secondary" :disabled="loading" @click="cancel">
            {{ cancelText }}
          </button>
          <button type="button" class="confirm-dialog__button confirm-dialog__button--danger" :disabled="loading" @click="confirm">
            {{ loading ? 'Procesando…' : confirmText }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>(), {
  title: '¿Quieres continuar?',
  message: 'Esta acción no se puede deshacer.',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = computed(() => 'confirm-dialog-title')
const descriptionId = computed(() => 'confirm-dialog-description')

function cancel() {
  if (props.loading) return
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  if (!props.loading) emit('confirm')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') cancel()
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
}, { immediate: true })

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(7 42 61 / 58%);
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  width: min(100%, 420px);
  padding: 30px 28px 24px;
  color: #153b4c;
  background: #fffdf8;
  border: 1px solid rgb(14 82 104 / 13%);
  border-radius: 24px;
  box-shadow: 0 24px 70px rgb(4 38 54 / 25%);
}

.confirm-dialog__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 18px;
  color: #fffdf8;
  background: #e47d68;
  border-radius: 50%;
  font: 800 22px/1 system-ui, sans-serif;
}

.confirm-dialog__eyebrow {
  display: block;
  margin-bottom: 7px;
  color: rgb(21 59 76 / 62%);
  font: 700 11px/1 system-ui, sans-serif;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.confirm-dialog h2 {
  margin: 0;
  font: 700 clamp(24px, 6vw, 31px)/1.05 Georgia, serif;
}

.confirm-dialog p {
  margin: 12px 0 25px;
  color: rgb(21 59 76 / 72%);
  font: 14px/1.5 system-ui, sans-serif;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.confirm-dialog__button {
  min-height: 40px;
  padding: 0 15px;
  border-radius: 10px;
  font: 700 12px system-ui, sans-serif;
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease;
}

.confirm-dialog__button:hover:not(:disabled) { transform: translateY(-1px); }
.confirm-dialog__button:disabled { cursor: wait; opacity: .58; }
.confirm-dialog__button--secondary { color: #153b4c; background: transparent; border: 1px solid rgb(14 82 104 / 25%); }
.confirm-dialog__button--danger { color: #fffdf8; background: #0e5268; border: 0; }

@media (max-width: 420px) {
  .confirm-dialog { padding: 26px 21px 20px; }
  .confirm-dialog__actions { flex-direction: column-reverse; }
  .confirm-dialog__button { width: 100%; }
}
</style>