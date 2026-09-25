<script setup lang="ts">
  import { computed } from "vue";
  import { useAuthStore } from "@/stores/auth";

  import SettingsHeader from "@/components/settings/SettingsHeader.vue";
  import SettingsLinkCard from "@/components/settings/SettingsLinkCard.vue";
  import ChangePasswordCard from "@/components/settings/ChangePasswordCard.vue";
  import ChangeEmailCard from "@/components/settings/ChangeEmailCard.vue";
  import LogoutCard from "@/components/settings/LogoutCard.vue";

  const authStore = useAuthStore();
  const hideSensitiveCards = computed(
    () => authStore.user?.username?.trim().toLowerCase() === "user",
  );
</script>

<template>
  <main class="settings-page">
    <SettingsHeader
      title="Ajustes"
      subtitle="Gestiona la seguridad de tu cuenta y tus datos de acceso."
      :back-to="{ name: 'home' }"
      back-label="Volver al inicio"
    />

    <SettingsLinkCard
      kicker="Tu actividad"
      title="Gastos y estadísticas"
      note="Explora tus gastos por categoría, periodo e isla."
      :to="{ name: 'expenses' }"
    />

    <SettingsLinkCard
      kicker="Tus metas"
      title="Objetivos de ahorro"
      note="Crea, edita y da seguimiento a tus objetivos recurrentes."
      :to="{ name: 'goals' }"
    />

    <ChangePasswordCard v-if="!hideSensitiveCards" />
    <ChangeEmailCard v-if="!hideSensitiveCards" />
    <LogoutCard />
  </main>
</template>

<style scoped>
.settings-page {
  width: min(640px, 100%);
  margin: 0 auto;
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--foreground);
}
</style>