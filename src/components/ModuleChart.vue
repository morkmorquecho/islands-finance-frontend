<script setup lang="ts">
import { computed } from "vue";

type ChartEntry = {
  id?: string | number;
  name: string;
  value: number;
  tintVar?: string;
};

const props = defineProps<{
  moduleName: string;
  total: number;
  entries: ChartEntry[];
}>();

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const BRAND_PALETTE = [
  "#2FA36B",
  "#0B4F6C",
  "#4C7CE0",
  "#5EC2C7",
  "#F4B740",
  "#3FA7A0",
  "#FF8A65",
  "#8A40DA",
  "#E85D75",
  "#F2994A",
];

function isValidColor(value?: string) {
  if (!value) return false;

  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
    value.startsWith("var(")
  );
}

function colorForEntry(entry: ChartEntry) {
  return entry.tintVar || "var(--tint-default)";
}

const moduleTotal = computed(() =>
  Math.max(0, Number(props.total) || 0),
);

const islandEntries = computed(() =>
  props.entries.map((entry, index) => {
    const id = entry.id ?? `${entry.name}-${index}`;

    return {
      ...entry,
      id,
      value: Math.max(0, Number(entry.value) || 0),
      color: colorForEntry(entry),
    };
  }),
);

function islandPercentage(value: number) {
  if (!moduleTotal.value) return 0;

  return Math.min(
    100,
    Math.max(0, (value / moduleTotal.value) * 100),
  );
}
</script>

<template>
  <article class="module-chart">
    <header class="module-chart-header">
      <div>
        <p class="module-chart-eyebrow">Archipiélago</p>

        <h3 class="module-chart-title">
          {{ moduleName }}
        </h3>
      </div>

      <strong class="module-chart-total">
        {{ currency.format(moduleTotal) }}
      </strong>
    </header>

    <div
      v-if="islandEntries.length"
      class="module-chart-islands"
    >
      <div
        v-for="entry in islandEntries"
        :key="entry.id"
        class="island-stat"
      >
        <div class="island-stat-header">
          <span class="island-stat-name">
            {{ entry.name }}
          </span>

          <strong class="island-stat-value">
            {{ currency.format(entry.value) }}
          </strong>
        </div>

        <div
          class="island-stat-track"
          role="progressbar"
          :aria-label="`Proporción de ${entry.name}`"
          :aria-valuenow="islandPercentage(entry.value)"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span
            class="island-stat-fill"
            :style="{
              width: `${islandPercentage(entry.value)}%`,
              backgroundColor: entry.color,
            }"
          />
        </div>
      </div>
    </div>

    <p v-else class="module-chart-empty">
      No hay islas con información disponible.
    </p>
  </article>
</template>

<style scoped>
.module-chart {
  width: 100%;
  min-width: 0;
  min-height: 190px;
  padding: 20px;
  border-radius: calc(var(--radius) * 1.4);
  color: var(--label-ink);
  background: color-mix(in oklab, var(--label) 94%, transparent);
  box-shadow: 0 18px 42px -24px rgb(0 0 0 / 65%);
}

.module-chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.module-chart-eyebrow {
  margin: 0 0 4px;
  color: color-mix(in oklab, var(--label-ink) 58%, transparent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-chart-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.1;
}

.module-chart-total {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 17px;
  font-variant-numeric: tabular-nums;
}

.module-chart-islands {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.island-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.island-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  font-size: 12px;
}

.island-stat-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.island-stat-value {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.island-stat-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in oklab, var(--rock) 22%, transparent);
}

.island-stat-fill {
  display: block;
  height: 100%;
  min-width: 3px;
  border-radius: inherit;
  transition: width 350ms ease;
}

.module-chart-empty {
  margin: 0;
  color: color-mix(in oklab, var(--label-ink) 58%, transparent);
  font-size: 12px;
}

@media (max-width: 760px) {
  .module-chart-header {
    gap: 12px;
  }

  .module-chart-total {
    font-size: 15px;
  }
}
</style>