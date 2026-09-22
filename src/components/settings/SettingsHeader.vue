<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  backTo?: { name: string };
  backLabel?: string;
}>();
</script>

<template>
  <header class="settings-header">
    <RouterLink v-if="backTo" class="back-link" :to="backTo">
      ← {{ backLabel ?? 'Volver' }}
    </RouterLink>
    <h1>{{ title }}</h1>
    <p v-if="subtitle" class="settings-subtitle">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.settings-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.back-link {
  color: var(--label-ink);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  width: fit-content;
}
.back-link:hover {
  color: var(--ocean-deep);
  text-decoration: underline;
}
.settings-header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1;
  letter-spacing: -0.03em;
}
.settings-subtitle {
  margin: 0;
  color: var(--label-ink);
  font-size: 14px;
  line-height: 1.5;
}
</style>