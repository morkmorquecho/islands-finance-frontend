<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const showHelp = ref(false);
const helpSeenKey = "island-finance-help-seen";

function openHelp() {
  showHelp.value = true;
}

function closeHelp() {
  showHelp.value = false;
  localStorage.setItem(helpSeenKey, "true");
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeHelp();
}

onMounted(() => {
  if (!localStorage.getItem(helpSeenKey)) showHelp.value = true;
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <button class="help-button" type="button" aria-label="Abrir ayuda" @click="openHelp">
    ?
  </button>

  <Teleport to="body">
    <Transition name="map-modal">
      <div v-if="showHelp" class="map-modal-backdrop" @click.self="closeHelp">
        <section class="map-modal" role="dialog" aria-modal="true" aria-labelledby="map-title">
          <button class="map-close" type="button" aria-label="Cerrar ayuda" @click="closeHelp">×</button>

          <div class="map-compass" aria-hidden="true">✦</div>
          <p class="map-kicker">Carta de navegación</p>
          <h2 id="map-title">Encuentra tu tesoro</h2>
          <p class="map-copy">
            Explora tus archipiélagos, descubre tus islas financieras y sigue el rumbo de todo lo que has construido.
          </p>

          <div class="map-route" aria-hidden="true">
            <span class="route-start">✦</span>
            <span class="route-line"></span>
            <span class="route-end">⚓</span>
          </div>

          <div class="map-legend">
            <span><i class="legend-dot coral"></i> Archipiélagos</span>
            <span><i class="legend-dot teal"></i> Islas</span>
            <span><i class="legend-dot gold"></i> Tu rumbo</span>
          </div>

          <button class="map-action" type="button" @click="closeHelp">Navegar al mapa</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.help-button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid color-mix(in oklab, var(--foreground) 25%, transparent);
  border-radius: 50%;
  color: var(--foreground);
  background: color-mix(in oklab, var(--label) 55%, transparent);
  font: 700 16px var(--font-display);
  cursor: pointer;
}

.map-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(7 37 44 / 62%);
  backdrop-filter: blur(7px);
}

.map-modal {
  position: relative;
  width: min(430px, 100%);
  overflow: hidden;
  padding: 42px 34px 30px;
  border: 1px solid #b89455;
  border-radius: 4px;
  color: #3e3427;
  text-align: center;
  background: #e8d5a9;
  box-shadow: 0 24px 70px rgb(0 0 0 / 35%), inset 0 0 0 7px rgb(118 83 39 / 10%);
}

.map-modal::before,
.map-modal::after {
  position: absolute;
  color: rgb(108 75 35 / 32%);
  font-size: 28px;
  content: "✦";
}

.map-modal::before { top: 13px; left: 16px; }
.map-modal::after { right: 16px; bottom: 10px; }
.map-close {
  position: absolute;
  top: 10px;
  right: 13px;
  border: 0;
  color: #6c4b23;
  background: transparent;
  font-size: 25px;
  cursor: pointer;
}

.map-compass { color: #a46e2e; font-size: 30px; }
.map-kicker { margin: 5px 0 8px; color: #8a632f; font: 700 11px var(--font-sans); letter-spacing: .18em; text-transform: uppercase; }
h2 { margin: 0; font: 700 32px/1.05 var(--font-display); }
.map-copy { margin: 15px auto 20px; max-width: 320px; color: #68563d; font: 14px/1.6 var(--font-sans); }
.map-route { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 18px 0; color: #a46e2e; }
.route-line { width: 125px; border-top: 2px dashed #b89455; transform: rotate(-8deg); }
.map-legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px 15px; margin-bottom: 25px; color: #766044; font-size: 11px; }
.legend-dot { display: inline-block; width: 8px; height: 8px; margin-right: 4px; border-radius: 50%; }
.coral { background: #db806d; } .teal { background: #4d9a98; } .gold { background: #c38a3c; }
.map-action { width: 100%; padding: 12px 18px; border: 0; border-radius: 2px; color: #f8edcf; background: #16535a; font: 700 12px var(--font-sans); cursor: pointer; }
.map-modal-enter-active, .map-modal-leave-active { transition: opacity .2s ease; }
.map-modal-enter-from, .map-modal-leave-to { opacity: 0; }
.map-modal-enter-active .map-modal { animation: map-in .25s ease; }
@keyframes map-in { from { transform: translateY(12px) scale(.97); } to { transform: translateY(0) scale(1); } }
@media (max-width: 480px) { .map-modal { padding-inline: 24px; } }
</style>