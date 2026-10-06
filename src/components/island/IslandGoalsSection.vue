<script setup>
import { formatAmount, formatFrequency } from '@/composable/island/useFormatters'

defineProps({
  goals: { type: Array, default: () => [] },
  currency: { type: String, default: 'MXN' },
  goalMarkLoading: { type: [String, Number], default: null },
  goalMarkError: { type: Object, default: () => ({}) },
})

defineEmits(['mark-complete'])
</script>

<template>
  <section class="island-info__goals">
    <div class="island-info__section-heading">
      <h3>Metas de esta isla</h3>
      <span>{{ goals.length }}</span>
    </div>
    <ul v-if="goals.length" class="island-info__goals-list">
      <li v-for="goal in goals" :key="goal.id" :class="{ 'is-inactive': !goal.active }">
        <div class="island-info__goal-info">
          <strong>{{ formatAmount(goal.target_amount, currency) }}</strong>
          <span>{{ goal.active ? 'Activa' : 'Inactiva' }} · {{ formatFrequency(goal.frequency_days) }}</span>
        </div>
        <button
          type="button"
          class="island-info__goal-complete-button"
          :disabled="goalMarkLoading === goal.id || !goal.active"
          :title="!goal.active ? 'Activa la meta para poder marcarla como cumplida' : ''"
          @click="$emit('mark-complete', goal)"
        >
          {{ goalMarkLoading === goal.id ? 'Registrando…' : '✓ Marcar cumplido' }}
        </button>
      </li>
    </ul>
    <button
      v-else
      type="button"
      class="island-info__goal-complete-button"
      disabled
      title="No hay metas disponibles"
    >
      ✓ Marcar cumplido
    </button>
    <p
      v-for="goal in goals"
      :key="`error-${goal.id}`"
      v-show="goalMarkError[goal.id]"
      class="island-info__form-error"
    >
      {{ goalMarkError[goal.id] }}
    </p>
  </section>
</template>

<style scoped>
.island-info__goals { margin-top: 20px; padding: 16px 18px; border-radius: 16px; background: color-mix(in oklab, var(--tag-sun) 10%, var(--label)); }
.island-info__goals-list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.island-info__goals-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 12px; border-radius: 12px; background: color-mix(in oklab, var(--label) 88%, transparent); }
.island-info__goals-list li.is-inactive { opacity: .6; }
.island-info__goal-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.island-info__goal-info strong { color: var(--label-ink); font-size: 13px; }
.island-info__goal-info span { color: color-mix(in oklab, var(--label-ink) 68%, transparent); font-size: 11px; }
.island-info__goal-complete-button { flex-shrink: 0; min-height: 32px; padding: 0 11px; border: 0; border-radius: 99px; color: var(--label); background: var(--ocean-deep); font: 700 11px var(--font-sans); cursor: pointer; white-space: nowrap; }
.island-info__goal-complete-button:disabled { opacity: .55; cursor: not-allowed; }
.island-info__section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.island-info__section-heading span { display: grid; place-items: center; min-width: 24px; height: 24px; border-radius: 50%; color: var(--label); background: var(--tag-coral); font-size: 12px; font-weight: 700; }
h3 { margin: 0; font-family: var(--font-display); font-size: 19px; }
.island-info__form-error { margin: 8px 0 0; color: #a13d30; font-size: 12px; }
</style>