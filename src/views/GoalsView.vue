<!-- src/views/GoalsView.vue -->
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import goalsService from '@/services/goals.service'
import islandsService from '@/services/islands.service'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// Marcar un cumplimiento crea un movimiento real en el ledger (ver
// GoalViewSet.mark_completion), así que cualquier total que dependa de eso
// en un componente padre (p. ej. un dashboard) debe refrescarse.
const emit = defineEmits(['changed'])
import { useConfirmDialog } from '@/composable/useConfirmDialog.js'

const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

const MAX_VISIBLE_DONE_COMPLETIONS = 3

/* ---------- Datos base ---------- */
const islands = ref([])
const goals = ref([])
const loading = ref(true)
const error = ref('')

const filters = ref({ active: '', island: '' })

/* ---------- Formulario crear/editar ---------- */
const emptyForm = () => ({
  island: '',
  target_amount: '',
  frequency_days: '',
  start_date: '',
  active: true,
})

const showForm = ref(false)
const editingId = ref(null)
const form = ref(emptyForm())
const formError = ref('')
const formLoading = ref(false)

/* ---------- Cumplimientos ---------- */
const expandedGoal = ref(null)
const completionsByGoal = reactive({})
const completionsLoading = ref(null)
const completionsError = reactive({})

const markForm = reactive({})
const markLoading = ref(null)
const markError = reactive({})

/* Marcar con un solo clic, sin necesidad de abrir el panel */
const quickMarkLoading = ref(null)
const quickMarkError = reactive({})

/* ---------- Helpers ---------- */
function islandById(id) {
  return islands.value.find((island) => String(island.id) === String(id))
}
function islandName(id) {
  return islandById(id)?.name ?? '—'
}
function currencyFor(id) {
  return islandById(id)?.currency ?? 'MXN'
}
function formatAmount(value, islandId) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyFor(islandId),
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}
function formatFrequency(days) {
  const n = Number(days)
  if (!n) return '—'
  if (n === 1) return 'Todos los días'
  if (n === 7) return 'Cada semana'
  if (n === 15) return 'Cada quincena'
  if (n === 30) return 'Cada mes'
  return `Cada ${n} días`
}
function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const filteredGoals = computed(() => {
  return goals.value.filter((goal) => {
    if (filters.value.active === 'active' && !goal.active) return false
    if (filters.value.active === 'inactive' && goal.active) return false
    if (filters.value.island && String(goal.island) !== filters.value.island) return false
    return true
  })
})

const activeCount = computed(() => goals.value.filter((g) => g.active).length)

/* ---------- Carga ---------- */
async function loadIslands() {
  try {
    const data = await islandsService.list()
    islands.value = data.results ?? []
  } catch {
    islands.value = []
  }
}

async function loadGoals() {
  loading.value = true
  error.value = ''
  try {
    const data = await goalsService.list()
    goals.value = data.results ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No fue posible cargar tus objetivos.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadIslands(), loadGoals()])
})

/* ---------- Crear / editar ---------- */
function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
}

function openEdit(goal) {
  editingId.value = goal.id
  form.value = {
    island: String(goal.island ?? ''),
    target_amount: goal.target_amount ?? '',
    frequency_days: goal.frequency_days ?? '',
    start_date: goal.start_date ?? '',
    active: Boolean(goal.active),
  }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  formError.value = ''
}

async function submitForm() {
  formError.value = ''

  if (!form.value.island || !form.value.target_amount || !form.value.frequency_days || !form.value.start_date) {
    formError.value = 'Completa isla, monto meta, frecuencia y fecha de inicio.'
    return
  }

  const payload = {
    island: Number(form.value.island),
    target_amount: String(form.value.target_amount),
    frequency_days: Number(form.value.frequency_days),
    start_date: form.value.start_date,
    active: form.value.active,
  }

  formLoading.value = true
  try {
    if (editingId.value) {
      const updated = await goalsService.update(editingId.value, payload)
      const index = goals.value.findIndex((g) => g.id === editingId.value)
      if (index !== -1) goals.value[index] = updated
    } else {
      const created = await goalsService.create(payload)
      goals.value = [created, ...goals.value]
    }
    closeForm()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'No pudimos guardar tu objetivo. Intenta nuevamente.'
  } finally {
    formLoading.value = false
  }
}

async function toggleActive(goal) {
  try {
    const updated = await goalsService.partialUpdate(goal.id, { active: !goal.active })
    const index = goals.value.findIndex((g) => g.id === goal.id)
    if (index !== -1) goals.value[index] = updated
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No pudimos actualizar el objetivo.'
  }
}

function deleteGoal(goal) {
  openConfirm({
    title: '¿Eliminar este objetivo?',
    message: 'Esta acción no se puede deshacer. Se perderá también su historial de cumplimiento.',
    confirmText: 'Eliminar objetivo',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await goalsService.destroy(goal.id)
        goals.value = goals.value.filter((g) => g.id !== goal.id)
        if (expandedGoal.value === goal.id) expandedGoal.value = null
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'No pudimos eliminar el objetivo.'
        throw err // para que el diálogo no se cierre si falla
      }
    },
  })
}

/* ---------- Cumplimientos ---------- */

// Carga (una sola vez) los cumplimientos de un objetivo. La reutilizan tanto
// el panel expandido como el botón de marcado rápido de la tarjeta.
async function ensureCompletionsLoaded(goalId) {
  if (completionsByGoal[goalId]) return completionsByGoal[goalId]

  completionsLoading.value = goalId
  completionsError[goalId] = ''
  try {
    const data = await goalsService.getCompletions(goalId)
    completionsByGoal[goalId] = data.results ?? data ?? []
  } catch (err) {
    completionsError[goalId] = err instanceof Error ? err.message : 'No pudimos cargar los cumplimientos.'
    completionsByGoal[goalId] = []
  } finally {
    if (completionsLoading.value === goalId) completionsLoading.value = null
  }
  return completionsByGoal[goalId]
}

// El periodo pendiente (sin completar) más antiguo de un objetivo, o null si
// ya está al día. Es el que se marca cuando el usuario da "un solo clic".
function nextPendingCompletion(goalId) {
  const list = completionsByGoal[goalId] ?? []
  const pending = list.filter((completion) => !completion.completed_date)
  if (!pending.length) return null
  return [...pending].sort(
    (a, b) => new Date(a.expected_date) - new Date(b.expected_date)
  )[0]
}

function replaceCompletion(goalId, updated) {
  const list = completionsByGoal[goalId] ?? []
  const index = list.findIndex((c) => c.expected_date === updated.expected_date)
  if (index !== -1) list.splice(index, 1, updated)
  else completionsByGoal[goalId] = [updated, ...list]
}

// Para no mostrar una lista interminable de cumplimientos ya hechos (un
// objetivo diario lleva cientos con el tiempo), mostramos todos los
// pendientes más solo los últimos N ya cumplidos, ordenados del más
// reciente al más antiguo.
function visibleCompletions(goalId) {
  const list = completionsByGoal[goalId] ?? []
  const pending = list.filter((completion) => !completion.completed_date)
  const done = [...list.filter((completion) => completion.completed_date)].sort(
    (a, b) => new Date(b.expected_date) - new Date(a.expected_date)
  )
  const recentDone = done.slice(0, MAX_VISIBLE_DONE_COMPLETIONS)
  const hiddenDoneCount = Math.max(done.length - recentDone.length, 0)
  const items = [...pending, ...recentDone].sort(
    (a, b) => new Date(b.expected_date) - new Date(a.expected_date)
  )
  return { items, hiddenDoneCount }
}

async function toggleCompletions(goal) {
  if (expandedGoal.value === goal.id) {
    expandedGoal.value = null
    return
  }
  expandedGoal.value = goal.id

  if (!markForm[goal.id]) {
    markForm[goal.id] = { expected_date: '', transaction_id: '', actual_amount: '' }
  }

  await ensureCompletionsLoaded(goal.id)
}

async function submitMark(goal) {
  const data = markForm[goal.id]
  if (!data?.expected_date) {
    markError[goal.id] = 'Indica la fecha esperada del cumplimiento.'
    return
  }

  markError[goal.id] = ''
  markLoading.value = goal.id
  try {
    const payload = { expected_date: data.expected_date }
    if (data.transaction_id) payload.transaction_id = Number(data.transaction_id)
    if (data.actual_amount) payload.actual_amount = Number(data.actual_amount)

    const completion = await goalsService.markCompletion(goal.id, payload)
    replaceCompletion(goal.id, completion)
    markForm[goal.id] = { expected_date: '', transaction_id: '', actual_amount: '' }
    emit('changed')
  } catch (err) {
    markError[goal.id] = err instanceof Error ? err.message : 'No pudimos registrar el cumplimiento.'
  } finally {
    markLoading.value = null
  }
}

// Marca un periodo puntual del panel expandido con un clic, sin llenar el
// formulario (se usa el target_amount del objetivo como monto por defecto,
// tal como lo resuelve el backend cuando no se manda actual_amount).
async function markSpecific(goal, completion) {
  markError[goal.id] = ''
  markLoading.value = goal.id
  try {
    const updated = await goalsService.markCompletion(goal.id, {
      expected_date: completion.expected_date,
    })
    replaceCompletion(goal.id, updated)
    emit('changed')
  } catch (err) {
    markError[goal.id] = err instanceof Error ? err.message : 'No pudimos registrar el cumplimiento.'
  } finally {
    markLoading.value = null
  }
}

// Botón de "un solo clic" en la tarjeta del objetivo: no requiere expandir
// el panel. Busca el periodo pendiente más antiguo y lo marca como cumplido;
// la fecha de cumplimiento la registra el backend automáticamente.
async function quickMarkComplete(goal) {
  quickMarkError[goal.id] = ''
  quickMarkLoading.value = goal.id
  try {
    await ensureCompletionsLoaded(goal.id)
    const pending = nextPendingCompletion(goal.id)
    if (!pending) {
      quickMarkError[goal.id] = 'Este objetivo ya está al día, no hay periodos pendientes.'
      return
    }
    const updated = await goalsService.markCompletion(goal.id, {
      expected_date: pending.expected_date,
    })
    replaceCompletion(goal.id, updated)
    emit('changed')
  } catch (err) {
    quickMarkError[goal.id] = err instanceof Error ? err.message : 'No pudimos registrar el cumplimiento.'
  } finally {
    quickMarkLoading.value = null
  }
}
</script>

<template>
  <main class="goals-page">
    <header class="goals-header">
      <RouterLink class="back-link" :to="{ name: 'settings' }">← Ajustes</RouterLink>
      <div>
        <p class="header-kicker">Tus metas de ahorro</p>
        <h1>Objetivos</h1>
        <p class="goals-subtitle">Registra, edita y da seguimiento a tus objetivos recurrentes.</p>
      </div>
    </header>

    <section class="goal-filters" aria-label="Filtros de objetivos">
      <select v-model="filters.island">
        <option value="">Todas las islas</option>
        <option v-for="island in islands" :key="island.id" :value="String(island.id)">{{ island.name }}</option>
      </select>
      <select v-model="filters.active">
        <option value="">Todos los estados</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>
      <button class="new-goal-button" type="button" @click="openCreate">+ Nuevo objetivo</button>
    </section>

    <section v-if="showForm" class="settings-card goal-form-card" aria-labelledby="goal-form-title">
      <div class="card-heading">
        <div>
          <p class="card-kicker">{{ editingId ? 'Editar' : 'Crear' }}</p>
          <h2 id="goal-form-title">{{ editingId ? 'Editar objetivo' : 'Nuevo objetivo' }}</h2>
        </div>
        <button class="close-form-button" type="button" aria-label="Cerrar formulario" @click="closeForm">✕</button>
      </div>

      <form class="settings-form goal-form" @submit.prevent="submitForm">
        <div class="field">
          <label for="goal_island">Isla</label>
          <select id="goal_island" v-model="form.island" required>
            <option value="" disabled>Selecciona una isla</option>
            <option v-for="island in islands" :key="island.id" :value="String(island.id)">{{ island.name }}</option>
          </select>
        </div>

        <div class="field">
          <label for="goal_amount">Monto meta</label>
          <input
            id="goal_amount"
            v-model="form.target_amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>

        <div class="field">
          <label for="goal_frequency">Frecuencia (días)</label>
          <input
            id="goal_frequency"
            v-model="form.frequency_days"
            type="number"
            min="1"
            step="1"
            required
            placeholder="Ej. 7, 15, 30"
          />
        </div>

        <div class="field">
          <label for="goal_start">Fecha de inicio</label>
          <input id="goal_start" v-model="form.start_date" type="date" required />
        </div>

        <label class="field-checkbox">
          <input v-model="form.active" type="checkbox" />
          <span>Objetivo activo</span>
        </label>

        <p v-if="formError" class="error-message" role="alert">{{ formError }}</p>

        <div class="form-actions">
          <button class="cancel-button" type="button" @click="closeForm">Cancelar</button>
          <button class="submit-button" type="submit" :disabled="formLoading">
            <span>{{ formLoading ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear objetivo' }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>

    <p v-if="error" class="goals-error">{{ error }}</p>
    <p v-else-if="loading" class="goals-state">Cargando tus objetivos…</p>

    <template v-else>
      <section class="goal-stats" aria-label="Resumen de objetivos">
        <article><span>Objetivos totales</span><strong>{{ goals.length }}</strong></article>
        <article><span>Activos</span><strong>{{ activeCount }}</strong></article>
        <article><span>Mostrando</span><strong>{{ filteredGoals.length }}</strong></article>
      </section>

      <section class="goals-list">
        <article v-if="!filteredGoals.length" class="goal-card empty-card">
          <p class="goals-state">No hay objetivos con estos filtros.</p>
        </article>

        <article v-for="goal in filteredGoals" :key="goal.id" class="goal-card" :class="{ inactive: !goal.active }">
          <div class="goal-card-top">
            <div>
              <span class="category-pill" :class="{ 'pill-inactive': !goal.active }">
                {{ goal.active ? 'Activo' : 'Inactivo' }}
              </span>
              <h2>{{ islandName(goal.island) }}</h2>
              <p class="goal-meta">{{ formatFrequency(goal.frequency_days) }} · desde {{ formatDate(goal.start_date) }}</p>
            </div>
            <strong class="goal-amount">{{ formatAmount(goal.target_amount, goal.island) }}</strong>
          </div>

          <div class="goal-card-actions">
            <button
              type="button"
              class="quick-complete-button"
              :disabled="quickMarkLoading === goal.id || !goal.active"
              :title="!goal.active ? 'Activa el objetivo para poder marcarlo como cumplido' : ''"
              @click="quickMarkComplete(goal)"
            >
              {{ quickMarkLoading === goal.id ? 'Registrando…' : '✓ Marcar cumplido' }}
            </button>
            <button type="button" @click="openEdit(goal)">Editar</button>
            <button type="button" @click="toggleActive(goal)">{{ goal.active ? 'Desactivar' : 'Activar' }}</button>
            <button type="button" @click="toggleCompletions(goal)">
              {{ expandedGoal === goal.id ? 'Ocultar cumplimientos' : 'Ver cumplimientos' }}
            </button>
            <button type="button" class="danger-link" @click="deleteGoal(goal)">Eliminar</button>
          </div>
          <p v-if="quickMarkError[goal.id]" class="error-message" role="alert">{{ quickMarkError[goal.id] }}</p>

          <div v-if="expandedGoal === goal.id" class="completions-panel">
            <template v-if="completionsLoading !== goal.id && completionsByGoal[goal.id]?.length">
              <ul class="completions-list">
                <li
                  v-for="completion in visibleCompletions(goal.id).items"
                  :key="completion.id ?? completion.expected_date"
                  :class="{ 'completion-done': completion.completed_date, 'completion-pending': !completion.completed_date }"
                >
                  <span class="completion-date">{{ formatDate(completion.expected_date) }}</span>
                  <span v-if="completion.completed_date" class="completion-status">
                    Cumplido {{ formatDate(completion.completed_date) }}
                  </span>
                  <span v-if="completion.actual_amount">{{ formatAmount(completion.actual_amount, goal.island) }}</span>
                  <span v-if="completion.transaction_id" class="txn-tag">Mov. #{{ completion.transaction_id }}</span>
                  <button
                    v-if="!completion.completed_date"
                    type="button"
                    class="mark-inline-button"
                    :disabled="markLoading === goal.id"
                    @click="markSpecific(goal, completion)"
                  >
                    {{ markLoading === goal.id ? 'Guardando…' : '✓ Marcar cumplido' }}
                  </button>
                </li>
              </ul>
              <p v-if="visibleCompletions(goal.id).hiddenDoneCount" class="completions-hidden-note">
                + {{ visibleCompletions(goal.id).hiddenDoneCount }} cumplido{{ visibleCompletions(goal.id).hiddenDoneCount === 1 ? '' : 's' }} anterior{{ visibleCompletions(goal.id).hiddenDoneCount === 1 ? '' : 'es' }} (no se muestran)
              </p>
            </template>
            <p v-else-if="completionsLoading === goal.id" class="goals-state">Cargando cumplimientos…</p>
            <p v-else-if="completionsError[goal.id]" class="goals-error">{{ completionsError[goal.id] }}</p>
            <p v-else class="goals-state">Aún no hay cumplimientos registrados.</p>

            <details class="mark-form-details">
              <summary>¿Necesitas registrar otra fecha o vincular un movimiento existente?</summary>
              <form class="mark-form" @submit.prevent="submitMark(goal)">
                <div class="field">
                  <label :for="`mark_date_${goal.id}`">Fecha esperada</label>
                  <input :id="`mark_date_${goal.id}`" v-model="markForm[goal.id].expected_date" type="date" required />
                </div>
                <div class="field">
                  <label :for="`mark_amount_${goal.id}`">Monto real (opcional)</label>
                  <input
                    :id="`mark_amount_${goal.id}`"
                    v-model="markForm[goal.id].actual_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <button class="mark-button" type="submit" :disabled="markLoading === goal.id">
                  {{ markLoading === goal.id ? 'Guardando…' : 'Marcar cumplimiento' }}
                </button>
              </form>
              <p v-if="markError[goal.id]" class="error-message" role="alert">{{ markError[goal.id] }}</p>
            </details>
          </div>
        </article>
      </section>
    </template>
  </main>

  
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
.goals-page { min-height: 100vh; padding: 46px clamp(18px, 5vw, 72px) 80px; color: var(--foreground); background: linear-gradient(160deg, var(--sky-top), var(--background) 45%, color-mix(in oklab, var(--reef) 32%, var(--background))); }
.goals-header { display: flex; flex-direction: column; gap: 18px; max-width: 1000px; margin: 0 auto 26px; }
.goals-header .back-link { width: fit-content; color: var(--label-ink); font-size: 13px; font-weight: 700; text-decoration: none; }
.goals-header .back-link:hover { color: var(--ocean-deep); text-decoration: underline; }
.header-kicker { margin: 0 0 6px; color: var(--ocean-deep); font-size: 13px; font-weight: 700; }
.goals-header h1 { margin: 0; font-family: var(--font-display); font-size: clamp(34px, 6vw, 58px); letter-spacing: -.04em; }
.goals-subtitle { margin: 6px 0 0; color: var(--label-ink); font-size: 14px; line-height: 1.5; }

.goal-filters, .goal-stats, .goals-list { max-width: 1000px; margin-inline: auto; }
.goal-filters { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; margin-bottom: 20px; padding: 14px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 15%, transparent); border-radius: 17px; background: color-mix(in oklab, var(--label) 72%, transparent); }
.goal-filters select { min-width: 0; min-height: 40px; padding: 0 10px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 18%, transparent); border-radius: 10px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 13px; }
.new-goal-button { min-height: 40px; padding: 0 16px; border: 0; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font: 700 13px var(--font-sans); cursor: pointer; white-space: nowrap; }

.settings-card { display: flex; flex-direction: column; gap: 18px; padding: clamp(20px, 3vw, 28px); border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent); border-radius: 20px; background: color-mix(in oklab, var(--label) 68%, transparent); backdrop-filter: blur(18px); }
.goal-form-card { max-width: 1000px; margin: 0 auto 22px; }
.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 0; }
.card-kicker { margin: 0 0 4px; color: var(--ocean-deep); font-size: 12px; font-weight: 700; }
.settings-card h2 { margin: 0; font-family: var(--font-display); font-size: 22px; line-height: 1.1; }
.close-form-button { min-width: 32px; min-height: 32px; border: 0; border-radius: 50%; color: var(--label-ink); background: color-mix(in oklab, var(--ocean-deep) 10%, transparent); font-size: 14px; cursor: pointer; }

.settings-form { display: flex; flex-direction: column; gap: 16px; }
.goal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { color: var(--label-ink); font-size: 12px; font-weight: 700; }
.field input, .field select { min-height: 42px; padding: 0 12px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 18%, transparent); border-radius: 10px; color: var(--label-ink); background: var(--label); font: inherit; font-size: 13px; }
.field-checkbox { display: flex; align-items: center; gap: 8px; grid-column: 1 / -1; color: var(--label-ink); font-size: 13px; font-weight: 600; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; grid-column: 1 / -1; }
.cancel-button { min-height: 42px; padding: 0 16px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 22%, transparent); border-radius: 10px; color: var(--label-ink); background: transparent; font: 700 13px var(--font-sans); cursor: pointer; }
.submit-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 0 18px; border: 0; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font: 700 13px var(--font-sans); cursor: pointer; }
.submit-button:disabled { opacity: .6; cursor: not-allowed; }

.error-message { margin: 0; color: #a13d30; font-size: 13px; grid-column: 1 / -1; }
.success-message { margin: 0; color: color-mix(in oklab, var(--tag-teal) 60%, var(--ocean-deep)); font-size: 13px; }

.goal-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.goal-stats article { display: flex; flex-direction: column; gap: 5px; padding: 20px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 15%, transparent); border-radius: 20px; background: color-mix(in oklab, var(--label) 80%, transparent); box-shadow: 0 12px 30px color-mix(in oklab, var(--ocean-deep) 8%, transparent); }
.goal-stats span { color: color-mix(in oklab, var(--label-ink) 70%, transparent); font-size: 12px; }
.goal-stats strong { font-family: var(--font-display); font-size: 27px; }

.goals-list { display: flex; flex-direction: column; gap: 14px; }
.goal-card { padding: 20px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 15%, transparent); border-radius: 20px; background: color-mix(in oklab, var(--label) 80%, transparent); box-shadow: 0 12px 30px color-mix(in oklab, var(--ocean-deep) 8%, transparent); }
.goal-card.inactive { opacity: .68; }
.empty-card { text-align: center; }
.goal-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.goal-card-top h2 { margin: 8px 0 2px; font-family: var(--font-display); font-size: 20px; }
.goal-meta { margin: 0; color: color-mix(in oklab, var(--label-ink) 72%, transparent); font-size: 12px; }
.goal-amount { font-family: var(--font-display); font-size: 24px; white-space: nowrap; }

.category-pill { display: inline-block; padding: 4px 7px; border-radius: 99px; color: var(--label-ink); background: color-mix(in oklab, var(--tag-teal) 19%, transparent); font-size: 11px; font-weight: 700; }
.category-pill.pill-inactive { background: color-mix(in oklab, var(--tag-coral) 19%, transparent); }

.goal-card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.goal-card-actions button { min-height: 34px; padding: 0 12px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 20%, transparent); border-radius: 99px; color: var(--label-ink); background: color-mix(in oklab, var(--label) 90%, transparent); font: 700 12px var(--font-sans); cursor: pointer; }
.goal-card-actions .danger-link { border-color: color-mix(in oklab, var(--tag-coral) 45%, transparent); color: #a13d30; }
.quick-complete-button { border-color: color-mix(in oklab, var(--tag-teal) 45%, transparent) !important; color: var(--ocean-deep) !important; background: color-mix(in oklab, var(--tag-teal) 20%, var(--label)) !important; font-weight: 800 !important; }
.quick-complete-button:disabled { opacity: .55; cursor: not-allowed; }

.completions-panel { margin-top: 18px; padding-top: 16px; border-top: 1px solid color-mix(in oklab, var(--ocean-deep) 12%, transparent); display: flex; flex-direction: column; gap: 14px; }
.mark-form-details { font-size: 13px; }
.mark-form-details summary { cursor: pointer; color: var(--ocean-deep); font-weight: 700; font-size: 12px; }
.mark-form-details .mark-form { margin-top: 12px; }
.mark-form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
.mark-button { min-height: 42px; padding: 0 16px; border: 0; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font: 700 13px var(--font-sans); cursor: pointer; white-space: nowrap; }
.mark-button:disabled { opacity: .6; cursor: not-allowed; }

.completions-list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.completions-list li { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 9px 12px; border: 1px solid color-mix(in oklab, var(--ocean-deep) 11%, transparent); border-radius: 12px; font-size: 13px; }
.completions-list li.completion-done { background: color-mix(in oklab, var(--tag-teal) 10%, transparent); }
.completion-status { color: color-mix(in oklab, var(--tag-teal) 55%, var(--ocean-deep)); font-weight: 700; }
.mark-inline-button { margin-left: auto; min-height: 30px; padding: 0 10px; border: 0; border-radius: 99px; color: var(--label); background: var(--ocean-deep); font: 700 11px var(--font-sans); cursor: pointer; white-space: nowrap; }
.mark-inline-button:disabled { opacity: .6; cursor: not-allowed; }
.txn-tag { padding: 3px 8px; border-radius: 99px; color: var(--label-ink); background: color-mix(in oklab, var(--tag-sun) 19%, transparent); font-size: 11px; font-weight: 700; }
.completions-hidden-note { margin: 0; color: color-mix(in oklab, var(--label-ink) 62%, transparent); font-size: 11px; font-style: italic; }

.goals-error, .goals-state { max-width: 1000px; margin: 25px auto; color: var(--label-ink); text-align: center; }
.goals-error { color: #a13d30; }

@media (max-width: 860px) {
  .goal-filters { grid-template-columns: 1fr 1fr; }
  .new-goal-button { grid-column: 1 / -1; }
  .goal-form { grid-template-columns: 1fr; }
  .goal-stats { grid-template-columns: 1fr; }
  .mark-form { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .goals-page { padding-inline: 14px; }
  .goal-filters { grid-template-columns: 1fr; }
  .goal-card-top { flex-direction: column; }
  .mark-form { grid-template-columns: 1fr; }
}
</style>