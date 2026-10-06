<script setup>
import { computed } from 'vue'
import { CASH_TYPES, ASSET_TYPES, CATEGORIES, TRANSACTION_LABELS } from '@/composable/island/useTransactionConstants'

const props = defineProps({
  editingTransaction: { type: Object, required: true },
  editTransaction: { type: Object, required: true },
  isCashIsland: { type: Boolean, default: false },
  islandCurrency: { type: String, default: 'MXN' },
  availableDestinations: { type: Array, default: () => [] },
  savingTransaction: { type: Boolean, default: false },
  transactionError: { type: String, default: '' },
})

const emit = defineEmits(['update:editTransaction', 'submit', 'cancel'])

const isEditingTransfer = computed(() => props.editingTransaction?.type === 'withdrawal')

function update(field, value) {
  emit('update:editTransaction', { ...props.editTransaction, [field]: value })
}
</script>

<template>
  <form class="island-info__edit-form" @submit.prevent="$emit('submit')">
    <strong>Editando {{ TRANSACTION_LABELS[editingTransaction.type] ?? editingTransaction.type }}</strong>
    <label><span>Fecha</span><input :value="editTransaction.date" @input="update('date', $event.target.value)" type="date" required /></label>
    <label v-if="isCashIsland"><span>Monto</span><input :value="editTransaction.amount" @input="update('amount', $event.target.value)" type="number" min="0.01" step="0.01" required /></label>
    <template v-else>
      <label>
        <span>Cantidad</span>
        <input :value="editTransaction.quantity" @input="update('quantity', $event.target.value)" type="number" min="0.00000001" step="0.00000001" required />
      </label>
      <label>
        <span>Precio unitario ({{ islandCurrency }})</span>
        <input :value="editTransaction.price_at_tx" @input="update('price_at_tx', $event.target.value)" type="number" min="0.01" step="0.01" required />
      </label>
    </template>
    <label v-if="editingTransaction.type === 'expense'">
      <span>Categoría</span>
      <select :value="editTransaction.category" @change="update('category', $event.target.value)" required>
        <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option>
      </select>
    </label>
    <label v-if="isEditingTransfer" class="island-info__destination">
      <span>Transferir a</span>
      <select :value="editTransaction.destinationIslandId" @change="update('destinationIslandId', $event.target.value)" required>
        <option v-for="destination in availableDestinations" :key="destination.id" :value="String(destination.id)">{{ destination.name }}</option>
      </select>
    </label>
    <label class="island-info__note"><span>Nota</span><input :value="editTransaction.note" @input="update('note', $event.target.value)" type="text" maxlength="255" /></label>
    <p v-if="transactionError" class="island-info__form-error">{{ transactionError }}</p>
    <div class="island-info__edit-actions">
      <button type="button" class="island-info__secondary-button" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" :disabled="savingTransaction || (isEditingTransfer && !editTransaction.destinationIslandId)">
        {{ savingTransaction ? 'Guardando…' : 'Guardar cambios' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.island-info__edit-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 13px; padding: 15px; border: 1px solid color-mix(in oklab, var(--tag-coral) 38%, transparent); border-radius: 15px; background: color-mix(in oklab, var(--tag-coral) 8%, var(--label)); }
.island-info__edit-form > strong, .island-info__edit-actions { grid-column: 1 / -1; }
.island-info__edit-form label { display: flex; flex-direction: column; gap: 4px; }
.island-info__edit-form label span { color: var(--label-ink); font-size: 11px; font-weight: 700; }
.island-info__edit-form input, .island-info__edit-form select { width: 100%; min-height: 37px; padding: 0 9px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 17%, transparent); border-radius: 9px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 12px; }
.island-info__edit-actions { display: flex; justify-content: flex-end; gap: 8px; }
.island-info__edit-actions button { min-height: 36px; padding: 0 12px; border: 0; border-radius: 9px; color: var(--label); background: var(--ocean-deep); font: 700 12px var(--font-sans); cursor: pointer; }
.island-info__edit-actions .island-info__secondary-button { color: var(--label-ink); background: transparent; border: 1px solid color-mix(in oklab, var(--ocean-deep) 23%, transparent); }
.island-info__form-error { margin: 8px 0 0; color: #a13d30; font-size: 12px; grid-column: 1 / -1; }
@media (max-width: 420px) { .island-info__edit-form { grid-template-columns: 1fr; } }
</style>