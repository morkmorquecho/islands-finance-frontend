<script setup>
import { ref, toRef } from 'vue'
import islandsService from '@/services/islands.service'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composable/island/useConfirmDialog.js'
import { useIslandData } from '@/composable/island/useIslandData'
import { useGoalCompletion } from '@/composable/island/useGoalCompletion'
import { useTransactionForm } from '@/composable/island/useTransactionForm'
import IslandHero from './IslandHero.vue'
import IslandSummary from './IslandSummary.vue'
import IslandGoalsSection from './IslandGoalsSection.vue'
import IslandTransactionForm from './IslandTransactionForm.vue'
import IslandTransactionsList from './IslandTransactionsList.vue'

const props = defineProps({ islandId: { type: String, required: true } })
const emit = defineEmits(['edit-island', 'deleted', 'changed'])

const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

const islandIdRef = toRef(props, 'islandId')

const {
  island, goals, transactions, loading, error,
  isCashIsland, isSystemIsland, currency, valueBase, valueNative, nativeCurrency,
  gainLoss, gainLossPercent, availableDestinations,
  transactionFilters, hasMoreTransactions, loadingMoreTransactions,
  loadIsland, loadMoreTransactions, refreshSummaryOnly,
} = useIslandData(props)

const { goalCompletions, goalMarkLoading, goalMarkError, markGoalComplete } = useGoalCompletion({
  onAfterComplete: async () => {
    await refreshSummaryOnly()
    emit('changed')
  },
})

const {
  newTransaction, editingTransaction, editTransaction,
  savingTransaction, transactionError,
  isTransfer, isEditingTransfer,
  createTransaction, startEditing, cancelEditing, saveEdit,
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
})

function editIsland() {
  if (!island.value || isSystemIsland.value) return
  emit('edit-island', island.value)
}

function deleteIsland() {
  if (!island.value || isSystemIsland.value) return
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
        throw err
      }
    },
  })
}
</script>

<template>
  <div class="island-info">
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

    <div class="island-info__content">
      <p v-if="loading" class="island-info__state">Cargando información…</p>
      <p v-else-if="error" class="island-info__state island-info__state--error">{{ error }}</p>

      <template v-else>
        <IslandSummary
          :is-cash-island="isCashIsland"
          :island="island"
          :currency="currency"
          :gain-loss="gainLoss"
          :gain-loss-percent="gainLossPercent"
        />

        <IslandGoalsSection
          :goals="goals"
          :currency="currency"
          :goal-mark-loading="goalMarkLoading"
          :goal-mark-error="goalMarkError"
          @mark-complete="markGoalComplete"
        />

        <IslandTransactionForm
          v-model="newTransaction"
          :is-cash-island="isCashIsland"
          :currency="currency"
          :island-currency="island?.currency"
          :available-destinations="availableDestinations"
          :saving-transaction="savingTransaction"
          :transaction-error="transactionError"
          @submit="createTransaction"
        />

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
        />
      </template>
    </div>
  </div>

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
.island-info__content { padding: 24px 28px 30px; }
.island-info__state { margin: 12px 0; color: var(--label-ink); text-align: center; }
.island-info__state--error { color: #a13d30; }
@media (max-width: 420px) { .island-info__content { padding: 20px; } }
</style>