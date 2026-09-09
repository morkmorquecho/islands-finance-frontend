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