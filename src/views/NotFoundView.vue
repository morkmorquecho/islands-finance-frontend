<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Esta página no existe.</p>
    <router-link :to="{ name: 'dashboard' }">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found { text-align: center; padding: 4rem 1rem; }
</style>
