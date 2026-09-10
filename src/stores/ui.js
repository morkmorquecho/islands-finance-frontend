import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    modal: {
      show:             false,
      message:          '',
      title:            '',
      animation:        '',
      showActionButton: false,
      buttonText:       '',
      showCancelButton: false,
      cancelText:       '',
      _callback:        null,
    }
  }),

  actions: {
    // ─── núcleo ────────────────────────────────────────────────
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
      this.modal.show = true
    },

    closeModal() {
      Object.assign(this.modal, {
        show:             false,
        message:          '',
        title:            '',
        animation:        '',
        showActionButton: false,
        buttonText:       '',
        showCancelButton: false,
        cancelText:       '',
        _callback:        null,
      })
    },
  }
})