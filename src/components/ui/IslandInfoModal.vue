<script setup>
import { toRef, computed } from 'vue'
import islandsService from '@/services/islands.service'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composable/useConfirmDialog.js'

import { useIslandData } from '@/composable/island/useIslandData.js'
import { useGoalCompletion } from '@/composable/island/useGoalCompletion'
import { useTransactionForm } from '@/composable/island/useTransactionForm'

import IslandHero from '../island/IslandHero.vue'
import IslandSummary from '../island/IslandSummary.vue'
import IslandGoalsSection from '../island/IslandGoalsSection.vue'
import IslandTransactionForm from '../island/IslandTransactionForm.vue'
import IslandTransactionsList from '../island/IslandTransactionsList.vue'

const props = defineProps({
  islandId: { type: String, required: true },
})

const emit = defineEmits(['edit-island', 'deleted', 'changed'])

/* ── Diálogo de confirmación (eliminar isla) ─────────────────── */
const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

/* ── Datos: isla, metas, movimientos, destinos ───────────────── */
const islandIdRef = toRef(props, 'islandId')

const {
  island,
  goals,
  transactions,
  loading,
  error,
  isCashIsland,
  isSystemIsland,
  currency,
  valueBase,
  valueNative,
  nativeCurrency,
  gainLoss,
  gainLossPercent,
  availableDestinations,
  transactionFilters,
  hasMoreTransactions,
  loadingMoreTransactions,
  loadIsland,
  loadMoreTransactions,
  refreshSummaryOnly,
} = useIslandData(props)

/* ── Marcar metas cumplidas ──────────────────────────────────── */
const { goalMarkLoading, goalMarkError, markGoalComplete } = useGoalCompletion({
  onAfterComplete: async () => {
    await refreshSummaryOnly()
    emit('changed')
  },
})

/* ── Formulario de transacciones (crear / editar) ────────────── */
const {
  newTransaction,
  editingTransaction,
  editTransaction,
  savingTransaction,
  transactionError,
  createTransaction,
  startEditing,
  cancelEditing,
  saveEdit,
} = useTransactionForm({
  islandId: islandIdRef,
  islandRef: island,
  isCashIsland,
  availableDestinations,
  currency,
  onSaved: async () => {
    await loadIsland()
    emit('changed')
  },
  getAvailableBalance: () => Number(valueBase.value ?? 0),
  onSaved: async () => {
    await loadIsland()
    emit('changed')
  },
})

/* ── Acciones de isla (editar / eliminar) ────────────────────── */
const canEditOrDelete = computed(() => island.value && !isSystemIsland.value)

function editIsland() {
  if (!canEditOrDelete.value) return
  emit('edit-island', island.value)
}

function deleteIsland() {
  if (!canEditOrDelete.value) return

  openConfirm({
    title: `¿Eliminar la isla “${island.value.name}”?`,
    message: 'Esta acción no se puede deshacer. Se borrarán también sus movimientos y metas asociadas.',
    confirmText: 'Eliminar isla',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await islandsService.destroy(island.value.id)
        emit('deleted')
      } catch (err) {
        error.value = err.message ?? 'No se pudo eliminar la isla.'
        throw err // el ConfirmDialog mantiene su estado de loading
      }
    },
  })
}
</script>

<template>
  <div class="island-info-modal">
    <!-- Cabecera: nombre, balance, acciones -->
    <IslandHero
      :island="island"
      :loading="loading"
      :is-cash-island="isCashIsland"
      :is-system-island="isSystemIsland"
      :value-base="valueBase"
      :value-native="valueNative"
      :native-currency="nativeCurrency"
      @edit="editIsland"
      @delete="deleteIsland"
    />

    <div class="island-info-modal__content">
      <p v-if="loading" class="island-info-modal__state">Cargando información…</p>

      <p v-else-if="error" class="island-info-modal__state island-info-modal__state--error">
        {{ error }}
      </p>

      <template v-else>
        <!-- Ganancia por interés (efectivo) o ganancia/pérdida (activos) -->
        <IslandSummary
          :is-cash-island="isCashIsland"
          :island="island"
          :currency="currency"
          :gain-loss="gainLoss"
          :gain-loss-percent="gainLossPercent"
        />

        <!-- Metas con botón de "marcar cumplido" -->
        <IslandGoalsSection
          :goals="goals"
          :currency="currency"
          :goal-mark-loading="goalMarkLoading"
          :goal-mark-error="goalMarkError"
          @mark-complete="markGoalComplete"
        />

        <!-- Formulario para registrar movimiento -->
        <IslandTransactionForm
          v-model="newTransaction"
          :is-cash-island="isCashIsland"
          :currency="currency"
          :island-currency="island?.currency"
          :available-destinations="availableDestinations"
          :saving-transaction="savingTransaction"
          :transaction-error="transactionError"
          :available-balance="Number(valueBase ?? 0)"
          @submit="createTransaction"
        />

        <!-- Lista + filtros + edición inline -->
        <IslandTransactionsList
          :transactions="transactions"
          :filters="transactionFilters"
          :is-cash-island="isCashIsland"
          :currency="currency"
          :island-currency="island?.currency"
          :available-destinations="availableDestinations"
          :editing-transaction="editingTransaction"
          :edit-transaction="editTransaction"
          :saving-transaction="savingTransaction"
          :transaction-error="transactionError"
          :has-more-transactions="hasMoreTransactions"
          :loading-more-transactions="loadingMoreTransactions"
          @update:filters="transactionFilters = $event"
          @update:edit-transaction="editTransaction = $event"
          @edit="startEditing"
          @cancel-edit="cancelEditing"
          @save-edit="saveEdit"
          @load-more="loadMoreTransactions"
          :available-balance="Number(valueBase ?? 0)"
        />
      </template>
    </div>

    <!-- Diálogo de confirmación para eliminar isla -->
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
  </div>
</template>

<style scoped>
.island-info-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.island-info-modal__content {
  padding: 24px 28px 30px;
}

.island-info-modal__state {
  margin: 12px 0;
  color: var(--label-ink);
  text-align: center;
}

.island-info-modal__state--error {
  color: #a13d30;
}

@media (max-width: 420px) {
  .island-info-modal__content {
    padding: 20px;
  }
}
</style>