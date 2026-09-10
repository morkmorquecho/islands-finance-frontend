<script setup>
import { onMounted, ref } from 'vue'
import islandsService from '@/services/islands.service'
import transactionsService from '@/services/transactions.service'
import goalsService from '@/services/goals.service'

const props = defineProps({ id: { type: String, required: true } })

const island = ref(null)
const transactions = ref([])
const goals = ref([])
const loading = ref(true)
const errorMsg = ref('')

const newTransaction = ref({
  island: props.id,
  type: 'deposit',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  quantity: '',
  price_at_tx: '',
  category: '',
  note: '',
})
const creatingTx = ref(false)

const newGoal = ref({
  island: props.id,
  target_amount: '',
  frequency_days: 15,
  start_date: new Date().toISOString().slice(0, 10),
})
const creatingGoal = ref(false)

function isCashIsland() {
  return island.value?.kind === 'cash'
}

async function loadAll() {
  loading.value = true
  try {
    const [islandData, txData, goalsData] = await Promise.all([
      islandsService.retrieve(props.id),
      transactionsService.list({ island: props.id, ordering: '-date' }),
      goalsService.list({ island: props.id }),
    ])
    island.value = islandData
    transactions.value = txData.results
    goals.value = goalsData.results
    newTransaction.value.type = isCashIsland() ? 'deposit' : 'buy'
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

async function createTransaction() {
  creatingTx.value = true
  errorMsg.value = ''
  try {
    const payload = { ...newTransaction.value }
    if (isCashIsland()) {
      delete payload.quantity
      delete payload.price_at_tx
      if (payload.type !== 'expense') delete payload.category
    } else {
      delete payload.amount
      delete payload.category
    }
    await transactionsService.create(payload)
    await loadAll()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    creatingTx.value = false
  }
}

async function createGoal() {
  creatingGoal.value = true
  errorMsg.value = ''
  try {
    await goalsService.create(newGoal.value)
    await loadAll()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    creatingGoal.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="island-detail">
    <router-link :to="{ name: 'dashboard' }">&larr; Volver</router-link>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="loading">Cargando...</p>

    <template v-else-if="island">
      <h1>{{ island.name }}</h1>
      <p class="summary">
        Valor: {{ island.summary?.value_base }} {{ island.summary?.currency }}
        <span v-if="island.summary?.interest_earned"> · Interés: {{ island.summary.interest_earned }}</span>
      </p>

      <section>
        <h2>Transacciones</h2>
        <ul class="tx-list">
          <li v-for="tx in transactions" :key="tx.id">
            <span class="type">{{ tx.type }}</span>
            <span class="date">{{ tx.date }}</span>
            <span class="amount">{{ tx.amount ?? tx.quantity }}</span>
          </li>
          <li v-if="!transactions.length" class="empty">Sin transacciones todavía.</li>
        </ul>

        <form class="tx-form" @submit.prevent="createTransaction">
          <select v-model="newTransaction.type">
            <template v-if="isCashIsland()">
              <option value="deposit">Depósito</option>
              <option value="withdrawal">Retiro</option>
              <option value="expense">Gasto</option>
            </template>
            <template v-else>
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </template>
          </select>

          <input v-model="newTransaction.date" type="date" required />

          <input
            v-if="isCashIsland()"
            v-model="newTransaction.amount"
            type="number"
            step="0.01"
            placeholder="Monto"
            required
          />
          <template v-else>
            <input v-model="newTransaction.quantity" type="number" step="0.00000001" placeholder="Cantidad" required />
            <input v-model="newTransaction.price_at_tx" type="number" step="0.01" placeholder="Precio unitario" required />
          </template>

          <input
            v-if="isCashIsland() && newTransaction.type === 'expense'"
            v-model="newTransaction.category"
            type="text"
            placeholder="Categoría"
          />

          <input v-model="newTransaction.note" type="text" placeholder="Nota (opcional)" />

          <button type="submit" :disabled="creatingTx">
            {{ creatingTx ? 'Guardando...' : 'Agregar transacción' }}
          </button>
        </form>
      </section>

      <section>
        <h2>Metas</h2>
        <ul class="goal-list">
          <li v-for="goal in goals" :key="goal.id">
            <span>{{ goal.target_amount }} cada {{ goal.frequency_days }} días</span>
            <span :class="goal.active ? 'active' : 'inactive'">{{ goal.active ? 'Activa' : 'Inactiva' }}</span>
          </li>
          <li v-if="!goals.length" class="empty">Sin metas todavía.</li>
        </ul>

        <form class="goal-form" @submit.prevent="createGoal">
          <input v-model="newGoal.target_amount" type="number" step="0.01" placeholder="Monto objetivo" required />
          <input v-model="newGoal.frequency_days" type="number" min="1" placeholder="Frecuencia (días)" required />
          <input v-model="newGoal.start_date" type="date" required />
          <button type="submit" :disabled="creatingGoal">
            {{ creatingGoal ? 'Guardando...' : 'Agregar meta' }}
          </button>
        </form>
      </section>
    </template>
  </div>
</template>

<style scoped>
.island-detail { padding: 2rem; max-width: 720px; margin: 0 auto; }
.summary { color: #444; margin-bottom: 1.5rem; }
section { margin-bottom: 2rem; }
.tx-list, .goal-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
.tx-list li, .goal-list li { display: flex; justify-content: space-between; padding: 0.6rem 0.8rem; border: 1px solid #ddd; border-radius: 8px; }
.empty { text-align: center; color: #888; }
.tx-form, .goal-form { display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 420px; }
.tx-form input, .tx-form select, .goal-form input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; flex: 1 1 140px; }
button { padding: 0.6rem 1rem; border: none; border-radius: 6px; background: #0f5c73; color: #fff; cursor: pointer; }
.active { color: #1f8a4c; }
.inactive { color: #999; }
.error { color: #c0392b; }
</style>
