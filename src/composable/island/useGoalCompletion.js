import { reactive, ref } from 'vue'
import goalsService from '@/services/goals.service'

export function useGoalCompletion({ onAfterComplete }) {
  const goalCompletions = reactive({})
  const goalMarkLoading = ref(null)
  const goalMarkError = reactive({})

  function goalPendingCompletion(goalId) {
    const list = goalCompletions[goalId]
    if (!list) return undefined
    const pending = list.filter((c) => !c.completed_date)
    if (!pending.length) return null
    return [...pending].sort((a, b) => new Date(a.expected_date) - new Date(b.expected_date))[0]
  }

  async function markGoalComplete(goal) {
    goalMarkError[goal.id] = ''
    goalMarkLoading.value = goal.id
    try {
      if (!goalCompletions[goal.id]) {
        const data = await goalsService.getCompletions(goal.id)
        goalCompletions[goal.id] = data.results ?? data ?? []
      }
      const pending = goalPendingCompletion(goal.id)
      if (!pending) {
        goalMarkError[goal.id] = 'Esta meta ya está al día, no hay periodos pendientes.'
        return
      }
      const completion = await goalsService.markCompletion(goal.id, {
        expected_date: pending.expected_date,
      })
      const list = goalCompletions[goal.id] ?? []
      const index = list.findIndex((c) => c.expected_date === pending.expected_date)
      if (index !== -1) list.splice(index, 1, completion)
      else goalCompletions[goal.id] = [completion, ...list]

      await onAfterComplete?.()
    } catch (err) {
      goalMarkError[goal.id] = err.message ?? 'No pudimos registrar el cumplimiento.'
    } finally {
      goalMarkLoading.value = null
    }
  }

  return { goalCompletions, goalMarkLoading, goalMarkError, markGoalComplete }
}