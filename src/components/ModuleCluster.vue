<script setup lang="ts">
import { computed } from "vue";
import Island from "./Island.vue";
import type { IslandAccount } from "../types/brand-tints";

const props = defineProps<{
  moduleName: string;
  accentColor: "coral" | "teal" | "sun";
  islands: IslandAccount[];
  clusterIndex: number;
}>();

const compact = computed(() => props.islands.length > 4);
</script>

<template>
  <section :class="`module-cluster module-cluster--${islands.length}`" :aria-label="moduleName">
    <h2 :class="`module-tag module-tag--${accentColor}`">{{ moduleName }}</h2>
    <div class="module-reef">
      <Island
        v-for="(island, index) in islands"
        :key="`${moduleName}-${island.name}`"
        :name="island.name"
        :brand-tint="island.brandTint"
        :compact="compact"
        :variant="index + clusterIndex"
        :animation-delay="-(clusterIndex * 0.9 + index * 0.65)"
        :vegetation="(clusterIndex === 0 && index === 0) || (clusterIndex === 2 && index === 1)"
      />
    </div>
  </section>
</template>

<style scoped>
.module-cluster {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}
.module-cluster:nth-child(2) { align-self: start; margin-top: 70px; }

.module-tag {
  position: relative;
  z-index: 4;
  margin: 0 0 12px;
  padding: 7px 13px;
  border-radius: 999px;
  color: var(--label-ink);
  background: var(--label);
  box-shadow: 0 2px 0 color-mix(in oklab, var(--foreground) 10%, transparent);
  font-size: clamp(11px, 1.15vw, 14px);
  font-weight: 600;
  text-align: center;
}
.module-tag::before {
  content: "";
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--module-accent);
}
.module-tag--coral { --module-accent: var(--tag-coral); }
.module-tag--teal { --module-accent: var(--tag-teal); }
.module-tag--sun { --module-accent: var(--tag-sun); }

.module-reef {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 210px;
  padding: 12px 4px 0;
  background: radial-gradient(ellipse at center 58%, color-mix(in oklab, var(--reef) 64%, transparent) 0 31%, color-mix(in oklab, var(--reef) 26%, transparent) 45%, transparent 68%);
}

@media (max-width: 760px) {
  .module-cluster, .module-cluster:nth-child(2) { align-self: auto; margin-top: 0; }
  .module-reef { min-height: 155px; padding-inline: 20px; }
}
</style>