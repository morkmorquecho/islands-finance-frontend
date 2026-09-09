<script setup lang="ts">
import OceanBackground from "./components/OceanBackground.vue";
import ModuleCluster from "./components/ModuleCluster.vue";
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
</script>

<template>
  <main class="finance-scene">
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

    <footer class="scene-footer">
      <span>Actualizado hoy</span>
      <span aria-hidden="true">•</span>
      <span>3 archipiélagos · 7 islas</span>
    </footer>
  </main>
</template>


