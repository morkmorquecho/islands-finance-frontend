import { defineStore } from 'pinia'

const EMPTY_MODAL = {
  show:             false,
  message:          '',
  title:            '',
  animation:        '',
  showActionButton: false,
  buttonText:       '',
  showCancelButton: false,
  cancelText:       '',
  _callback:        null,
  // ── nuevo: soporte de formulario ──────────────────────────────
  formType:         null,   // 'module' | 'island' | null
  formPayload:      null,   // datos de contexto para el form (moduleId, onSuccess, etc.)
  islandId:         null,
}

export const useUIStore = defineStore('ui', {
  state: () => ({
    modal: { ...EMPTY_MODAL },
  }),

  actions: {
    // ─── núcleo (mensajes) ─────────────────────────────────────
    showModal(message, title = '', animation = '', options = {}) {
      if (this.modal.show) return
      this.modal.message          = message
      this.modal.title            = title
      this.modal.animation        = animation
      this.modal.showActionButton = options.showActionButton ?? false
      this.modal.buttonText       = options.buttonText       ?? ''
      this.modal.showCancelButton = options.showCancelButton ?? false
      this.modal.cancelText       = options.cancelText       ?? 'Cancelar'
      this.modal._callback        = {
        confirm: options.onConfirm ?? null,
        cancel:  options.onCancel  ?? null,
      }
      this.modal.formType    = null
      this.modal.formPayload = null
      this.modal.islandId    = null
      this.modal.show = true
    },

    // ─── nuevo: modales de formulario ──────────────────────────
    /**
     * @param {'module'|'island'} formType
     * @param {{ title?: string, moduleId?: string, onSuccess?: (result: any) => void }} payload
     */
    showFormModal(formType, payload = {}) {
      if (this.modal.show) return
      this.modal.formType    = formType
      this.modal.formPayload = payload
      this.modal.title       = payload.title ?? ''
      this.modal.animation   = ''
      this.modal.show = true
    },

    showIslandInfo(islandId) {
      if (this.modal.show) return
      this.modal.formType = null
      this.modal.formPayload = null
      this.modal.islandId = String(islandId)
      this.modal.title = ''
      this.modal.animation = ''
      this.modal.show = true
    },

    closeModal() {
      Object.assign(this.modal, { ...EMPTY_MODAL })
    },
  },
})
