<script setup lang="ts">
defineProps<{
  visible?: boolean
}>()
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="visible !== false" class="loading-screen" role="status" aria-live="polite">
      <div class="loading-screen__sun" aria-hidden="true" />
      <div class="loading-screen__glow" aria-hidden="true" />
      <div class="loading-screen__leaf loading-screen__leaf--left" aria-hidden="true" />
      <div class="loading-screen__leaf loading-screen__leaf--right" aria-hidden="true" />

      <div class="loading-screen__content">
        <p class="loading-screen__brand">Island Finance</p>
        <p class="loading-screen__message">Preparando tu horizonte financiero</p>

        <div class="loading-screen__progress" aria-hidden="true">
          <span />
        </div>

        <span class="sr-only">Cargando tus archipiélagos</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #c8e6e1;
  background: linear-gradient(145deg, #49c1bf 0%, #2cb6b2 45%, #1ba69f 100%);
}

.loading-screen__sun {
  position: absolute;
  top: 12%;
  width: min(42vw, 280px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #f5c578;
  opacity: 0.58;
  filter: blur(2px);
}

.loading-screen__glow {
  position: absolute;
  width: min(95vw, 820px);
  aspect-ratio: 1;
  border-radius: 44% 56% 52% 48%;
  background: radial-gradient(ellipse, rgba(200, 230, 225, 0.28), transparent 66%);
  filter: blur(16px);
  transform: rotate(-18deg);
}

.loading-screen__leaf {
  position: absolute;
  width: 170px;
  height: 330px;
  border-radius: 100% 0 100% 0;
  border-left: 3px solid rgba(254, 216, 171, 0.5);
  background: linear-gradient(135deg, rgba(27, 166, 159, 0.8), rgba(73, 193, 191, 0.14));
  opacity: 0.72;
}

.loading-screen__leaf--left {
  left: -65px;
  bottom: -80px;
  transform: rotate(28deg);
}

.loading-screen__leaf--right {
  top: -100px;
  right: -75px;
  transform: rotate(205deg) scale(0.8);
}

.loading-screen__content {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 42px 46px;
  text-align: center;
  border: 1px solid rgba(254, 216, 171, 0.42);
  border-radius: 42% 58% 48% 52%;
  background: rgba(27, 166, 159, 0.28);
  box-shadow: 0 24px 70px rgba(27, 96, 92, 0.2), inset 0 0 45px rgba(254, 216, 171, 0.1);
  backdrop-filter: blur(9px);
}

.loading-screen__brand {
  margin: 0;
  color: #fed8ab;
  font: 700 28px/1 Georgia, serif;
}

.loading-screen__message {
  margin: 0;
  color: rgba(200, 230, 225, 0.9);
  font: 500 13px/1.4 sans-serif;
}

.loading-screen__progress {
  width: 132px;
  height: 4px;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(200, 230, 225, 0.28);
}

.loading-screen__progress span {
  display: block;
  width: 45%;
  height: 100%;
  border-radius: inherit;
  background: #f5c578;
  animation: progress 1.35s ease-in-out infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.35s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes progress {
  0% { transform: translateX(-110%); }
  100% { transform: translateX(300%); }
}

@media (prefers-reduced-motion: reduce) {
  .loading-screen__progress span {
    animation: none;
  }
}
</style>