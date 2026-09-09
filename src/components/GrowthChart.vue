<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  moduleName: string;
  tintVar: string;
  points: { label: string; value: number }[];
}>();

const W = 280;
const H = 110;
const PAD_X = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

const coords = computed(() => {
  const values = props.points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (W - PAD_X * 2) / (props.points.length - 1);

  return props.points.map((p, i) => ({
    x: PAD_X + step * i,
    y: PAD_TOP + (1 - (p.value - min) / range) * (H - PAD_TOP - PAD_BOTTOM),
    label: p.label,
  }));
});

const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ")
);

const areaPath = computed(() => {
  const first = coords.value[0];
  const last = coords.value[coords.value.length - 1];
  const base = H - PAD_BOTTOM;
  return `M${first.x.toFixed(1)} ${base} ${linePath.value.slice(1)} L${last.x.toFixed(1)} ${base} Z`;
});

const growthPct = computed(() => {
  const first = props.points[0].value;
  const last = props.points[props.points.length - 1].value;
  return Math.round(((last - first) / first) * 100);
});

const gradientId = computed(() => `growth-fill-${props.moduleName.replace(/\s+/g, "-").toLowerCase()}`);
</script>

<template>
  <article class="growth-chart">
    <div class="growth-chart-head">
      <h3 class="growth-chart-title">{{ moduleName }}</h3>
      <span class="growth-chart-delta" :class="{ 'is-positive': growthPct >= 0 }">
        {{ growthPct >= 0 ? "+" : "" }}{{ growthPct }}%
      </span>
    </div>
    <svg class="growth-chart-svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="tintVar" stop-opacity=".45" />
          <stop offset="100%" :stop-color="tintVar" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#${gradientId})`" stroke="none" />
      <path :d="linePath" fill="none" :stroke="tintVar" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle v-for="(c, i) in coords" :key="i" :cx="c.x" :cy="c.y" r="2.4" :fill="tintVar" />
    </svg>
    <div class="growth-chart-axis">
      <span v-for="c in coords" :key="c.label">{{ c.label }}</span>
    </div>
  </article>
</template>