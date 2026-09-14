<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import islandsService from '@/services/islands.service'
import transactionsService from '@/services/transactions.service'
import goalsService from '@/services/goals.service'

const props = defineProps({ islandId: { type: String, required: true } })

const island = ref(null)
const transactions = ref([])
const goals = ref([])
const loading = ref(true)
const error = ref('')

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
const latestTransactions = computed(() => transactions.value.slice(0, 3))
const activeGoals = computed(() => goals.value.filter((goal) => goal.active).length)

async function loadIsland() {
  loading.value = true
  error.value = ''
  console.log('[loadIsland] start', props.islandId)
  try {
    const [islandData, transactionData, goalsData] = await Promise.all([
      islandsService.retrieve(props.islandId),
      transactionsService.list({ island: props.islandId, ordering: '-date' }),
      goalsService.list({ island: props.islandId }),
    ])
    console.log('[loadIsland] resolved', { islandData, transactionData, goalsData })
    island.value = islandData
    transactions.value = transactionData.results ?? []
    goals.value = goalsData.results ?? []
  } catch (err) {
    console.log('[loadIsland] error', err)
    error.value = err.message ?? 'No fue posible cargar la información de esta isla.'
  } finally {
    console.log('[loadIsland] finally, loading=false')
    loading.value = false
  }
}

watch(() => props.islandId, loadIsland)
onMounted(loadIsland)
</script>

<template>
  <div class="island-info">
    <div class="island-info__hero">
      <span class="island-info__eyebrow">Información de la isla</span>
      <h2 v-if="!loading">{{ island?.name }}</h2>
      <div v-if="!loading" class="island-info__balance">
        <span>Valor actual</span>
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
          <div v-if="island?.summary?.interest_earned"><dt>Interés generado</dt><dd>{{ formatAmount(island.summary.interest_earned, currency) }}</dd></div>
        </dl>

        <section class="island-info__activity">
          <div class="island-info__section-heading">
            <h3>Últimos movimientos</h3>
            <span>{{ transactions.length }}</span>
          </div>
          <ul v-if="latestTransactions.length">
            <li v-for="transaction in latestTransactions" :key="transaction.id">
              <div>
                <strong>{{ transaction.type }}</strong>
                <span>{{ transaction.date }}</span>
              </div>
              <b>{{ formatAmount(transaction.amount ?? transaction.quantity, currency) }}</b>
            </li>
          </ul>
          <p v-else class="island-info__empty">Aún no hay movimientos registrados.</p>
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
.island-info__section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h3 { margin: 0; font-family: var(--font-display); font-size: 19px; }
.island-info__section-heading span { display: grid; place-items: center; min-width: 24px; height: 24px; border-radius: 50%; color: var(--label); background: var(--tag-coral); font-size: 12px; font-weight: 700; }
ul { display: flex; flex-direction: column; gap: 7px; padding: 0; margin: 0; list-style: none; }
li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 12px; border-radius: 12px; background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); }
li div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
li strong { overflow: hidden; color: var(--label-ink); font-size: 13px; text-overflow: ellipsis; text-transform: capitalize; white-space: nowrap; }
li span { color: color-mix(in oklab, var(--label-ink) 68%, transparent); font-size: 11px; }
li b { flex-shrink: 0; color: var(--label-ink); font-size: 13px; }
.island-info__empty { margin: 0; padding: 17px; border-radius: 12px; color: color-mix(in oklab, var(--label-ink) 70%, transparent); background: color-mix(in oklab, var(--sky-top) 14%, var(--label)); font-size: 13px; text-align: center; }
@media (max-width: 420px) { .island-info__hero { padding: 36px 24px 27px; } .island-info__content { padding: 20px; } .island-info__facts { grid-template-columns: 1fr; } }
</style>
