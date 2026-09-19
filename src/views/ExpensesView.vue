<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import transactionsService from '@/services/transactions.service'
import islandsService from '@/services/islands.service'

const transactions = ref([])
const islands = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(false)
const filters = ref({ island: '', category: '', dateStart: '', dateEnd: '', ordering: '-date' })

const CATEGORIES = {
  food: 'Comida',
  transport: 'Transporte',
  subscriptions: 'Suscripciones',
  housing: 'Vivienda',
  leisure: 'Ocio',
  health: 'Salud',
  clothing: 'Ropa',
  travel: 'Viajes',
  education: 'Educación',
  finance: 'Finanzas',
  family_events: 'Eventos Familiares',
  sport: 'Deporte',
  taxes: 'Impuestos',
  work: 'Trabajo',
  other: 'Otro',
}
const currency = computed(() => islands.value.find((island) => String(island.id) === filters.value.island)?.currency ?? 'MXN')
const formatAmount = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.value, maximumFractionDigits: 2 }).format(Number(value ?? 0))
const total = computed(() => transactions.value.reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0))
const average = computed(() => transactions.value.length ? total.value / transactions.value.length : 0)
const byCategory = computed(() => {
  const totals = transactions.value.reduce((accumulator, transaction) => {
    const category = transaction.category || 'other'
    accumulator[category] = (accumulator[category] ?? 0) + Number(transaction.amount ?? 0)
    return accumulator
  }, {})
  return Object.entries(totals).map(([key, value]) => ({ key, label: CATEGORIES[key] ?? key, value })).sort((a, b) => b.value - a.value)
})
const maxCategory = computed(() => Math.max(...byCategory.value.map((item) => item.value), 1))

function paramsFor(currentPage) {
  const params = { type: 'expense', page: currentPage, ordering: filters.value.ordering }
  if (filters.value.island) params.island = filters.value.island
  if (filters.value.category) params.category = filters.value.category
  if (filters.value.dateStart) params.date__gte = filters.value.dateStart
  if (filters.value.dateEnd) params.date__lte = filters.value.dateEnd
  return params
}

async function loadExpenses({ reset = false } = {}) {
  if (reset) { page.value = 1; transactions.value = [] }
  loadingMore.value = true
  error.value = ''
  try {
    const data = await transactionsService.list(paramsFor(page.value))
    transactions.value = reset ? (data.results ?? []) : [...transactions.value, ...(data.results ?? [])]
    hasMore.value = Boolean(data.next)
  } catch (err) {
    error.value = err.message ?? 'No fue posible cargar tus gastos.'
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}

async function loadMore() { if (hasMore.value && !loadingMore.value) { page.value += 1; await loadExpenses() } }
async function loadIslands() { try { const data = await islandsService.list(); islands.value = data.results ?? [] } catch { islands.value = [] } }

watch(filters, () => loadExpenses({ reset: true }), { deep: true })
onMounted(async () => { await Promise.all([loadIslands(), loadExpenses({ reset: true })]) })
</script>

<template>
  <main class="expenses-page">
    <header class="expenses-header">
      <RouterLink :to="{ name: 'settings' }">← Ajustes</RouterLink>
      <div><p>Tu actividad financiera</p><h1>Gastos bajo la lupa</h1></div>
    </header>

    <section class="expense-filters" aria-label="Filtros de gastos">
      <select v-model="filters.island"><option value="">Todas las islas</option><option v-for="island in islands" :key="island.id" :value="String(island.id)">{{ island.name }}</option></select>
      <select v-model="filters.category"><option value="">Todas las categorías</option><option v-for="(label, key) in CATEGORIES" :key="key" :value="key">{{ label }}</option></select>
      <input v-model="filters.dateStart" type="date" aria-label="Desde" /><input v-model="filters.dateEnd" type="date" aria-label="Hasta" />
      <select v-model="filters.ordering"><option value="-date">Más recientes</option><option value="date">Más antiguos</option><option value="-created_at">Últimos registrados</option></select>
    </section>

    <p v-if="error" class="expenses-error">{{ error }}</p>
    <p v-else-if="loading" class="expenses-state">Cargando tus gastos…</p>
    <template v-else>
      <section class="expense-stats" aria-label="Resumen de gastos">
        <article><span>Gasto total</span><strong>{{ formatAmount(total) }}</strong><small>{{ transactions.length }} movimientos visibles</small></article>
        <article><span>Gasto promedio</span><strong>{{ formatAmount(average) }}</strong><small>por movimiento</small></article>
        <article><span>Principal categoría</span><strong>{{ byCategory[0]?.label ?? '—' }}</strong><small>{{ byCategory[0] ? formatAmount(byCategory[0].value) : 'Sin gastos' }}</small></article>
      </section>

      <section class="expense-grid">
        <article class="expense-card expense-chart"><h2>Distribución por categoría</h2><div v-if="byCategory.length" class="bars"><div v-for="item in byCategory" :key="item.key" class="bar-row"><span>{{ item.label }}</span><div><i :style="{ width: `${(item.value / maxCategory) * 100}%` }" /></div><b>{{ formatAmount(item.value) }}</b></div></div><p v-else class="expenses-state">No hay datos para este periodo.</p></article>
        <article class="expense-card"><h2>Movimientos</h2><div class="expense-table-wrap"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Nota</th><th>Monto</th></tr></thead><tbody><tr v-for="transaction in transactions" :key="transaction.id"><td>{{ transaction.date }}</td><td><span class="category-pill">{{ CATEGORIES[transaction.category] ?? 'Otro' }}</span></td><td>{{ transaction.note || '—' }}</td><td>{{ formatAmount(transaction.amount) }}</td></tr><tr v-if="!transactions.length"><td colspan="4">No hay gastos con estos filtros.</td></tr></tbody></table></div><button v-if="hasMore" class="more-button" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? 'Cargando…' : 'Ver más gastos' }}</button></article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.expenses-page { min-height: 100vh; padding: 46px clamp(18px, 5vw, 72px) 80px; color: var(--foreground); background: linear-gradient(160deg, var(--sky-top), var(--background) 45%, color-mix(in oklab, var(--reef) 32%, var(--background))); }
.expenses-header { display: flex; flex-direction: column; gap: 18px; max-width: 1180px; margin: 0 auto 26px; }.expenses-header a { width: fit-content; color: var(--label-ink); font-size: 13px; font-weight: 700; text-decoration: none; }.expenses-header p { margin: 0 0 6px; color: var(--ocean-deep); font-size: 13px; font-weight: 700; }.expenses-header h1 { margin: 0; font-family: var(--font-display); font-size: clamp(34px, 6vw, 58px); letter-spacing: -.04em; }
.expense-filters, .expense-stats, .expense-grid { max-width: 1180px; margin-inline: auto; }.expense-filters { display: grid; grid-template-columns: 1.4fr 1fr repeat(2, 1fr) 1fr; gap: 10px; margin-bottom: 20px; padding: 14px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 15%, transparent); border-radius: 17px; background: color-mix(in oklab, var(--label) 72%, transparent); }.expense-filters select, .expense-filters input { min-width: 0; min-height: 40px; padding: 0 10px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 18%, transparent); border-radius: 10px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 13px; }
.expense-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }.expense-stats article, .expense-card { border: 1px solid color-mix(in oklab, var(--ocean-deep) 15%, transparent); border-radius: 20px; background: color-mix(in oklab, var(--label) 80%, transparent); box-shadow: 0 12px 30px color-mix(in oklab, var(--ocean-deep) 8%, transparent); }.expense-stats article { display: flex; flex-direction: column; gap: 5px; padding: 20px; }.expense-stats span, .expense-stats small { color: color-mix(in oklab, var(--label-ink) 70%, transparent); font-size: 12px; }.expense-stats strong { font-family: var(--font-display); font-size: 27px; }
.expense-grid { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(0, 1.6fr); gap: 18px; }.expense-card { padding: 20px; }.expense-card h2 { margin: 0 0 18px; font-family: var(--font-display); font-size: 22px; }.bars { display: flex; flex-direction: column; gap: 14px; }.bar-row { display: grid; grid-template-columns: 90px minmax(40px, 1fr) auto; align-items: center; gap: 9px; font-size: 12px; }.bar-row > div { height: 9px; overflow: hidden; border-radius: 99px; background: color-mix(in oklab, var(--ocean-deep) 12%, transparent); }.bar-row i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--tag-teal), var(--tag-coral)); }.bar-row b { font-size: 11px; white-space: nowrap; }
.expense-table-wrap { overflow-x: auto; }table { width: 100%; border-collapse: collapse; font-size: 13px; }th { color: color-mix(in oklab, var(--label-ink) 68%, transparent); font-size: 11px; text-align: left; text-transform: uppercase; }th, td { padding: 11px 8px; border-bottom: 1px solid color-mix(in oklab, var(--ocean-deep) 11%, transparent); }td:last-child { font-weight: 700; white-space: nowrap; }.category-pill { padding: 4px 7px; border-radius: 99px; color: var(--label-ink); background: color-mix(in oklab, var(--tag-sun) 19%, transparent); font-size: 11px; font-weight: 700; }.more-button { width: 100%; margin-top: 14px; min-height: 39px; border: 0; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font: 700 13px var(--font-sans); cursor: pointer; }.expenses-error, .expenses-state { max-width: 1180px; margin: 25px auto; color: var(--label-ink); text-align: center; }.expenses-error { color: #a13d30; }
@media (max-width: 860px) { .expense-filters { grid-template-columns: repeat(2, 1fr); }.expense-stats, .expense-grid { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .expense-filters { grid-template-columns: 1fr; }.expenses-page { padding-inline: 14px; }.expense-stats strong { font-size: 23px; } }
</style>
