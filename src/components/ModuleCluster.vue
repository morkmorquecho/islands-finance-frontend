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
