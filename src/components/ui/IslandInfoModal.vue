<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import islandsService from '@/services/islands.service'
import transactionsService from '@/services/transactions.service'
import goalsService from '@/services/goals.service'

const props = defineProps({ islandId: { type: String, required: true } })

const island = ref(null)
const transactions = ref([])
const goals = ref([])
const destinationIslands = ref([])
const transactionPage = ref(1)
const hasMoreTransactions = ref(false)
const loadingMoreTransactions = ref(false)
const transactionFilters = ref({ type: '', category: '', ordering: '-date' })
const editingTransaction = ref(null)
const editTransaction = ref({ date: '', amount: '', quantity: '', price_at_tx: '', category: '', note: '', destinationIslandId: '' })
const loading = ref(true)
const error = ref('')
const savingTransaction = ref(false)
const transactionError = ref('')
const newTransaction = ref({
  type: 'deposit',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  quantity: '',
  price_at_tx: '',
  category: '',
  note: '',
  destinationIslandId: '',
})

const CASH_TYPES = [
  { value: 'deposit', label: 'Ingreso de dinero' },
  { value: 'withdrawal', label: 'Retiro' },
  { value: 'expense', label: 'Gasto' },
]
const ASSET_TYPES = [
  { value: 'buy', label: 'Compra' },
  { value: 'sell', label: 'Venta' },
]
const CATEGORIES = [
  { value: 'food', label: 'Comida' },
  { value: 'transport', label: 'Transporte' },
  { value: 'subscriptions', label: 'Suscripciones' },
  { value: 'housing', label: 'Vivienda' },
  { value: 'leisure', label: 'Ocio' },
  { value: 'health', label: 'Salud' },
  { value: 'clothing', label: 'Ropa' },
  { value: 'travel', label: 'Viajes' },
  { value: 'education', label: 'Educación' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'family_events', label: 'Eventos familiares' },
  { value: 'taxes', label: 'Impuestos' },
  { value: 'work', label: 'Trabajo' },
  { value: 'other', label: 'Otro' },
]
const TRANSACTION_LABELS = Object.fromEntries([...CASH_TYPES, ...ASSET_TYPES].map(({ value, label }) => [value, label]))

const formatAmount = (value, currency = 'MXN') => {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

const value = computed(() => island.value?.summary?.value_base)
const currency = computed(() => island.value?.summary?.currency ?? island.value?.currency ?? 'MXN')
const islandType = computed(() => island.value?.kind === 'cash' ? 'Efectivo y ahorro' : 'Activo de inversión')
const isCashIsland = computed(() => island.value?.kind === 'cash')
const transactionTypes = computed(() => isCashIsland.value ? CASH_TYPES : ASSET_TYPES)
const isExpense = computed(() => newTransaction.value.type === 'expense')
const isTransfer = computed(() => newTransaction.value.type === 'withdrawal')
const isEditingTransfer = computed(() => editingTransaction.value?.type === 'withdrawal')
const activeGoals = computed(() => goals.value.filter((goal) => goal.active).length)
const availableDestinations = computed(() => destinationIslands.value
  .filter((candidate) => String(candidate.id) !== props.islandId && candidate.kind === 'cash')
  .sort((first, second) => {
    if (first.name?.toLocaleLowerCase() === 'efectivo') return -1
    if (second.name?.toLocaleLowerCase() === 'efectivo') return 1
    return first.name.localeCompare(second.name, 'es')
  }))

async function loadDestinationIslands() {
  try {
    const data = await islandsService.list({ kind: 'cash' })
    destinationIslands.value = data.results ?? []
    newTransaction.value.destinationIslandId = String(availableDestinations.value[0]?.id ?? '')
  } catch {
    destinationIslands.value = []
  }
}

function transactionParams(page) {
  const params = { island: props.islandId, page, ordering: transactionFilters.value.ordering }
  if (transactionFilters.value.type) params.type = transactionFilters.value.type
  if (transactionFilters.value.category) params.category = transactionFilters.value.category
  return params
}

async function loadTransactions({ reset = false } = {}) {
  if (reset) {
    transactionPage.value = 1
    transactions.value = []
  }
  loadingMoreTransactions.value = true
  try {
    const data = await transactionsService.list(transactionParams(transactionPage.value))
    const incoming = data.results ?? []
    transactions.value = reset ? incoming : [...transactions.value, ...incoming]
    hasMoreTransactions.value = Boolean(data.next)
  } finally {
    loadingMoreTransactions.value = false
  }
}

async function loadMoreTransactions() {
  if (!hasMoreTransactions.value || loadingMoreTransactions.value) return
  transactionPage.value += 1
  await loadTransactions()
}

async function loadIsland() {
  loading.value = true
  error.value = ''
  console.log('[loadIsland] start', props.islandId)
  try {
    const [islandData, goalsData] = await Promise.all([
      islandsService.retrieve(props.islandId),
      goalsService.list({ island: props.islandId }),
    ])
    console.log('[loadIsland] resolved', { islandData, goalsData })
    island.value = islandData
    goals.value = goalsData.results ?? []
    newTransaction.value.type = islandData.kind === 'cash' ? 'deposit' : 'buy'
    await loadDestinationIslands()
    await loadTransactions({ reset: true })
  } catch (err) {
    console.log('[loadIsland] error', err)
    error.value = err.message ?? 'No fue posible cargar la información de esta isla.'
  } finally {
    console.log('[loadIsland] finally, loading=false')
    loading.value = false
  }
}

function createTransferId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function transferMetadata(note, transferId, destinationId) {
  return `${note ? `${note} · ` : ''}[transfer:${transferId};destination:${destinationId}]`
}

function transferDestinationId(transaction) {
  return transaction?.note?.match(/\[transfer:[^;\]]+;destination:([^\]]+)\]/)?.[1] ?? ''
}

async function createTransaction() {
  savingTransaction.value = true
  transactionError.value = ''
  let withdrawalCreated = false
  try {
    const payload = {
      island: props.islandId,
      type: newTransaction.value.type,
      date: newTransaction.value.date,
      note: newTransaction.value.note,
    }

    if (isCashIsland.value) {
      payload.amount = newTransaction.value.amount
      if (isExpense.value) payload.category = newTransaction.value.category
    } else {
      payload.quantity = newTransaction.value.quantity
      payload.price_at_tx = newTransaction.value.price_at_tx
    }

    if (isTransfer.value) {
      const transferId = createTransferId()
      const destination = availableDestinations.value.find((candidate) => String(candidate.id) === newTransaction.value.destinationIslandId)
      payload.note = transferMetadata(newTransaction.value.note, transferId, newTransaction.value.destinationIslandId)
      await transactionsService.create(payload)
      withdrawalCreated = true
      await transactionsService.create({
        island: newTransaction.value.destinationIslandId,
        type: 'deposit',
        date: newTransaction.value.date,
        amount: newTransaction.value.amount,
        note: `Transferencia desde ${island.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${newTransaction.value.destinationIslandId}]`,
      })
    } else {
      await transactionsService.create(payload)
    }
    newTransaction.value = {
      type: isCashIsland.value ? 'deposit' : 'buy',
      date: new Date().toISOString().slice(0, 10),
      amount: '', quantity: '', price_at_tx: '', category: '', note: '', destinationIslandId: '',
    }
    await loadIsland()
  } catch (err) {
    transactionError.value = withdrawalCreated
      ? 'El retiro se registró, pero no se pudo completar el depósito en la isla destino. Revisa tus movimientos antes de intentarlo de nuevo.'
      : err.message ?? 'No se pudo guardar el movimiento.'
  } finally {
    savingTransaction.value = false
  }
}

function startEditing(transaction) {
  editingTransaction.value = transaction
  editTransaction.value = {
    date: transaction.date,
    amount: transaction.amount ?? '',
    quantity: transaction.quantity ?? '',
    price_at_tx: transaction.price_at_tx ?? '',
    category: transaction.category ?? '',
    note: transaction.note?.replace(/\s*\[transfer:[^\]]+\]$/, '') ?? '',
    destinationIslandId: transferDestinationId(transaction) || String(availableDestinations.value[0]?.id ?? ''),
  }
}

function cancelEditing() {
  editingTransaction.value = null
}

async function findTransferDeposit(withdrawal) {
  const destinationId = transferDestinationId(withdrawal)
  if (!destinationId) return null
  const transferId = withdrawal.note?.match(/\[transfer:([^;\]]+)/)?.[1]
  const data = await transactionsService.list({ island: destinationId, type: 'deposit', ordering: '-created_at' })
  return (data.results ?? []).find((transaction) => transaction.note?.includes(`[transfer:${transferId};`)) ?? null
}

async function saveEdit() {
  const original = editingTransaction.value
  if (!original) return
  savingTransaction.value = true
  transactionError.value = ''
  try {
    const payload = { date: editTransaction.value.date, note: editTransaction.value.note }
    if (isCashIsland.value) {
      payload.amount = editTransaction.value.amount
      if (original.type === 'expense') payload.category = editTransaction.value.category
    } else {
      payload.quantity = editTransaction.value.quantity
      payload.price_at_tx = editTransaction.value.price_at_tx
    }

    if (original.type === 'withdrawal') {
      const previousDestinationId = transferDestinationId(original)
      const transferId = original.note?.match(/\[transfer:([^;\]]+)/)?.[1] ?? createTransferId()
      const destination = availableDestinations.value.find((candidate) => String(candidate.id) === editTransaction.value.destinationIslandId)
      const pairedDeposit = await findTransferDeposit(original)
      payload.note = transferMetadata(editTransaction.value.note, transferId, editTransaction.value.destinationIslandId)

      if (previousDestinationId === editTransaction.value.destinationIslandId && pairedDeposit) {
        await Promise.all([
          transactionsService.partialUpdate(original.id, payload),
          transactionsService.partialUpdate(pairedDeposit.id, {
            date: editTransaction.value.date,
            amount: editTransaction.value.amount,
            note: `Transferencia desde ${island.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${editTransaction.value.destinationIslandId}]`,
          }),
        ])
      } else {
        const createdDeposit = await transactionsService.create({
          island: editTransaction.value.destinationIslandId,
          type: 'deposit',
          date: editTransaction.value.date,
          amount: editTransaction.value.amount,
          note: `Transferencia desde ${island.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${editTransaction.value.destinationIslandId}]`,
        })
        await transactionsService.partialUpdate(original.id, payload)
        if (pairedDeposit) await transactionsService.destroy(pairedDeposit.id)
        void createdDeposit
      }
    } else {
      await transactionsService.partialUpdate(original.id, payload)
    }

    cancelEditing()
    await loadIsland()
  } catch (err) {
    transactionError.value = err.message ?? 'No se pudo actualizar el movimiento.'
  } finally {
    savingTransaction.value = false
  }
}

watch(() => props.islandId, loadIsland)
watch(transactionFilters, () => loadTransactions({ reset: true }), { deep: true })
onMounted(loadIsland)
</script>

<template>
  <div class="island-info">
    <div class="island-info__hero">
      <span class="island-info__eyebrow">Información de la isla</span>
      <h2 v-if="!loading">{{ island?.name }}</h2>
      <div v-if="!loading" class="island-info__balance">
        <span>Total de la isla</span>
        <strong>{{ formatAmount(value, currency) }}</strong>
      </div>
    </div>

    <div class="island-info__content">
      <p v-if="loading" class="island-info__state">Cargando información…</p>
      <p v-else-if="error" class="island-info__state island-info__state--error">{{ error }}</p>

      <template v-else>
        <dl class="island-info__facts">
          <div><dt>Tipo</dt><dd>{{ islandType }}</dd></div>
          <div><dt>Moneda</dt><dd>{{ currency }}</dd></div>
          <div v-if="island?.symbol"><dt>Símbolo</dt><dd>{{ island.symbol }}</dd></div>
          <div v-if="island?.annual_rate"><dt>Tasa anual</dt><dd>{{ (Number(island.annual_rate) * 100).toFixed(2) }}%</dd></div>
          <div><dt>Metas activas</dt><dd>{{ activeGoals }}</dd></div>
          <div><dt>Ganancia por interés</dt><dd>{{ formatAmount(island?.summary?.interest_earned, currency) }}</dd></div>
        </dl>

        <section class="island-info__transaction">
          <div class="island-info__section-heading">
            <h3>Registrar movimiento</h3>
          </div>
          <form @submit.prevent="createTransaction">
            <label>
              <span>Movimiento</span>
              <select v-model="newTransaction.type">
                <option v-for="type in transactionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </label>
            <label>
              <span>Fecha</span>
              <input v-model="newTransaction.date" type="date" required />
            </label>
            <label v-if="isCashIsland">
              <span>Monto</span>
              <input v-model="newTransaction.amount" type="number" min="0.01" step="0.01" :placeholder="`Monto en ${currency}`" required />
            </label>
            <template v-else>
              <label>
                <span>Cantidad</span>
                <input v-model="newTransaction.quantity" type="number" min="0.00000001" step="0.00000001" required />
              </label>
              <label>
                <span>Precio unitario</span>
                <input v-model="newTransaction.price_at_tx" type="number" min="0.01" step="0.01" required />
              </label>
            </template>
            <label v-if="isExpense">
              <span>Categoría</span>
              <select v-model="newTransaction.category" required>
                <option value="" disabled>Selecciona una categoría</option>
                <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option>
              </select>
            </label>
            <label v-if="isTransfer" class="island-info__destination">
              <span>Transferir a</span>
              <select v-model="newTransaction.destinationIslandId" required :disabled="!availableDestinations.length">
                <option v-if="!availableDestinations.length" value="">No hay otra isla de efectivo disponible</option>
                <option v-for="destination in availableDestinations" :key="destination.id" :value="String(destination.id)">{{ destination.name }}</option>
              </select>
              <small>Se depositará el mismo monto en la isla seleccionada.</small>
            </label>
            <label class="island-info__note">
              <span>Nota <em>opcional</em></span>
              <input v-model="newTransaction.note" type="text" maxlength="255" placeholder="Ej. depósito de nómina" />
            </label>
            <p v-if="transactionError" class="island-info__form-error">{{ transactionError }}</p>
            <button type="submit" :disabled="savingTransaction || (isTransfer && !newTransaction.destinationIslandId)">
              {{ savingTransaction ? 'Guardando…' : 'Guardar movimiento' }}
            </button>
          </form>
        </section>

        <section class="island-info__activity">
          <div class="island-info__section-heading">
            <h3>Movimientos</h3>
            <span>{{ transactions.length }}</span>
          </div>
          <div class="island-info__filters">
            <select v-model="transactionFilters.type" aria-label="Filtrar por tipo">
              <option value="">Todos los tipos</option>
              <option v-for="type in transactionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
            <select v-if="isCashIsland" v-model="transactionFilters.category" aria-label="Filtrar por categoría">
              <option value="">Todas las categorías</option>
              <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option>
            </select>
            <select v-model="transactionFilters.ordering" aria-label="Ordenar movimientos">
              <option value="-date">Fecha: reciente primero</option>
              <option value="date">Fecha: antigua primero</option>
              <option value="-created_at">Creación: reciente primero</option>
              <option value="created_at">Creación: antigua primero</option>
            </select>
          </div>
          <form v-if="editingTransaction" class="island-info__edit-form" @submit.prevent="saveEdit">
            <strong>Editando {{ TRANSACTION_LABELS[editingTransaction.type] ?? editingTransaction.type }}</strong>
            <label><span>Fecha</span><input v-model="editTransaction.date" type="date" required /></label>
            <label v-if="isCashIsland"><span>Monto</span><input v-model="editTransaction.amount" type="number" min="0.01" step="0.01" required /></label>
            <template v-else>
              <label><span>Cantidad</span><input v-model="editTransaction.quantity" type="number" min="0.00000001" step="0.00000001" required /></label>
              <label><span>Precio unitario</span><input v-model="editTransaction.price_at_tx" type="number" min="0.01" step="0.01" required /></label>
            </template>
            <label v-if="editingTransaction.type === 'expense'"><span>Categoría</span><select v-model="editTransaction.category" required><option v-for="category in CATEGORIES" :key="category.value" :value="category.value">{{ category.label }}</option></select></label>
            <label v-if="isEditingTransfer" class="island-info__destination"><span>Transferir a</span><select v-model="editTransaction.destinationIslandId" required><option v-for="destination in availableDestinations" :key="destination.id" :value="String(destination.id)">{{ destination.name }}</option></select></label>
            <label class="island-info__note"><span>Nota</span><input v-model="editTransaction.note" type="text" maxlength="255" /></label>
            <p v-if="transactionError" class="island-info__form-error">{{ transactionError }}</p>
            <div class="island-info__edit-actions"><button type="button" class="island-info__secondary-button" @click="cancelEditing">Cancelar</button><button type="submit" :disabled="savingTransaction || (isEditingTransfer && !editTransaction.destinationIslandId)">{{ savingTransaction ? 'Guardando…' : 'Guardar cambios' }}</button></div>
          </form>
          <ul v-if="transactions.length">
            <li v-for="transaction in transactions" :key="transaction.id">
              <div>
                <strong>{{ TRANSACTION_LABELS[transaction.type] ?? transaction.type }}</strong>
                <span>{{ transaction.date }}</span>
              </div>
              <div class="island-info__transaction-actions"><b>{{ formatAmount(transaction.amount ?? transaction.quantity, currency) }}</b><button type="button" aria-label="Editar movimiento" @click="startEditing(transaction)">Editar</button></div>
            </li>
          </ul>
          <p v-else-if="!loadingMoreTransactions" class="island-info__empty">No hay movimientos con estos filtros.</p>
          <button v-if="hasMoreTransactions" type="button" class="island-info__more-button" :disabled="loadingMoreTransactions" @click="loadMoreTransactions">{{ loadingMoreTransactions ? 'Cargando…' : 'Ver más movimientos' }}</button>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.island-info__hero { padding: 40px 34px 30px; color: var(--label); background: linear-gradient(145deg, var(--ocean-deep), var(--tag-teal)); border-radius: 26px 26px 34% 34%; }
.island-info__eyebrow { display: block; margin-bottom: 8px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; opacity: .78; }
h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 6vw, 38px); line-height: 1; }
.island-info__balance { display: flex; flex-direction: column; gap: 3px; margin-top: 24px; }
.island-info__balance span { font-size: 13px; opacity: .8; }
.island-info__balance strong { font-size: 26px; letter-spacing: -.04em; }
.island-info__content { padding: 24px 28px 30px; }
.island-info__state { margin: 12px 0; color: var(--label-ink); text-align: center; }
.island-info__state--error { color: #a13d30; }
.island-info__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0; }
.island-info__facts div { min-height: 65px; padding: 11px 13px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 12%, transparent); border-radius: 14px; background: color-mix(in oklab, var(--sky-top) 18%, var(--label)); }
dt { color: color-mix(in oklab, var(--label-ink) 65%, transparent); font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
dd { margin: 5px 0 0; color: var(--label-ink); font-size: 14px; font-weight: 700; }
.island-info__activity { margin-top: 24px; }
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
.island-info__form-error { margin: -2px 0 0; color: #a13d30; font-size: 12px; }
.island-info__section-heading span { display: grid; place-items: center; min-width: 24px; height: 24px; border-radius: 50%; color: var(--label); background: var(--tag-coral); font-size: 12px; font-weight: 700; }
.island-info__filters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.island-info__filters select:last-child { grid-column: 1 / -1; }
.island-info__filters select, .island-info__edit-form input, .island-info__edit-form select { width: 100%; min-height: 37px; padding: 0 9px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 17%, transparent); border-radius: 9px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 12px; }
.island-info__edit-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 13px; padding: 15px; border: 1px solid color-mix(in oklab, var(--tag-coral) 38%, transparent); border-radius: 15px; background: color-mix(in oklab, var(--tag-coral) 8%, var(--label)); }
.island-info__edit-form > strong, .island-info__edit-actions { grid-column: 1 / -1; }
.island-info__edit-form label { display: flex; flex-direction: column; gap: 4px; }
.island-info__edit-form label span { color: var(--label-ink); font-size: 11px; font-weight: 700; }
.island-info__edit-actions { display: flex; justify-content: flex-end; gap: 8px; }
.island-info__edit-actions button, .island-info__more-button { min-height: 36px; padding: 0 12px; border: 0; border-radius: 9px; color: var(--label); background: var(--ocean-deep); font: 700 12px var(--font-sans); cursor: pointer; }
.island-info__edit-actions .island-info__secondary-button { color: var(--label-ink); background: transparent; border: 1px solid color-mix(in oklab, var(--ocean-deep) 23%, transparent); }
.island-info__transaction-actions { display: flex; align-items: center; gap: 9px; }
.island-info__transaction-actions button { padding: 3px 7px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 27%, transparent); border-radius: 7px; color: var(--ocean-deep); background: transparent; font: 700 11px var(--font-sans); cursor: pointer; }
.island-info__more-button { display: block; width: 100%; margin-top: 10px; }
ul { display: flex; flex-direction: column; gap: 7px; padding: 0; margin: 0; list-style: none; }
li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 12px; border-radius: 12px; background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); }
li div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
li strong { overflow: hidden; color: var(--label-ink); font-size: 13px; text-overflow: ellipsis; text-transform: capitalize; white-space: nowrap; }
li span { color: color-mix(in oklab, var(--label-ink) 68%, transparent); font-size: 11px; }
li b { flex-shrink: 0; color: var(--label-ink); font-size: 13px; }
.island-info__empty { margin: 0; padding: 17px; border-radius: 12px; color: color-mix(in oklab, var(--label-ink) 70%, transparent); background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); font-size: 13px; text-align: center; }
@media (max-width: 420px) { .island-info__hero { padding: 36px 24px 27px; } .island-info__content { padding: 20px; } .island-info__facts, .island-info__transaction form, .island-info__filters, .island-info__edit-form { grid-template-columns: 1fr; } .island-info__filters select:last-child { grid-column: auto; } }
</style>
