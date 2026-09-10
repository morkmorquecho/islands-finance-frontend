<script setup lang="ts">
defineProps<{ kicker: string; heading: string }>();
</script>

<template>
  <form class="auth-card" @submit.prevent="$emit('submit')">
    <div class="card-heading">
      <span class="card-icon">
        <img src="@/assets/logo.png" alt="" aria-hidden="true" />
      </span>
      <div>
        <p class="card-kicker">{{ kicker }}</p>
        <h2>{{ heading }}</h2>
      </div>
    </div>
    <slot />
  </form>
</template>

<script lang="ts">
export default { emits: ["submit"] };
</script>