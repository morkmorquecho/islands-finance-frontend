<script setup>
import { computed } from 'vue'
import { formatAmount } from '@/composable/island/useFormatters'
import { CASH_TYPES, ASSET_TYPES, CATEGORIES, TRANSACTION_LABELS } from '@/composable/island/useTransactionConstants'
import IslandTransactionEditForm from './IslandTransactionEditForm.vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  filters: { type: Object, required: true },
  isCashIsland: { type: Boolean, default: false },
  currency: { type: String, default: 'MXN' },
  islandCurrency: { type: String, default: 'MXN' },
  availableDestinations: { type: Array, default: () => [] },
  editingTransaction: { type: Object, default: null },
  editTransaction: { type: Object, default: null },
  savingTransaction: { type: Boolean, default: false },
  transactionError: { type: String, default: '' },
  hasMoreTransactions: { type: Boolean, default: false },
  loadingMoreTransactions: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:filters', 'edit', 'cancel-edit', 'save-edit',
  'update:editTransaction', 'load-more',
])

const transactionTypes = computed(() => props.isCashIsland ? CASH_TYPES : ASSET_TYPES)

function updateFilter(field, value) {
  emit('update:filters', { ...props.filters, [field]: value })
}
</script>

<template>
  <section class="island-info__activity">
    <div class="island-info__section-heading">
      <h3>Movimientos</h3>
      <span>{{ transactions.length }}</span>
    </div>
    <div class="island-info__filters">
      <select :value="filters.type" @change="updateFilter('type', $event.target.value)" aria-label="Filtrar por tipo">
        <option value="">Todos los tipos</option>
        <option v-for="type in transactionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
      </select>
      <select v-if="isCashIsland" :value="filters.category" @change="updateFilter('category', $event.target.value)" aria-label="Filtrar por categoría">
        <option value="">Todas las categorías</option>
        <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option>
      </select>
      <select :value="filters.ordering" @change="updateFilter('ordering', $event.target.value)" aria-label="Ordenar movimientos">
        <option value="-date">Fecha: reciente primero</option>
        <option value="date">Fecha: antigua primero</option>
        <option value="-created_at">Creación: reciente primero</option>
        <option value="created_at">Creación: antigua primero</option>
      </select>
    </div>

    <IslandTransactionEditForm
      v-if="editingTransaction"
      :editing-transaction="editingTransaction"
      :edit-transaction="editTransaction"
      :is-cash-island="isCashIsland"
      :island-currency="islandCurrency"
      :available-destinations="availableDestinations"
      :saving-transaction="savingTransaction"
      :transaction-error="transactionError"
      @update:edit-transaction="$emit('update:editTransaction', $event)"
      @submit="$emit('save-edit')"
      @cancel="$emit('cancel-edit')"
    />

    <ul v-if="transactions.length">
      <li v-for="transaction in transactions" :key="transaction.id">
        <div>
          <strong>{{ TRANSACTION_LABELS[transaction.type] ?? transaction.type }}</strong>
          <span>{{ transaction.date }}</span>
        </div>
        <div class="island-info__transaction-actions">
          <b v-if="isCashIsland">{{ formatAmount(transaction.amount, currency) }}</b>
          <b v-else>{{ transaction.quantity }} × {{ formatAmount(transaction.price_at_tx, islandCurrency) }}</b>
          <button type="button" aria-label="Editar movimiento" @click="$emit('edit', transaction)">Editar</button>
        </div>
      </li>
    </ul>
    <p v-else-if="!loadingMoreTransactions" class="island-info__empty">No hay movimientos con estos filtros.</p>
    <button
      v-if="hasMoreTransactions"
      type="button"
      class="island-info__more-button"
      :disabled="loadingMoreTransactions"
      @click="$emit('load-more')"
    >
      {{ loadingMoreTransactions ? 'Cargando…' : 'Ver más movimientos' }}
    </button>
  </section>
</template>

<style scoped>
.island-info__activity { margin-top: 24px; }
.island-info__section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.island-info__section-heading span { display: grid; place-items: center; min-width: 24px; height: 24px; border-radius: 50%; color: var(--label); background: var(--tag-coral); font-size: 12px; font-weight: 700; }
h3 { margin: 0; font-family: var(--font-display); font-size: 19px; }
.island-info__filters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.island-info__filters select:last-child { grid-column: 1 / -1; }
.island-info__filters select { width: 100%; min-height: 37px; padding: 0 9px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 17%, transparent); border-radius: 9px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 12px; }
ul { display: flex; flex-direction: column; gap: 7px; padding: 0; margin: 0; list-style: none; }
li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 12px; border-radius: 12px; background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); }
li div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
li strong { overflow: hidden; color: var(--label-ink); font-size: 13px; text-overflow: ellipsis; text-transform: capitalize; white-space: nowrap; }
li span { color: color-mix(in oklab, var(--label-ink) 68%, transparent); font-size: 11px; }
li b { flex-shrink: 0; color: var(--label-ink); font-size: 13px; }
.island-info__transaction-actions { display: flex; align-items: center; gap: 9px; }
.island-info__transaction-actions button { padding: 3px 7px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 27%, transparent); border-radius: 7px; color: var(--ocean-deep); background: transparent; font: 700 11px var(--font-sans); cursor: pointer; }
.island-info__empty { margin: 0; padding: 17px; border-radius: 12px; color: color-mix(in oklab, var(--label-ink) 70%, transparent); background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); font-size: 13px; text-align: center; }
.island-info__more-button { display: block; width: 100%; margin-top: 10px; min-height: 36px; padding: 0 12px; border: 0; border-radius: 9px; color: var(--label); background: var(--ocean-deep); font: 700 12px var(--font-sans); cursor: pointer; }
@media (max-width: 420px) { .island-info__filters { grid-template-columns: 1fr; } .island-info__filters select:last-child { grid-column: auto; } }
</style>