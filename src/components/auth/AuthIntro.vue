<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; highlight?: string; copy: string }>();
</script>

<template>
  <div class="auth-intro">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1 id="auth-title">
      {{ title }}
      <em v-if="highlight">{{ highlight }}</em>
    </h1>
    <p class="intro-copy">{{ copy }}</p>
    <div class="horizon-line" aria-hidden="true">
      <span /><span /><span />
    </div>
  </div>
</template>