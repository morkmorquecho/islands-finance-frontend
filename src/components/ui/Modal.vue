<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import ModuleForm from '../ModuleForm.vue'
import IslandForm from '../IslandForm.vue'
import IslandInfoModal from './IslandInfoModal.vue'
import islandIcon from '@/assets/isla.png'

const ui = useUIStore()
const modal = computed(() => ui.modal)

const isFormMode = computed(() => !!modal.value.formType)
const isIslandInfoMode = computed(() => !!modal.value.islandId)

function handleOverlayClick() {
  ui.closeModal()
}

function handleConfirm() {
  modal.value._callback?.confirm?.()
  ui.closeModal()
}

function handleCancel() {
  modal.value._callback?.cancel?.()
  ui.closeModal()
}

function handleFormSuccess(result) {
  modal.value.formPayload?.onSuccess?.(result)
  ui.closeModal()
}

function handleIslandEdit(island) {
  ui.replaceWithForm('island', {
    title: 'Editar isla',
    island,
    onSuccess: modal.value.formPayload?.onSuccess,
  })
}

function handleIslandDeleted() {
  modal.value.formPayload?.onSuccess?.()
  ui.closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modal.show" class="modal-overlay" @click.self="handleOverlayClick">
        <Transition name="modal-pop" appear>
          <div class="modal-card" :class="{ 'is-form': isFormMode, 'is-island-info': isIslandInfoMode }" role="dialog" aria-modal="true">

            <!-- ola decorativa: solo en modo mensaje -->
            <div v-if="!isFormMode && !isIslandInfoMode" class="modal-wave-mask" aria-hidden="true">
              <svg class="modal-wave" viewBox="0 0 600 40" preserveAspectRatio="none">
                <path d="M0,20 C100,40 200,0 300,20 C400,40 500,0 600,20 L600,0 L0,0 Z" />
              </svg>
            </div>

            <button class="modal-close" type="button" aria-label="Cerrar" @click="ui.closeModal()">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
              </svg>
            </button>

            <div class="modal-body">

              <!-- ── modo formulario ────────────────────────────── -->
              <template v-if="isFormMode">
                <div class="form-header">
                  <span class="form-icon" :class="modal.formType">
                    <img :src="islandIcon" alt="" class="kind-icon" />
                  </span>
                  <h2 v-if="modal.title" class="modal-title">{{ modal.title }}</h2>
                </div>

                <ModuleForm
                  v-if="modal.formType === 'module'"
                  :payload="modal.formPayload"
                  @success="handleFormSuccess"
                  @cancel="ui.closeModal()"
                />
                <IslandForm
                  v-else-if="modal.formType === 'island'"
                  :payload="modal.formPayload"
                  @success="handleFormSuccess"
                  @cancel="ui.closeModal()"
                />
              </template>

              <IslandInfoModal
                v-else-if="isIslandInfoMode"
                :island-id="modal.islandId"
                @edit-island="handleIslandEdit"
                @deleted="handleIslandDeleted"
              />

              <!-- ── modo mensaje (comportamiento original) ─────── -->
              <template v-else>
                <h2 v-if="modal.title" class="modal-title">{{ modal.title }}</h2>
                <p v-if="modal.message" class="modal-message">{{ modal.message }}</p>

                <div class="modal-actions">
                  <button
                    v-if="modal.showCancelButton"
                    type="button"
                    class="modal-cancel"
                    @click="handleCancel"
                  >
                    {{ modal.cancelText }}
                  </button>
                  <button
                    v-if="modal.showActionButton"
                    type="button"
                    class="submit-button"
                    @click="handleConfirm"
                  >
                    {{ modal.buttonText }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in oklab, var(--ocean-deep) 55%, black 25%);
  backdrop-filter: blur(6px);
}

.kind-icon {
  width: 27px;
  height: 27px;
  object-fit: contain;
  flex-shrink: 0;
}

.modal-card {
  position: relative;
  width: min(460px, 100%);
  max-height: min(88vh, 720px);
  overflow-y: auto;
  overflow-x: hidden; /* evita que la ola dispare un scroll horizontal fantasma */
  padding: 40px 28px 28px;
  border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent);
  border-radius: 26px;
  color: var(--foreground);
  background: color-mix(in oklab, var(--label) 92%, var(--sky-top));
  box-shadow: 0 30px 80px color-mix(in oklab, var(--ocean-deep) 32%, transparent);
}

.modal-card.is-form {
  width: min(560px, 100%);
  padding: 28px 28px 28px;
}
.modal-card.is-island-info {
  width: min(540px, 100%);
  padding: 0;
  background: color-mix(in oklab, var(--label) 96%, var(--sky-top));
}

/* ── banda de olas decorativa: la máscara recorta el desborde, el svg se mueve libre dentro ── */
.modal-wave-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 28px;
  overflow: hidden;
  border-radius: 26px 26px 0 0;
}

.modal-wave {
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 28px;
  fill: var(--tag-coral);
  opacity: 0.9;
  animation: wave-drift 5s linear infinite;
  will-change: transform;
}

@keyframes wave-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(-25%); }
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  color: var(--label);
  background: color-mix(in oklab, var(--ocean-deep) 70%, transparent);
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;
}
.modal-close:hover { transform: scale(1.08); background: color-mix(in oklab, var(--ocean-deep) 85%, transparent); }
.modal-close:focus-visible { outline: 3px solid var(--tag-coral); outline-offset: 3px; }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.is-form .modal-body { padding-top: 0; gap: 20px; }

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in oklab, var(--foreground) 12%, transparent);
}

.form-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  color: var(--foreground);
  background: color-mix(in oklab, var(--tag-coral) 16%, transparent);
}
.form-icon.island {
  background: color-mix(in oklab, var(--sky-top) 30%, var(--tag-coral) 12%);
}

.modal-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1.1;
}

.is-form .modal-title { font-size: 20px; }

.modal-message {
  margin: 0;
  color: var(--label-ink);
  font-size: 14px;
  line-height: 1.55;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.modal-cancel {
  padding: 0 16px;
  border: 1px solid color-mix(in oklab, var(--foreground) 22%, transparent);
  border-radius: 12px;
  min-height: 46px;
  color: var(--foreground);
  background: transparent;
  font: 700 14px var(--font-sans);
  cursor: pointer;
}
.modal-cancel:hover { background: color-mix(in oklab, var(--foreground) 6%, transparent); }

/* ── transiciones de entrada/salida ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 200ms ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { transition: transform 320ms cubic-bezier(.34,1.56,.64,1), opacity 220ms ease; }
.modal-pop-leave-active { transition: transform 180ms ease, opacity 180ms ease; }
.modal-pop-enter-from { opacity: 0; transform: translateY(28px) scale(0.94); }
.modal-pop-leave-to   { opacity: 0; transform: translateY(12px) scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .modal-wave, .modal-close { animation: none; }
  .modal-fade-enter-active, .modal-fade-leave-active,
  .modal-pop-enter-active, .modal-pop-leave-active { transition: none; }
}
</style>
