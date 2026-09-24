<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  icon?: string;
  error?: string;
}>();
</script>

<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <div class="field-label-row">
      <label :for="id">{{ label }}</label>
      <slot name="action" />
    </div>
    <div class="input-shell">
      <span v-if="icon" class="input-icon" aria-hidden="true">{{ icon }}</span>
      <slot />
    </div>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field--error .input-shell {
  border-color: var(--color-error, #e53e3e);
}

.field-error {
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--color-error, #e53e3e);
}
</style>