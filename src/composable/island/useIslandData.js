import { ref, computed, watch, onMounted } from 'vue'
import islandsService from '@/services/islands.service'
import goalsService from '@/services/goals.service'
import transactionsService from '@/services/transactions.service'

export function useIslandData(props) {
  const island = ref(null)
  const goals = ref([])
  const destinationIslands = ref([])
  const transactions = ref([])
  const transactionPage = ref(1)
  const hasMoreTransactions = ref(false)
  const loadingMoreTransactions = ref(false)
  const loading = ref(true)
  const error = ref('')
  const transactionFilters = ref({ type: '', category: '', ordering: '-date' })

  const isCashIsland = computed(() => island.value?.kind === 'cash')
  const isSystemIsland = computed(() => Boolean(island.value?.is_system))
  const currency = computed(() => island.value?.summary?.currency ?? island.value?.currency ?? 'MXN')
  const valueBase = computed(() => island.value?.summary?.value_base)
  const valueNative = computed(() => island.value?.summary?.value_native)
  const nativeCurrency = computed(() => island.value?.summary?.currency ?? island.value?.currency)
  const costBasis = computed(() => island.value?.summary?.cost_basis)
  const gainLoss = computed(() => island.value?.summary?.gain_loss)
  const gainLossPercent = computed(() => {
    const basis = Number(costBasis.value)
    const gain = Number(gainLoss.value)
    if (!basis || !Number.isFinite(basis) || !Number.isFinite(gain)) return null
    return (gain / basis) * 100
  })

  const availableDestinations = computed(() =>
    destinationIslands.value
      .filter((c) => String(c.id) !== props.islandId && c.kind === 'cash')
      .sort((a, b) => {
        if (a.name?.toLocaleLowerCase() === 'efectivo') return -1
        if (b.name?.toLocaleLowerCase() === 'efectivo') return 1
        return a.name.localeCompare(b.name, 'es')
      })
  )

  function transactionParams(page) {
    const params = { island: props.islandId, page, ordering: transactionFilters.value.ordering }
    if (transactionFilters.value.type) params.type = transactionFilters.value.type
    if (transactionFilters.value.category) params.category = transactionFilters.value.category
    return params
  }

  async function loadDestinationIslands() {
    try {
      const data = await islandsService.list({ kind: 'cash' })
      destinationIslands.value = data.results ?? []
    } catch {
      destinationIslands.value = []
    }
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
    try {
      const [islandData, goalsData] = await Promise.all([
        islandsService.retrieve(props.islandId),
        goalsService.list({ island: props.islandId }),
      ])
      island.value = islandData
      goals.value = goalsData.results ?? []
      await loadDestinationIslands()
      await loadTransactions({ reset: true })
    } catch (err) {
      error.value = err.message ?? 'No fue posible cargar la información de esta isla.'
    } finally {
      loading.value = false
    }
  }

  async function refreshSummaryOnly() {
    try {
      island.value = await islandsService.retrieve(props.islandId)
    } catch {
      // silencioso
    }
    await loadTransactions({ reset: true })
  }

  watch(() => props.islandId, loadIsland)
  watch(transactionFilters, () => loadTransactions({ reset: true }), { deep: true })
  onMounted(loadIsland)

  return {
    island, goals, destinationIslands, transactions,
    transactionPage, hasMoreTransactions, loadingMoreTransactions,
    loading, error, transactionFilters,
    isCashIsland, isSystemIsland, currency, valueBase, valueNative, nativeCurrency,
    costBasis, gainLoss, gainLossPercent, availableDestinations,
    loadIsland, loadTransactions, loadMoreTransactions, refreshSummaryOnly,
  }
}