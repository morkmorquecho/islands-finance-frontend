<script setup lang="ts">
defineProps<{
  kicker: string;
  title: string;
  note: string;
  to: { name: string };
}>();
</script>

<template>
  <RouterLink class="settings-card analytics-link" :to="to">
    <div class="card-heading">
      <div>
        <p class="card-kicker">{{ kicker }}</p>
        <h2>{{ title }}</h2>
        <p class="settings-note">{{ note }}</p>
      </div>
      <span aria-hidden="true">→</span>
    </div>
  </RouterLink>
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
.analytics-link {
  color: inherit;
  text-decoration: none;
  transition: transform 160ms ease, border-color 160ms ease;
}
.analytics-link:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--tag-teal) 52%, transparent);
}
.analytics-link .card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.analytics-link .card-heading > span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--label);
  background: var(--ocean-deep);
  font-weight: 700;
}
</style>