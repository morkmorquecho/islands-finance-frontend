<script setup>
import { computed } from 'vue'
import { CASH_TYPES, ASSET_TYPES, CATEGORIES } from '@/composable/island/useTransactionConstants'
import { formatAmount } from '@/composable/island/useFormatters'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isCashIsland: { type: Boolean, default: false },
  currency: { type: String, default: 'MXN' },
  islandCurrency: { type: String, default: 'MXN' },
  availableDestinations: { type: Array, default: () => [] },
  savingTransaction: { type: Boolean, default: false },
  transactionError: { type: String, default: '' },
  /** Total disponible en la isla (moneda base, ya normalizado). */
  availableBalance: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const transactionTypes = computed(() => props.isCashIsland ? CASH_TYPES : ASSET_TYPES)
const isExpense = computed(() => props.modelValue.type === 'expense')
const isTransfer = computed(() => props.modelValue.type === 'withdrawal')
const isDebit = computed(() => isExpense.value || isTransfer.value)

/* ── Validación de monto ───────────────────────────────────── */

const amountNumber = computed(() => {
  const n = Number(props.modelValue.amount)
  return Number.isFinite(n) ? n : 0
})

/** Solo aplica cuando el movimiento resta saldo (gasto o retiro). */
const exceedsBalance = computed(() =>
  isDebit.value && amountNumber.value > props.availableBalance
)

/** Mensaje legible para el usuario. */
const amountError = computed(() => {
  if (!isDebit.value) return ''
  if (amountNumber.value <= 0) return ''
  if (!exceedsBalance.value) return ''
  return `El monto no puede superar el total disponible (${formatAmount(props.availableBalance, props.currency)}).`
})

/** Validación final para deshabilitar el submit. */
const isSubmitDisabled = computed(() =>
  props.savingTransaction ||
  exceedsBalance.value ||
  (isTransfer.value && !props.modelValue.destinationIslandId)
)

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <section class="island-info__transaction">
    <div class="island-info__section-heading">
      <h3>Registrar movimiento</h3>
    </div>
    <form @submit.prevent="$emit('submit')">
      <label>
        <span>Movimiento</span>
        <select :value="modelValue.type" @change="update('type', $event.target.value)">
          <option v-for="type in transactionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
        </select>
      </label>

      <label>
        <span>Fecha</span>
        <input :value="modelValue.date" @input="update('date', $event.target.value)" type="date" required />
      </label>

      <label v-if="isCashIsland">
        <span>Monto</span>
        <input
          :value="modelValue.amount"
          @input="update('amount', $event.target.value)"
          type="number"
          min="0.01"
          step="0.01"
          :max="isDebit ? availableBalance : undefined"
          :placeholder="`Monto en ${currency}`"
          :class="{ 'is-invalid': exceedsBalance }"
          :aria-invalid="exceedsBalance"
          :aria-describedby="amountError ? 'amount-error' : undefined"
          required
        />
        <small v-if="isDebit" class="island-info__hint">
          Disponible: {{ formatAmount(availableBalance, currency) }}
        </small>
      </label>

      <template v-else>
        <label>
          <span>Cantidad</span>
          <input :value="modelValue.quantity" @input="update('quantity', $event.target.value)" type="number" min="0.00000001" step="0.00000001" required />
        </label>
        <label>
          <span>Precio unitario ({{ islandCurrency }})</span>
          <input :value="modelValue.price_at_tx" @input="update('price_at_tx', $event.target.value)" type="number" min="0.01" step="0.01" required />
        </label>
      </template>

      <label v-if="isExpense">
        <span>Categoría</span>
        <select :value="modelValue.category" @change="update('category', $event.target.value)" required>
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option>
        </select>
      </label>

      <label v-if="isTransfer" class="island-info__destination">
        <span>Transferir a</span>
        <select :value="modelValue.destinationIslandId" @change="update('destinationIslandId', $event.target.value)" required :disabled="!availableDestinations.length">
          <option v-if="!availableDestinations.length" value="">No hay otra isla de efectivo disponible</option>
          <option v-for="destination in availableDestinations" :key="destination.id" :value="String(destination.id)">{{ destination.name }}</option>
        </select>
        <small>Se depositará el mismo monto en la isla seleccionada.</small>
      </label>

      <label class="island-info__note">
        <span>Nota <em>opcional</em></span>
        <input :value="modelValue.note" @input="update('note', $event.target.value)" type="text" maxlength="255" placeholder="Ej. depósito de nómina" />
      </label>

      <p v-if="amountError" id="amount-error" class="island-info__form-error">{{ amountError }}</p>
      <p v-else-if="transactionError" class="island-info__form-error">{{ transactionError }}</p>

      <button type="submit" :disabled="isSubmitDisabled">
        {{ savingTransaction ? 'Guardando…' : 'Guardar movimiento' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.island-info__transaction { margin-top: 24px; padding: 18px; border-radius: 18px; background: color-mix(in oklab, var(--tag-teal) 9%, var(--label)); }
.island-info__section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h3 { margin: 0; font-family: var(--font-display); font-size: 19px; }
.island-info__transaction form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
.island-info__transaction label { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.island-info__transaction label span { color: var(--label-ink); font-size: 11px; font-weight: 700; }
.island-info__transaction em { color: color-mix(in oklab, var(--label-ink) 62%, transparent); font-style: normal; font-weight: 400; }
.island-info__transaction input, .island-info__transaction select { width: 100%; min-height: 40px; padding: 0 10px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 19%, transparent); border-radius: 9px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 13px; }
.island-info__note, .island-info__transaction button, .island-info__form-error { grid-column: 1 / -1; }
.island-info__destination { grid-column: 1 / -1; }
.island-info__destination small { color: color-mix(in oklab, var(--label-ink) 70%, transparent); font-size: 11px; line-height: 1.3; }
.island-info__transaction button { min-height: 42px; border: 0; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font: 700 13px var(--font-sans); cursor: pointer; transition: background 160ms ease, transform 160ms ease; }
.island-info__transaction button:hover:not(:disabled) { background: var(--tag-teal); transform: translateY(-1px); }
.island-info__transaction button:disabled { opacity: .65; cursor: wait; }
.island-info__form-error { margin: 8px 0 0; color: #a13d30; font-size: 12px; }
@media (max-width: 420px) { .island-info__transaction form { grid-template-columns: 1fr; } }


.island-info__transaction input.is-invalid {
  border-color: #d0463a;
  background: color-mix(in oklab, #d0463a 6%, var(--label));
}

.island-info__transaction input.is-invalid:focus {
  outline: 2px solid color-mix(in oklab, #d0463a 55%, transparent);
  outline-offset: 1px;
}

.island-info__hint {
  color: color-mix(in oklab, var(--label-ink) 65%, transparent);
  font-size: 11px;
  font-weight: 500;
}
</style>