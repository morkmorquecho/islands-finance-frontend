<script setup lang="ts">
import OceanBackground from "@/components/OceanBackground.vue";

defineProps<{
  title?: string;       // texto del header-caption
  footerLeft?: string;
  footerRight?: string;
}>();
</script>

<template>
  <main class="auth-page">
    <OceanBackground />

    <header class="auth-header">
      <RouterLink class="brand" to="/" aria-label="Island Finance, página de inicio">
        <span class="card-icon">
          <img src="@/assets/logo.png" alt="" aria-hidden="true" />
        </span>
        <span>Island Finance</span>
      </RouterLink>
    </header>

    <section class="auth-layout" :aria-labelledby="'auth-title'">
      <slot />
    </section>

    <footer class="auth-footer">
      <span>{{ footerLeft ?? "Island Finance" }}</span>
      <span aria-hidden="true">•</span>
      <span>{{ footerRight ?? "Tu patrimonio, en un solo horizonte" }}</span>
    </footer>
  </main>
</template>