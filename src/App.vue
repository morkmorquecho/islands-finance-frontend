<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import OceanBackground from "./components/OceanBackground.vue";
import SeabedBackground from "./components/SeabedBackground.vue";
import ModuleCluster from "./components/ModuleCluster.vue";
import ModuleChart from "./components/ModuleChart.vue";
import { BRAND_TINTS, type IslandAccount } from "./types/brand-tints";

type FinanceModule = {
  moduleName: string;
  accentColor: "coral" | "teal" | "sun";
  islands: IslandAccount[];
};

const MODULES: FinanceModule[] = [
  {
    moduleName: "Fondo de emergencias",
    accentColor: "coral",
    islands: [
      { name: "Nu", brandTint: BRAND_TINTS.nu },
      { name: "Mercado Pago", brandTint: BRAND_TINTS.mercadoPago },
    ],
  },
  {
    moduleName: "Ocio",
    accentColor: "teal",
    islands: [
      { name: "Revolut", brandTint: BRAND_TINTS.revolut },
      { name: "Viajes", brandTint: BRAND_TINTS.default },
    ],
  },
  {
    moduleName: "Fondo de ahorros",
    accentColor: "sun",
    islands: [
      { name: "Cetes", brandTint: BRAND_TINTS.cetes },
      { name: "Nu ahorro", brandTint: BRAND_TINTS.nu },
      { name: "Inversión", brandTint: BRAND_TINTS.default },
    ],
  },
];

// Datos estáticos para las gráficas del fondo marino (mismos módulos de arriba).
const CHART_MODULES = [
  {
    moduleName: "Fondo de emergencias",
    total: 68400,
    entries: [
      { name: "Nu", value: 41200, tintVar: "var(--tint-nu)" },
      { name: "Mercado Pago", value: 27200, tintVar: "var(--tint-mercado-pago)" },
    ],
  },
  {
    moduleName: "Ocio",
    total: 19850,
    entries: [
      { name: "Revolut", value: 12300, tintVar: "var(--tint-revolut)" },
      { name: "Viajes", value: 7550, tintVar: "var(--tint-default)" },
    ],
  },
  {
    moduleName: "Fondo de ahorros",
    total: 196400,
    entries: [
      { name: "Cetes", value: 98000, tintVar: "var(--tint-cetes)" },
      { name: "Nu ahorro", value: 61400, tintVar: "var(--tint-nu)" },
      { name: "Inversión", value: 37000, tintVar: "var(--tint-default)" },
    ],
  },
];

const sceneEl = ref<HTMLElement | null>(null);
const transitionEl = ref<HTMLElement | null>(null);
const isSubmerged = ref(false);
let ticking = false;

function updateProgress() {
  ticking = false;
  const scene = sceneEl.value;
  const zone = transitionEl.value;
  if (!scene || !zone) return;

  const vh = window.innerHeight;
  const rect = zone.getBoundingClientRect();
  const total = rect.height + vh;
  const scrolled = vh - rect.top;
  const deepProgress = Math.min(1, Math.max(0, scrolled / total));

  // Las gráficas emergen en la segunda mitad del recorrido, así el fondo
  // se oscurece primero y los datos aparecen ya "bajo el agua".
  const chartsProgress = Math.min(1, Math.max(0, (deepProgress - 0.35) / 0.65));

  scene.style.setProperty("--deep-progress", deepProgress.toFixed(4));
  scene.style.setProperty("--charts-progress", chartsProgress.toFixed(4));
  isSubmerged.value = deepProgress > 0.97;
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateProgress);
}

onMounted(() => {
  updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});
</script>
<template>
  <main class="finance-scene" ref="sceneEl">

    <div class="ocean-stage">
      <OceanBackground />

      <header class="finance-header">
        <a class="finance-brand" href="#patrimonio" aria-label="Island Finance, inicio">
          <span class="finance-brand-mark" aria-hidden="true">◒</span>
          Island Finance
        </a>
        <button class="profile-button" type="button" aria-label="Abrir perfil">MM</button>
      </header>

      <section class="finance-summary" id="patrimonio" aria-labelledby="page-title">
        <p>Tu patrimonio total</p>
        <h1 id="page-title">$284,650<span>.00</span></h1>
        <p class="finance-summary-note">Todo lo que has construido, en un solo horizonte.</p>
      </section>

      <div class="archipelago-stage" :class="{ 'is-submerged': isSubmerged }">
        <div :class="`archipelago-map archipelago-map--${MODULES.length}`">
          <ModuleCluster
            v-for="(mod, index) in MODULES"
            :key="mod.moduleName"
            :module-name="mod.moduleName"
            :accent-color="mod.accentColor"
            :islands="mod.islands"
            :cluster-index="index"
          />
        </div>
      </div>
    </div>

    <div class="seabed-stage">
      <SeabedBackground />

      <div class="depth-transition" ref="transitionEl" aria-hidden="true" />

      <section class="seabed-charts" aria-labelledby="deep-title">
        <h2 id="deep-title" class="seabed-title">Bajo la superficie</h2>
        <div class="seabed-charts-grid">
          <ModuleChart
            v-for="mod in CHART_MODULES"
            :key="mod.moduleName"
            :module-name="mod.moduleName"
            :total="mod.total"
            :entries="mod.entries"
          />
        </div>
      </section>
    </div>

    <footer class="scene-footer">
      <span>Actualizado hoy</span>
      <span aria-hidden="true">•</span>
      <span>3 archipiélagos · 7 islas</span>
    </footer>
  </main>
</template>