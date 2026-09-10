<script setup lang="ts">
defineProps<{
  moduleName: string;
  total: number;
  entries: { name: string; value: number; tintVar: string }[];
}>();

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
</script>

<template>
  <article class="module-chart">
    <div class="module-chart-head">
      <h3 class="module-chart-title">{{ moduleName }}</h3>
      <span class="module-chart-total">{{ currency.format(total) }}</span>
    </div>
    <div class="module-chart-bars">
      <div class="module-chart-row" v-for="entry in entries" :key="entry.name">
        <span>{{ entry.name }}</span>
        <span class="module-chart-track">
          <span
            class="module-chart-fill"
            :style="{ width: `${Math.round((entry.value / total) * 100)}%`, background: entry.tintVar }"
          />
        </span>
        <span class="module-chart-value">{{ currency.format(entry.value) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.module-chart {
  padding: 20px 22px 18px;
  border-radius: calc(var(--radius) * 1.4);
  background: color-mix(in oklab, var(--label) 92%, transparent);
  box-shadow: 0 14px 34px -18px color-mix(in oklab, black 55%, transparent);
  color: var(--label-ink);
}
.module-chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0 0 14px;
}
.module-chart-title { margin: 0; font-family: var(--font-display); font-size: 18px; }
.module-chart-total { font-variant-numeric: tabular-nums; font-weight: 700; }
.module-chart-bars { display: flex; flex-direction: column; gap: 10px; }
.module-chart-row { display: grid; grid-template-columns: 84px 1fr auto; align-items: center; gap: 10px; font-size: 12.5px; }
.module-chart-track { height: 8px; border-radius: 999px; background: color-mix(in oklab, var(--rock) 14%, transparent); overflow: hidden; }
.module-chart-fill { display: block; height: 100%; border-radius: 999px; }
.module-chart-value { font-variant-numeric: tabular-nums; text-align: right; }
</style>