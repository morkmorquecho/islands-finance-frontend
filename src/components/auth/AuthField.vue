<script setup lang="ts">
defineProps<{ id: string; label: string; icon?: string }>();
</script>

<template>
  <div class="field">
    <div class="field-label-row">
      <label :for="id">{{ label }}</label>
      <slot name="action" />
    </div>
    <div class="input-shell">
      <span v-if="icon" class="input-icon" aria-hidden="true">{{ icon }}</span>
      <slot />
    </div>
  </div>
</template>