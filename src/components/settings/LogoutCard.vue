<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

async function handleLogout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <section class="settings-card danger" aria-labelledby="danger-title">
    <div class="card-heading">
      <div>
        <p class="card-kicker">Sesión</p>
        <h2 id="danger-title">Cerrar sesión</h2>
      </div>
    </div>

    <p class="settings-note">
      Se cerrará tu sesión en este dispositivo y volverás al inicio de sesión.
    </p>

    <button class="submit-button danger-button" type="button" @click="handleLogout">
      <span>Cerrar sesión</span>
      <span aria-hidden="true">→</span>
    </button>
  </section>
</template>

<style scoped>
.settings-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(20px, 3vw, 28px);
  border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent);
  border-radius: 20px;
  background: color-mix(in oklab, var(--label) 68%, transparent);
  backdrop-filter: blur(18px);
}
.settings-card h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.1;
}
.settings-note {
  margin: 0;
  color: var(--label-ink);
  font-size: 13px;
  line-height: 1.5;
}
.danger {
  border-color: color-mix(in oklab, var(--tag-coral) 45%, transparent);
  background: color-mix(in oklab, var(--tag-coral) 8%, transparent);
}
.danger-button { background: var(--tag-coral); }
.danger-button:hover:not(:disabled) {
  background: color-mix(in oklab, var(--tag-coral) 82%, var(--ocean-near));
}
</style>