import { reactive } from 'vue'

/**
 * Estado compartido del diálogo de confirmación.
 * Se declara fuera de la función para que sea singleton:
 * cualquier componente que use useConfirmDialog() comparte el mismo diálogo.
 */
const state = reactive({
  open: false,
  loading: false,
  title: '¿Quieres continuar?',
  message: 'Esta acción no se puede deshacer.',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  onConfirm: null,
})

function reset() {
  state.open = false
  state.loading = false
  state.onConfirm = null
}

export function useConfirmDialog() {
  /**
   * Abre el diálogo con las opciones dadas.
   * @param {Object} options
   * @param {string} [options.title]
   * @param {string} [options.message]
   * @param {string} [options.confirmText]
   * @param {string} [options.cancelText]
   * @param {() => any | Promise<any>} [options.onConfirm]
   */
  function openConfirm(options = {}) {
    state.open = true
    state.loading = false
    state.title = options.title ?? '¿Quieres continuar?'
    state.message = options.message ?? 'Esta acción no se puede deshacer.'
    state.confirmText = options.confirmText ?? 'Confirmar'
    state.cancelText = options.cancelText ?? 'Cancelar'
    state.onConfirm = options.onConfirm ?? null
  }

  function closeConfirm() {
    reset()
  }

  async function handleConfirm() {
    if (!state.onConfirm) return closeConfirm()
    state.loading = true
    try {
      await state.onConfirm()
      reset()
    } catch {
      // El manejador se encarga de mostrar el error; dejamos el diálogo abierto
      // por si el usuario quiere reintentar.
      state.loading = false
    }
  }

  return {
    confirmDialog: state,
    openConfirm,
    closeConfirm,
    handleConfirm,
  }
}