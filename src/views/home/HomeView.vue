<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import OceanBackground from "../../components/OceanBackground.vue";
import SeabedBackground from "../../components/SeabedBackground.vue";
import ModuleCluster from "../../components/ModuleCluster.vue";
import ModuleChart from "../../components/ModuleChart.vue";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import modulesService from "@/services/modules.service";
import islandsService from "@/services/islands.service";
import type { IslandAccount } from "../../types/brand-tints";
import LoadingScreen from "@/components/LoadingScreen.vue";

type ChartEntry = {
  id: string;
  name: string;
  value: number;
  tintVar: string;
};

type FinanceModule = {
  id: string;
  moduleName: string;
  moduleType: string;
  accentColor: "coral" | "teal" | "sun";
  islands: IslandAccount[];
  totalValue: number;
  isSystem: boolean;
  chartEntries: ChartEntry[];
};

const ACCENTS = ["coral", "teal", "sun"] as const;

const moneyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const ui = useUIStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

const userInitials = computed(() => {
  const source =
    user.value?.username?.trim() ||
    user.value?.email?.trim() ||
    "";

  if (!source) return "";

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

const modules = ref<FinanceModule[]>([]);
const loadingModules = ref(true);
const modulesError = ref("");

const sceneEl = ref<HTMLElement | null>(null);
const transitionEl = ref<HTMLElement | null>(null);

let ticking = false;

function getResults(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function colorForIsland(island: any) {
  return island.color || "#94A3B8"; // hex fallback en vez de var(--tint-default)
}

function islandValue(island: any) {
  return Number(
    island.summary?.value_base ??
      island.summary?.value ??
      island.total_value ??
      island.totalValue ??
      island.current_value ??
      island.currentValue ??
      island.balance ??
      island.amount ??
      island.value ??
      0,
  );
}

function moduleValue(module: any, entries: ChartEntry[]) {
  const value = Number(
    module.total_value ??
      module.totalValue ??
      module.current_value ??
      module.currentValue ??
      module.balance ??
      module.amount ??
      module.value,
  );

  if (Number.isFinite(value)) return value;

  return entries.reduce((total, entry) => total + entry.value, 0);
}

async function loadModules() {
  loadingModules.value = true;
  modulesError.value = "";

  try {
    const modulesPayload = await modulesService.list();
    const moduleResults = getResults(modulesPayload);

    modules.value = await Promise.all(
      moduleResults.map(async (mod: any, index: number) => {
        const islandsPayload = await islandsService.list({
          module: mod.id,
        });

        const islandResults = getResults(islandsPayload);
        console.log(islandResults[0])
        const islands = islandResults.map((island: any) => ({
          id: String(island.id),
          name: island.name,
          brandTint: colorForIsland(island), // antes: tintForIsland(island)
          isSystem: Boolean(island.is_system ?? island.isSystem),
        }));

        const chartEntries: ChartEntry[] = islandResults.map(
          (island: any, islandIndex: number) => ({
            id: String(island.id ?? `${mod.id}-${islandIndex}`),
            name: island.name ?? island.title ?? `Isla ${islandIndex + 1}`,
            value: islandValue(island),
            tintVar: colorForIsland(island), // antes: tintVariableForIsland(island)
          }),
        );

        return {
          id: String(mod.id),
          moduleName: mod.name,
          moduleType: mod.type,
          accentColor: ACCENTS[index % ACCENTS.length],
          islands,
          totalValue: moduleValue(mod, chartEntries),
          isSystem: Boolean(mod.is_system ?? mod.isSystem),
          chartEntries,
        };
      }),
    );
  } catch (err: any) {
    modulesError.value =
      err.message ?? "No se pudieron cargar tus archipiélagos.";
    } finally {
      loadingModules.value = false;

      requestAnimationFrame(() => {
        updateProgress();
      });
    }
}

const chartModules = computed(() =>
  modules.value
    .filter((module) => module.totalValue > 0)
    .map((module) => ({
      moduleName: module.moduleName,
      total: module.totalValue,
      entries: module.chartEntries,
    })),
);

const clusterCountStyle = computed(() => ({
  "--cluster-count": String(modules.value.length || 1),
}));

const totalPatrimonio = computed(() =>
  modules.value.reduce(
    (sum, module) => sum + Number(module.totalValue || 0),
    0,
  ),
);

function formatMoney(value: number) {
  return moneyFormatter.format(value);
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
  ui.showIslandInfo(islandId, {
    onSuccess: loadModules,
  });
}

function updateProgress() {
  ticking = false;

  const scene = sceneEl.value;
  const transition = transitionEl.value;

  if (!scene || !transition) return;

  const viewportHeight = window.innerHeight;
  const rect = transition.getBoundingClientRect();

  const transitionStart = viewportHeight * 0.9;
  const transitionEnd = viewportHeight * 0.08;
  const progress = Math.min(
    1,
    Math.max(
      0,
      (transitionStart - rect.top) /
        (transitionStart - transitionEnd),
    ),
  );

  scene.style.setProperty(
    "--charts-progress",
    progress.toFixed(4),
  );
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

async function deleteModule(moduleId: string) {
  ui.showModal(
    "¿Seguro que quieres eliminar este archipiélago?",
    "Eliminar archipiélago",
    "",
    {
      showActionButton: true,
      buttonText: "Eliminar",
      showCancelButton: true,
      onConfirm: async () => {
        try {
          await modulesService.destroy(moduleId);
          await loadModules();
        } catch (err: any) {
          modulesError.value =
            err.message ?? "No se pudo eliminar el archipiélago.";
        } finally {
          ui.closeModal();
        }
      },
    },
  );
}
</script>

<template>
  <main ref="sceneEl" class="finance-scene">
    <LoadingScreen :visible="loadingModules" />
    <div
      class="ocean-stage"
      :class="{
        'ocean-stage--single-row':
          modules.length > 0 && modules.length <= 3,
      }"
    >
      <OceanBackground />

      <header class="finance-header">
        <RouterLink
          class="finance-brand"
          to="/"
          aria-label="Island Finance, inicio"
        >
          <span class="card-icon">
            <img
              src="@/assets/logo.png"
              alt=""
              aria-hidden="true"
            />
          </span>

          Island Finance
        </RouterLink>

        <div class="header-actions">
          <button
            class="new-module-button"
            type="button"
            @click="openModuleForm()"
          >
            + Archipiélago
          </button>

          <RouterLink
            class="profile-button"
            :to="{ name: 'settings' }"
            aria-label="Abrir ajustes de perfil"
          >
            {{ userInitials || "•" }}
          </RouterLink>
        </div>
      </header>

      <section
        id="patrimonio"
        class="finance-summary"
        aria-labelledby="page-title"
      >
        <p>Tu patrimonio total</p>

        <h1 id="page-title">
          {{ formatMoney(totalPatrimonio) }}
        </h1>

        <p class="finance-summary-note">
          Todo lo que has construido, en un solo horizonte.
        </p>
      </section>

      <div class="archipelago-stage">
        <p v-if="modulesError" class="modules-error">
          {{ modulesError }}
        </p>

        <p
          v-if="!loadingModules && !modules.length"
          class="modules-empty"
        >
          Todavía no tienes archipiélagos (Propósitos financieros).

          <button
            type="button"
            class="link-button"
            @click="openModuleForm"
          >
            Crea el primero
          </button>
        </p>

        <div
          v-if="modules.length"
          class="archipelago-map"
          :style="clusterCountStyle"
        >
          <ModuleCluster
            v-for="(module, index) in modules"
            :key="module.id"
            :module-name="module.moduleName"
            :accent-color="module.accentColor"
            :islands="module.islands"
            :cluster-index="index"
            :is-system="module.isSystem"
            @add-island="openIslandForm(module.id)"
            @select-island="openIslandInfo"
            @edit-module="
              openModuleForm({
                id: module.id,
                name: module.moduleName,
                type: module.moduleType,
              })
            "
          />
        </div>
      </div>
    </div>

    <div class="seabed-stage">
      <SeabedBackground />

      <div
        ref="transitionEl"
        class="depth-transition"
        aria-hidden="true"
      />

      <section
        class="seabed-charts"
        aria-labelledby="deep-title"
      >
        <h2 id="deep-title" class="seabed-title">
          Bajo la superficie
        </h2>

        <div class="seabed-charts-grid">
          <ModuleChart
            v-for="module in chartModules"
            :key="module.moduleName"
            :module-name="module.moduleName"
            :total="module.total"
            :entries="module.entries"
          />
        </div>
      </section>
    </div>

    <footer class="scene-footer">
      <span>Actualizado hoy</span>
      <span aria-hidden="true">•</span>
      <span>
        {{ modules.length }} archipiélagos ·
        {{
          modules.reduce(
            (total, module) => total + module.islands.length,
            0,
          )
        }}
        islas
      </span>
    </footer>
  </main>
</template>

<style scoped>
.finance-scene {
  --charts-progress: 0;
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  color: var(--foreground);
  background: var(--sky-top);
}

.ocean-stage {
  position: relative;
  isolation: isolate;
}

.ocean-stage--single-row {
  --ocean-horizon-shift: 2%;
}

.ocean-stage::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  z-index: 0;
  height: clamp(160px, 22vh, 260px);
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in oklab, var(--ocean-deep) 82%, black) 100%
  );
}

.finance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding-top: 24px;
}

.finance-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--foreground);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-module-button,
.profile-button {
  border: 1px solid
    color-mix(in oklab, var(--foreground) 25%, transparent);
  color: var(--foreground);
  background: color-mix(in oklab, var(--label) 55%, transparent);
  cursor: pointer;
}

.new-module-button {
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font: 700 12px var(--font-sans);
}

.profile-button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font: 600 12px var(--font-sans);
  text-decoration: none;
}

.finance-summary {
  position: relative;
  z-index: 2;
  width: min(720px, calc(100% - 32px));
  margin: 34px auto 0;
  text-align: center;
}

.finance-summary > p:first-child {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.finance-summary h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 6vw, 80px);
  line-height: 0.98;
  font-variant-numeric: tabular-nums;
}

.finance-summary-note {
  margin: 12px 0 0;
  font-size: 14px;
  opacity: 0.72;
}

.archipelago-stage {
  position: relative;
  z-index: 1;
  padding-bottom: 14rem;
}

.archipelago-map {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: clamp(12px, 3vw, 54px);
  width: min(1180px, calc(100% - 40px));
  min-height: 470px;
  margin: -22px auto 0;
  padding: 68px 0 54px;
  transform: translate3d(0, 7rem, 0);
}

.seabed-stage {
  position: relative;
  isolation: isolate;
  background: linear-gradient(
    to bottom,
    color-mix(in oklab, var(--ocean-deep) 82%, black) 0%,
    color-mix(in oklab, var(--ocean-deep) 68%, black) 35%,
    color-mix(in oklab, var(--ocean-deep) 55%, black) 62%,
    oklch(0.14 0.04 194) 100%
  );
}

.depth-transition {
  position: relative;
  z-index: 1;
  height: clamp(520px, 72vh, 860px);
  pointer-events: none;
}

.seabed-charts {
  position: relative;
  z-index: 2;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding-bottom: 90px;
  opacity: calc(0.62 + var(--charts-progress) * 0.38);
  transform: translate3d(
    0,
    calc(170px - var(--charts-progress) * 260px),
    0
  );
  transition:
    transform 100ms linear,
    opacity 100ms linear;
  will-change: transform, opacity;
}

.seabed-title {
  margin: 0 0 20px;
  color: var(--shore);
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 30px);
  text-align: center;
}

.seabed-charts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 20px;
  width: 100%;
}

.scene-footer {
  position: absolute;
  right: 24px;
  bottom: 18px;
  left: 24px;
  display: flex;
  justify-content: center;
  gap: 9px;
  font-size: 11px;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .finance-header {
    width: calc(100% - 32px);
    padding-top: 18px;
  }

  .finance-summary {
    margin-top: 26px;
  }

  .finance-summary h1 {
    font-size: clamp(42px, 14vw, 62px);
  }

  .finance-summary-note {
    max-width: 290px;
    margin-inline: auto;
  }

  .archipelago-map {
    grid-template-columns: 1fr;
    align-items: initial;
    gap: 12px;
    width: min(520px, calc(100% - 24px));
    min-height: auto;
    margin-top: 0;
    padding: 48px 0 74px;
  }

  .seabed-charts {
    width: min(520px, calc(100% - 24px));
  }

  .seabed-charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .seabed-charts {
    transform: none;
    transition: opacity 100ms linear;
  }
}
</style>