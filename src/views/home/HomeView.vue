<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import OceanBackground from "../../components/OceanBackground.vue";
import SeabedBackground from "../../components/SeabedBackground.vue";
import ModuleCluster from "../../components/ModuleCluster.vue";
import ModuleChart from "../../components/ModuleChart.vue";
import { BRAND_TINTS, type IslandAccount } from "../../types/brand-tints";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import modulesService from "@/services/modules.service";
import islandsService from "@/services/islands.service";

type FinanceModule = {
  id: string;
  moduleName: string;
  moduleType: string;
  accentColor: "coral" | "teal" | "sun";
  islands: IslandAccount[];
  totalValue: number;
  isSystem: boolean;
};

const ACCENTS = ["coral", "teal", "sun"] as const;
const moneyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ── módulos / islas reales ─────────────────────────────────────────
const ui = useUIStore();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const userInitials = computed(() => {
  const source = user.value?.username?.trim() || user.value?.email?.trim() || '';
  if (!source) return '';
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});
const modules = ref<FinanceModule[]>([]);
const loadingModules = ref(true);
const modulesError = ref("");

function tintForIsland(island: any) {
  return BRAND_TINTS[island.template as keyof typeof BRAND_TINTS] ?? BRAND_TINTS.default;
}

async function loadModules() {
  loadingModules.value = true;
  modulesError.value = "";
  try {
    const modulesData = (await modulesService.list()) as any;
    modules.value = await Promise.all(
      modulesData.results.map(async (mod: any, index: number) => {
        const islandsData = (await islandsService.list({ module: mod.id })) as any;
        return {
          id: mod.id,
          moduleName: mod.name,
          moduleType: mod.type,
          accentColor: ACCENTS[index % ACCENTS.length],
          islands: islandsData.results.map((isl: any) => ({
            id: String(isl.id),
            name: isl.name,
            brandTint: tintForIsland(isl),
            isSystem: Boolean(isl.is_system),
          })),
          totalValue: Number(mod.total_value ?? 0),
          isSystem: Boolean(mod.is_system),
        } as FinanceModule;
      })
    );
  } catch (err: any) {
    modulesError.value = err.message ?? "No se pudieron cargar tus archipiélagos.";
  } finally {
    loadingModules.value = false;
  }
}

function openModuleForm(module: any = null) {
  ui.showFormModal("module", {
    title: module ? "Editar archipiélago" : "Nuevo archipiélago",
    module,
    onSuccess: loadModules,
  });
}

function openIslandForm(moduleId: string) {
  ui.showFormModal("island", {
    title: "Nueva isla",
    moduleId,
    onSuccess: loadModules,
  });
}

function openIslandInfo(islandId: string) {
  ui.showIslandInfo(islandId, { onSuccess: loadModules });
}

function confirmModuleDeletion(module: FinanceModule) {
  if (module.isSystem) return;
  ui.showModal(`¿Eliminar el archipiélago “${module.moduleName}”? Esta acción no se puede deshacer.`, "Eliminar archipiélago", "", {
    showActionButton: true,
    buttonText: "Eliminar",
    showCancelButton: true,
    onConfirm: async () => {
      await modulesService.destroy(module.id);
      await loadModules();
    },
  });
}

const clusterCountStyle = computed(() => ({
  "--cluster-count": String(modules.value.length || 1),
}));

const totalPatrimonio = computed(() => {
  return modules.value.reduce((sum, mod) => sum + Number(mod.totalValue ?? 0), 0);
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

// ── charts de "bajo la superficie" (aún con datos de ejemplo) ──────
// TODO: reemplazar por datos reales cuando tengamos un endpoint de analítica
// por módulo; por ahora se deja fijo para no romper el diseño existente.
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

// ── scroll / efecto de profundidad (sin cambios) ────────────────────
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
  loadModules();
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
        <div class="header-actions">
          <button class="new-module-button" type="button" @click="openModuleForm">+ Archipiélago</button>
          <RouterLink class="profile-button" :to="{ name: 'settings' }" aria-label="Abrir ajustes de perfil">
            {{ userInitials || '•' }}
          </RouterLink>
        </div>
      </header>

      <section class="finance-summary" id="patrimonio" aria-labelledby="page-title">
        <p>Tu patrimonio total</p>
        <h1 id="page-title">{{ formatMoney(totalPatrimonio) }}</h1>
        <p class="finance-summary-note">Todo lo que has construido, en un solo horizonte.</p>
      </section>

      <div class="archipelago-stage" :class="{ 'is-submerged': isSubmerged }">
        <p v-if="modulesError" class="modules-error">{{ modulesError }}</p>

        <p v-if="!loadingModules && !modules.length" class="modules-empty">
          Todavía no tienes archipiélagos (Propósitos financieros).
          <button type="button" class="link-button" @click="openModuleForm">Crea el primero</button>
        </p>

        <div v-if="modules.length" class="archipelago-map" :style="clusterCountStyle">
          <ModuleCluster
            v-for="(mod, index) in modules"
            :key="mod.id"
            :module-name="mod.moduleName"
            :accent-color="mod.accentColor"
            :islands="mod.islands"
            :cluster-index="index"
            :is-system="mod.isSystem"
            @add-island="openIslandForm(mod.id)"
            @select-island="openIslandInfo"
            @edit-module="openModuleForm({ id: mod.id, name: mod.moduleName, type: mod.moduleType })"
            @delete-module="confirmModuleDeletion(mod)"
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
      <span>{{ modules.length }} archipiélagos · {{ modules.reduce((n, m) => n + m.islands.length, 0) }} islas</span>
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

.header-actions { display: flex; align-items: center; gap: 10px; }
.new-module-button {
  padding: 0 14px;
  height: 38px;
  border: 1px solid color-mix(in oklab, var(--foreground) 25%, transparent);
  border-radius: 999px;
  color: var(--foreground);
  background: color-mix(in oklab, var(--label) 55%, transparent);
  font: 700 12px var(--font-sans);
  cursor: pointer;
}
.new-module-button:hover { background: color-mix(in oklab, var(--ocean-deep) 12%, transparent); }

.profile-button { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid color-mix(in oklab, var(--foreground) 25%, transparent); border-radius: 50%; color: var(--foreground); background: color-mix(in oklab, var(--label) 55%, transparent); font: 600 12px var(--font-sans); cursor: pointer; }
.profile-button:focus-visible, .finance-brand:focus-visible, .new-module-button:focus-visible { outline: 3px solid var(--tag-coral); outline-offset: 4px; }

.finance-summary { position: relative; z-index: 2; width: min(720px, calc(100% - 32px)); margin: 34px auto 0; text-align: center; }
.finance-summary > p:first-child { margin: 0 0 4px; font-size: 13px; font-weight: 600; }
.finance-summary h1 { margin: 0; font-family: var(--font-display); font-size: clamp(48px, 6vw, 80px); line-height: .98; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.finance-summary h1 span { font-size: .5em; opacity: .55; }
.finance-summary-note { margin: 12px 0 0; font-size: 14px; opacity: .72; }

.archipelago-stage {
  position: relative;
  z-index: 1;
}

.modules-error {
  width: min(720px, calc(100% - 32px));
  margin: 16px auto 0;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--tag-coral);
  background: color-mix(in oklab, var(--tag-coral) 10%, transparent);
  font-size: 13px;
  text-align: center;
}

.modules-empty {
  width: min(480px, calc(100% - 32px));
  margin: 40px auto 0;
  color: var(--label-ink);
  font-size: 14px;
  text-align: center;
}
.link-button {
  border: 0;
  padding: 0;
  margin-left: 4px;
  color: var(--foreground);
  background: transparent;
  font: 700 14px var(--font-sans);
  text-decoration: underline;
  cursor: pointer;
}

/* .archipelago-map { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(var(--cluster-count, 3), minmax(0, 1fr)); align-items: end; gap: clamp(12px, 3vw, 54px); width: min(1180px, calc(100% - 40px)); min-height: 470px; margin: -22px auto 0; padding: 68px 0 54px; } */

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
  /* .archipelago-map { grid-template-columns: 1fr; align-items: initial; gap: 12px; width: min(520px, calc(100% - 24px)); min-height: auto; margin-top: 0; padding: 48px 0 74px; } */
}

@media (prefers-reduced-motion: reduce) {
  .archipelago-stage, .seabed-charts { transition: none; }
}

.archipelago-map:empty {
  pointer-events: none;
  min-height: 0;
  margin-top: 0;
  padding: 0;
}



.archipelago-map {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: end;
  gap: clamp(12px, 3vw, 54px);
  width: min(1180px, calc(100% - 40px));
  min-height: 470px;
  margin: -22px auto 0;
  padding: 68px 0 54px;
}

@media (max-width: 1100px) and (min-width: 761px) {
  .archipelago-map {
    gap: 20px;
  }
}

@media (max-width: 760px) {
  .archipelago-map {
    grid-template-columns: 1fr;
    align-items: initial;
    gap: 12px;
    width: min(520px, calc(100% - 24px));
    min-height: auto;
    margin-top: 0;
    padding: 48px 0 74px;
  }
}
</style>
