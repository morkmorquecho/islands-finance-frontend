<script setup lang="ts">
import { computed } from "vue";
import Island from "./Island.vue";
import type { IslandAccount } from "../types/brand-tints";

const props = defineProps<{
  moduleName: string;
  accentColor: "coral" | "teal" | "sun";
  islands: IslandAccount[];
  clusterIndex: number;
  isSystem: boolean;
}>();

const emit = defineEmits<{
  (e: "add-island"): void;
  (e: "select-island", islandId: string): void;
  (e: "edit-module"): void;
  (e: "delete-module"): void;
}>();

const compact = computed(() => props.islands.length > 4);
</script>

<template>
  <section :class="`module-cluster module-cluster--${islands.length}`" :aria-label="moduleName">
    <div class="module-tag-row">
      <h2 :class="`module-tag module-tag--${accentColor}`">{{ moduleName }}</h2>
      <button class="add-island-btn" type="button" aria-label="Agregar isla" @click="emit('add-island')">+</button>
      <template v-if="!isSystem">
        <button class="module-action-btn" type="button" aria-label="Editar archipiélago" @click="emit('edit-module')">Editar</button>
        <button class="module-action-btn module-action-btn--danger" type="button" aria-label="Eliminar archipiélago" @click="emit('delete-module')">Eliminar</button>
      </template>
    </div>
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
        @select="emit('select-island', island.id)"
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
}.module-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.module-tag { margin: 0; }

.add-island-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  color: var(--label);
  background: var(--module-accent, var(--ocean-deep));
  font: 700 14px var(--font-sans);
  line-height: 1;
  cursor: pointer;
  transition: transform 140ms ease;
}
.add-island-btn:hover { transform: scale(1.12); }
.module-action-btn { border: 0; padding: 3px 6px; border-radius: 6px; color: var(--ocean-deep); background: color-mix(in oklab, var(--label) 75%, transparent); font: 700 10px var(--font-sans); cursor: pointer; }
.module-action-btn--danger { color: #a13d30; }
</style>

