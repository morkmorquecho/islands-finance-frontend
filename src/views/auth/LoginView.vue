<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import OceanBackground from "@/components/OceanBackground.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = ref({
  username: "",
  password: "",
});

const errorMsg = ref("");
const loading = ref(false);
const showPassword = ref(false);

async function handleSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    await auth.login(form.value);

    router.push(
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : { name: "dashboard" },
    );
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : "No pudimos iniciar tu sesión. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <OceanBackground />

    <header class="auth-header">
      <RouterLink
        class="brand"
        to="/"
        aria-label="Island Finance, página de inicio"
      >
        <span class="brand-mark" aria-hidden="true">◒</span>
        <span>Island Finance</span>
      </RouterLink>

      <span class="header-caption">Tu horizonte financiero</span>
    </header>

    <section class="login-layout" aria-labelledby="login-title">
      <div class="login-intro">
        <p class="eyebrow">Bienvenido de vuelta</p>

        <h1 id="login-title">
          Navega hacia un
          <em>mejor futuro financiero.</em>
        </h1>

        <p class="intro-copy">
          Retoma el control de tus finanzas y descubre todo lo que has
          construido, isla por isla.
        </p>

        <div class="horizon-line" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <form class="auth-card" @submit.prevent="handleSubmit">
        <div class="card-heading">
          <span class="card-icon" aria-hidden="true">↗</span>

          <div>
            <p class="card-kicker">Acceso privado</p>
            <h2>Iniciar sesión</h2>
          </div>
        </div>

        <div class="field">
          <label for="username">Usuario o correo</label>

          <div class="input-shell">
            <span class="input-icon" aria-hidden="true">@</span>

            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        <div class="field">
          <div class="field-label-row">
            <label for="password">Contraseña</label>

            <RouterLink
              class="forgot-link"
              :to="{ name: 'reset-password' }"
            >
              ¿La olvidaste?
            </RouterLink>
          </div>

          <div class="input-shell">
            <span class="input-icon" aria-hidden="true">●</span>

            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="Tu contraseña"
            />

            <button
              class="password-toggle"
              type="button"
              :aria-label="
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Ocultar" : "Mostrar" }}
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="error-message" role="alert">
          {{ errorMsg }}
        </p>

        <button class="submit-button" type="submit" :disabled="loading">
          <span>
            {{ loading ? "Abriendo tu isla..." : "Ingresar a mi cuenta" }}
          </span>
          <span aria-hidden="true">→</span>
        </button>

        <p class="register-copy">
          ¿Aún no tienes una cuenta?
          <RouterLink :to="{ name: 'register' }">
            Crea tu isla financiera
          </RouterLink>
        </p>
      </form>
    </section>

    <footer class="auth-footer">
      <span>Island Finance</span>
      <span aria-hidden="true">•</span>
      <span>Tu patrimonio, en un solo horizonte</span>
    </footer>
  </main>
</template>

<style scoped>
.auth-page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  overflow: hidden;
  padding: 24px clamp(20px, 5vw, 72px);
  color: var(--foreground);
  background: var(--sky-top);
}

.auth-header,
.login-layout,
.auth-footer {
  position: relative;
  z-index: 2;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--foreground);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid color-mix(in oklab, var(--foreground) 30%, transparent);
  border-radius: 50%;
  color: var(--ocean-deep);
  background: color-mix(in oklab, var(--shore) 35%, transparent);
}

.header-caption {
  color: var(--label-ink);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 420px);
  align-items: center;
  gap: clamp(48px, 9vw, 140px);
  width: min(1000px, 100%);
  margin: auto;
  padding: 72px 0;
}

.login-intro {
  max-width: 470px;
}

.eyebrow,
.card-kicker {
  margin: 0 0 12px;
  color: var(--tag-coral);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.login-intro h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(42px, 5.5vw, 72px);
  line-height: 0.98;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.login-intro h1 em {
  display: block;
  color: var(--ocean-deep);
  font-style: normal;
}

.intro-copy {
  max-width: 390px;
  margin: 24px 0 0;
  color: var(--label-ink);
  font-size: 15px;
  line-height: 1.6;
}

.horizon-line {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 34px;
}

.horizon-line span {
  display: block;
  height: 3px;
  border-radius: 10px;
  background: var(--tag-coral);
}

.horizon-line span:nth-child(1) {
  width: 52px;
}

.horizon-line span:nth-child(2) {
  width: 22px;
  opacity: 0.55;
}

.horizon-line span:nth-child(3) {
  width: 8px;
  opacity: 0.3;
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: clamp(26px, 4vw, 38px);
  border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent);
  border-radius: 24px;
  background: color-mix(in oklab, var(--label) 68%, transparent);
  box-shadow: 0 24px 70px color-mix(in oklab, var(--ocean-deep) 18%, transparent);
  backdrop-filter: blur(18px);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 4px;
}

.card-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: var(--label);
  background: var(--ocean-deep);
  font-size: 21px;
}

.card-kicker {
  margin-bottom: 3px;
  color: var(--ocean-deep);
  font-size: 10px;
}

.card-heading h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 29px;
  line-height: 1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label,
.field-label-row {
  color: var(--foreground);
  font-size: 13px;
  font-weight: 650;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 13px;
  border: 1px solid color-mix(in oklab, var(--foreground) 20%, transparent);
  border-radius: 12px;
  background: color-mix(in oklab, var(--label) 40%, transparent);
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.input-shell:focus-within {
  border-color: var(--ocean-deep);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ocean-deep) 18%, transparent);
}

.input-icon {
  color: var(--ocean-deep);
  font-size: 13px;
  font-weight: 700;
}

input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  color: var(--foreground);
  background: transparent;
  font: inherit;
}

input::placeholder {
  color: color-mix(in oklab, var(--foreground) 45%, transparent);
}

.password-toggle,
.forgot-link,
.register-copy a {
  border: 0;
  color: var(--ocean-deep);
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.password-toggle:hover,
.forgot-link:hover,
.register-copy a:hover {
  text-decoration: underline;
}

.error-message {
  margin: -4px 0 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in oklab, var(--tag-coral) 45%, transparent);
  border-radius: 10px;
  color: var(--tag-coral);
  background: color-mix(in oklab, var(--tag-coral) 10%, transparent);
  font-size: 12px;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  padding: 0 17px 0 20px;
  border: 0;
  border-radius: 12px;
  color: var(--label);
  background: var(--ocean-deep);
  font: 700 14px var(--font-sans);
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: color-mix(in oklab, var(--ocean-deep) 82%, var(--ocean-near));
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-button:focus-visible,
.brand:focus-visible,
.password-toggle:focus-visible,
.forgot-link:focus-visible,
.register-copy a:focus-visible {
  outline: 3px solid var(--tag-coral);
  outline-offset: 4px;
}

.register-copy {
  margin: 0;
  color: var(--label-ink);
  font-size: 12px;
  text-align: center;
}

.auth-footer {
  display: flex;
  justify-content: center;
  gap: 9px;
  color: var(--label-ink);
  font-size: 11px;
  opacity: 0.72;
}

@media (max-width: 760px) {
  .auth-page {
    padding: 18px 16px;
  }

  .header-caption {
    display: none;
  }

  .login-layout {
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 58px 0 44px;
  }

  .login-intro {
    text-align: center;
  }

  .login-intro h1 {
    font-size: clamp(42px, 13vw, 60px);
  }

  .intro-copy {
    margin-inline: auto;
  }

  .horizon-line {
    justify-content: center;
    margin-top: 24px;
  }

  .auth-card {
    width: min(100%, 430px);
    margin: 0 auto;
  }

  .auth-footer {
    flex-wrap: wrap;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .submit-button {
    transition: none;
  }
}
</style>