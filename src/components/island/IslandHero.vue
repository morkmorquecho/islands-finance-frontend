<script setup>
import { computed } from 'vue'
import { formatAmount } from '@/composable/island/useFormatters'
import { BASE_CURRENCY } from '@/composable/island/useTransactionConstants'

const props = defineProps({
  island: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  isCashIsland: { type: Boolean, default: false },
  isSystemIsland: { type: Boolean, default: false },
  valueBase: { type: [Number, String], default: null },
  valueNative: { type: [Number, String], default: null },
  nativeCurrency: { type: String, default: '' },
})

defineEmits(['edit', 'delete'])

const showNative = computed(() =>
  !props.isCashIsland &&
  !props.island?.summary?.price_unavailable &&
  props.nativeCurrency &&
  props.nativeCurrency !== BASE_CURRENCY
)
</script>

<template>
  <div class="island-info__hero">
    <span class="island-info__eyebrow">Información de la isla</span>
    <h2 v-if="!loading">{{ island?.name }}</h2>
    <div v-if="!loading && !isSystemIsland" class="island-info__actions">
      <button type="button" @click="$emit('edit')">Editar isla</button>
      <button type="button" class="island-info__delete-button" @click="$emit('delete')">Eliminar isla</button>
    </div>
    <div class="island-info__balance">
      <span>Total de la isla</span>
      <strong v-if="island?.summary?.price_unavailable">
        lamentablemente de momento no conocemos el precio de este activo recomiendo borrar esta isla y esperar una nueva actualizacion
      </strong>
      <strong v-else>{{ formatAmount(valueBase, BASE_CURRENCY) }}</strong>
      <small v-if="showNative">
        {{ formatAmount(valueNative, nativeCurrency) }} en {{ nativeCurrency }}
      </small>
    </div>
  </div>
</template>

<style scoped>
.island-info__hero { padding: 40px 34px 30px; color: var(--label); background: linear-gradient(145deg, var(--ocean-deep), var(--tag-teal)); border-radius: 26px 26px 34% 34%; }
.island-info__eyebrow { display: block; margin-bottom: 8px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; opacity: .78; }
h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 6vw, 38px); line-height: 1; }
.island-info__actions { display: flex; gap: 8px; margin-top: 16px; }
.island-info__actions button { border: 1px solid color-mix(in oklab, var(--label) 40%, transparent); border-radius: 8px; padding: 6px 9px; color: var(--label); background: transparent; font: 700 11px var(--font-sans); cursor: pointer; }
.island-info__actions .island-info__delete-button { color: #ffd2cc; border-color: color-mix(in oklab, #ff9a8d 70%, transparent); }
.island-info__balance { display: flex; flex-direction: column; gap: 3px; margin-top: 24px; }
.island-info__balance span { font-size: 13px; opacity: .8; }
.island-info__balance strong { font-size: 26px; letter-spacing: -.04em; }
@media (max-width: 420px) { .island-info__hero { padding: 36px 24px 27px; } }
</style>