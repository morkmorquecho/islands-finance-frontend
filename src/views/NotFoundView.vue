<template>
  <main class="not-found">
    <section class="content" aria-labelledby="not-found-title">
      <p class="code">404</p>
      <div class="rule" aria-hidden="true"></div>
      <p class="label">Página no encontrada</p>
      <h1 id="not-found-title">Parece que saliste<br />del mapa.</h1>
      <p class="description">
        La dirección que buscas no está disponible o fue trasladada.
      </p>
      <router-link class="home-link" :to="{ name: 'home' }">
        Regresar al inicio
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem;
  color: #183f3a;
  background: #f4f8f2;
}

.content {
  width: min(100%, 34rem);
  text-align: center;
}

.code {
  margin: 0;
  color: #79a99a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(6rem, 22vw, 10rem);
  font-weight: 400;
  letter-spacing: -0.1em;
  line-height: 0.85;
}

.rule {
  width: 3rem;
  height: 2px;
  margin: 2rem auto;
  background: #d28b61;
}

.label {
  margin: 0 0 1rem;
  color: #d28b61;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #183f3a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 3.25rem);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.description {
  max-width: 25rem;
  margin: 1.25rem auto 2rem;
  color: #64817a;
  font-size: 0.98rem;
  line-height: 1.6;
}

.home-link {
  display: inline-flex;
  padding: 0.8rem 1.25rem;
  color: #f4f8f2;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  background: #183f3a;
  border: 1px solid #183f3a;
  border-radius: 999px;
  transition: background 180ms ease, color 180ms ease;
}

.home-link:hover,
.home-link:focus-visible {
  color: #183f3a;
  background: transparent;
}

.home-link:focus-visible {
  outline: 3px solid rgba(210, 139, 97, 0.45);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .home-link {
    transition: none;
  }
}
</style>