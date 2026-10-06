<script setup>
import { formatAmount } from '@/composable/island/useFormatters'

defineProps({
  isCashIsland: { type: Boolean, default: false },
  island: { type: Object, default: null },
  currency: { type: String, default: 'MXN' },
  gainLoss: { type: [Number, String], default: null },
  gainLossPercent: { type: Number, default: null },
})
</script>

<template>
  <div v-if="isCashIsland">
    <dt>
      Ganancia por interés
      <span
        class="island-info__tooltip"
        tabindex="0"
        role="img"
        aria-label="La ganancia mostrada es aproximada. Puede variar debido a factores externos fuera de nuestro control."
      >
        <svg class="island-info__tooltip-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="7.5" r="1.15" fill="currentColor"/>
        </svg>
        <span class="island-info__tooltip-bubble" role="tooltip">La ganancia mostrada es aproximada. Puede variar debido a factores externos fuera de nuestro control.</span>
      </span>
    </dt>
    <dd>{{ formatAmount(island?.summary?.interest_earned, currency) }}</dd>
  </div>
  <div v-else>
    <dt>Ganancia / pérdida</dt>
    <dd v-if="island?.summary?.price_unavailable" class="island-info__state--error">
      Precio no disponible por ahora
    </dd>
    <dd v-else :class="{ 'island-info__gain--positive': gainLoss > 0, 'island-info__gain--negative': gainLoss < 0 }">
      {{ formatAmount(gainLoss, currency) }}
      <span v-if="gainLossPercent !== null">
        ({{ gainLossPercent >= 0 ? '+' : '' }}{{ gainLossPercent.toFixed(1) }}%)
      </span>
    </dd>
  </div>
</template>

<style scoped>
dt { color: color-mix(in oklab, var(--label-ink) 65%, transparent); font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
dd { margin: 5px 0 0; color: var(--label-ink); font-size: 14px; font-weight: 700; }
.island-info__state--error { color: #a13d30; }
dd.island-info__gain--positive { color: #1f8a5b; }
dd.island-info__gain--negative { color: #a13d30; }
.island-info__tooltip { position: relative; display: inline-flex; align-items: center; justify-content: center; margin-left: 5px; width: 15px; height: 15px; border-radius: 50%; color: color-mix(in oklab, var(--label-ink) 70%, transparent); cursor: help; vertical-align: middle; }
.island-info__tooltip-icon { width: 100%; height: 100%; }
.island-info__tooltip-bubble { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px); width: max-content; max-width: 220px; padding: 8px 10px; border-radius: 10px; color: var(--label); background: var(--ocean-deep); font-size: 11px; font-weight: 400; line-height: 1.4; text-transform: none; letter-spacing: normal; opacity: 0; pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 5; }
.island-info__tooltip-bubble::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: var(--ocean-deep); }
.island-info__tooltip:hover .island-info__tooltip-bubble,
.island-info__tooltip:focus .island-info__tooltip-bubble,
.island-info__tooltip:focus-visible .island-info__tooltip-bubble { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>