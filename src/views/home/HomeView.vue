<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import OceanBackground from "../../components/OceanBackground.vue";
import SeabedBackground from "../../components/SeabedBackground.vue";
import ModuleCluster from "../../components/ModuleCluster.vue";
import ModuleChart from "../../components/ModuleChart.vue";
import { BRAND_TINTS, type IslandAccount } from "../../types/brand-tints";

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
            { name: "Cetes", brandTint: BRAND_TINTS.cetes },
      { name: "Nu ahorro", brandTint: BRAND_TINTS.nu },
            
    ],
  },
  
];

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
        <RouterLink class="finance-brand" to="/" aria-label="Island Finance, inicio">
          <span class="card-icon">
            <img src="@/assets/logo.png" alt="" aria-hidden="true" />
          </span>
                  Island Finance
        </RouterLink>
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

<style scoped>
.finance-scene {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  color: var(--foreground);
  background: var(--sky-top);
}

.ocean-stage {
  position: relative;
  isolation: isolate; /* mantiene el z-index: -1 del ocean-background contenido acá */
}

.finance-header { display: flex; align-items: center; justify-content: space-between; width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding-top: 24px; }
.finance-brand { display: inline-flex; align-items: center; gap: 10px; color: var(--foreground); font-family: var(--font-display); font-size: 18px; font-weight: 700; text-decoration: none; }
.finance-brand-mark { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid color-mix(in oklab, var(--foreground) 28%, transparent); border-radius: 50%; color: var(--ocean-deep); }
.profile-button { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid color-mix(in oklab, var(--foreground) 25%, transparent); border-radius: 50%; color: var(--foreground); background: color-mix(in oklab, var(--label) 55%, transparent); font: 600 12px var(--font-sans); cursor: pointer; }
.profile-button:focus-visible, .finance-brand:focus-visible { outline: 3px solid var(--tag-coral); outline-offset: 4px; }

.finance-summary { position: relative; z-index: 2; width: min(720px, calc(100% - 32px)); margin: 34px auto 0; text-align: center; }
.finance-summary > p:first-child { margin: 0 0 4px; font-size: 13px; font-weight: 600; }
.finance-summary h1 { margin: 0; font-family: var(--font-display); font-size: clamp(48px, 6vw, 80px); line-height: .98; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.finance-summary h1 span { font-size: .5em; opacity: .55; }
.finance-summary-note { margin: 12px 0 0; font-size: 14px; opacity: .72; }

.archipelago-stage {
  position: relative;
  z-index: 1;
}

.archipelago-map { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(var(--cluster-count, 3), minmax(0, 1fr)); align-items: end; gap: clamp(12px, 3vw, 54px); width: min(1180px, calc(100% - 40px)); min-height: 470px; margin: -22px auto 0; padding: 68px 0 54px; }
.archipelago-map--3 { --cluster-count: 3; }

.seabed-stage {
  position: relative;
  isolation: isolate;
  /* Continúa el mismo hue que .ocean-background (194), nunca lo cambia */
  background: linear-gradient(to bottom,
    var(--ocean-deep) 0%,
    color-mix(in oklab, var(--ocean-deep) 55%, black) 55%,
    oklch(0.14 0.04 194) 100%);
}

.depth-transition {
  position: relative;
  z-index: 1;
  height: clamp(420px, 62vh, 760px);
  pointer-events: none;
  /* ✅ Este es el punto donde el mar se oscurece */
}

.seabed-charts {
  position: relative;
  z-index: 2;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding-bottom: 90px;
  opacity: var(--charts-progress, 0);
  transform: translate3d(0, calc((1 - var(--charts-progress, 0)) * 36px), 0);
}
.seabed-title { margin: 0 0 20px; color: var(--shore); font-family: var(--font-display); font-size: clamp(22px, 3vw, 30px); text-align: center; }
.seabed-charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }

.scene-footer { position: absolute; right: 24px; bottom: 18px; left: 24px; display: flex; justify-content: center; gap: 9px; font-size: 11px; opacity: .65; }

@media (max-width: 760px) {
  .finance-header { width: calc(100% - 32px); padding-top: 18px; }
  .finance-summary { margin-top: 26px; }
  .finance-summary h1 { font-size: clamp(42px, 14vw, 62px); }
  .finance-summary-note { max-width: 290px; margin-inline: auto; }
  .archipelago-map { grid-template-columns: 1fr; align-items: initial; gap: 12px; width: min(520px, calc(100% - 24px)); min-height: auto; margin-top: 0; padding: 48px 0 74px; }
}

@media (prefers-reduced-motion: reduce) {
  .archipelago-stage, .seabed-charts { transition: none; }
}
</style>