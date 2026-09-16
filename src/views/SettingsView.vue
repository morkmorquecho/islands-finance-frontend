<!-- src/views/SettingsView.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import authService from "@/services/auth.service";
import usersService from "@/services/users.service";
import AuthField from "@/components/auth/AuthField.vue";

const router = useRouter();
const auth = useAuthStore();

/* ---------- Cambio de contraseña ---------- */
const pwForm = ref({
  current_password: "",
  new_password: "",
  confirm_new_password: "",
});
const pwError = ref("");
const pwSuccess = ref("");
const pwLoading = ref(false);
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const showConfirmPw = ref(false);

const newPasswordsMatch = computed(
  () => pwForm.value.new_password === pwForm.value.confirm_new_password
);

async function changePassword() {
  pwError.value = "";
  pwSuccess.value = "";

  if (!newPasswordsMatch.value) {
    pwError.value = "Las contraseñas nuevas no coinciden.";
    return;
  }

  pwLoading.value = true;
  try {
    await authService.changePassword(pwForm.value);
    pwSuccess.value = "Contraseña actualizada.";
    pwForm.value = {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    };
  } catch (err) {
    pwError.value =
      err instanceof Error
        ? err.message
        : "No pudimos actualizar tu contraseña. Intenta nuevamente.";
  } finally {
    pwLoading.value = false;
  }
}

/* ---------- Cambio de correo ---------- */
const emailForm = ref({ email: "", password: "" });
const emailError = ref("");
const emailSuccess = ref("");
const emailLoading = ref(false);
const showEmailPw = ref(false);

async function requestEmailChange() {
  emailError.value = "";
  emailSuccess.value = "";

  emailLoading.value = true;
  try {
    await usersService.requestEmailChange(emailForm.value);
    emailSuccess.value =
      "Revisa tu nuevo correo para confirmar el cambio.";
    emailForm.value = { email: "", password: "" };
  } catch (err) {
    emailError.value =
      err instanceof Error
        ? err.message
        : "No pudimos solicitar el cambio. Intenta nuevamente.";
  } finally {
    emailLoading.value = false;
  }
}

/* ---------- Logout ---------- */
async function handleLogout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <main class="settings-page">
    <header class="settings-header">
      <RouterLink class="back-link" :to="{ name: 'home' }">
        ← Volver al inicio
      </RouterLink>
      <h1>Ajustes</h1>
      <p class="settings-subtitle">
        Gestiona la seguridad de tu cuenta y tus datos de acceso.
      </p>
    </header>

    <RouterLink class="settings-card analytics-link" :to="{ name: 'expenses' }">
      <div class="card-heading">
        <div>
          <p class="card-kicker">Tu actividad</p>
          <h2>Gastos y estadísticas</h2>
          <p class="settings-note">Explora tus gastos por categoría, periodo e isla.</p>
        </div>
        <span aria-hidden="true">→</span>
      </div>
    </RouterLink>

    <RouterLink class="settings-card analytics-link" :to="{ name: 'goals' }">
      <div class="card-heading">
        <div>
          <p class="card-kicker">Tus metas</p>
          <h2>Objetivos de ahorro</h2>
          <p class="settings-note">Crea, edita y da seguimiento a tus objetivos recurrentes.</p>
        </div>
        <span aria-hidden="true">→</span>
      </div>
    </RouterLink>

    <!-- Cambiar contraseña -->
    <section class="settings-card" aria-labelledby="pw-title">
      <div class="card-heading">
        <div>
          <p class="card-kicker">Seguridad</p>
          <h2 id="pw-title">Cambiar contraseña</h2>
        </div>
      </div>

      <form class="settings-form" @submit.prevent="changePassword">
        <AuthField
          id="current_password"
          label="Contraseña actual"
          icon="●"
        >
          <input
            id="current_password"
            v-model="pwForm.current_password"
            :type="showCurrentPw ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="Tu contraseña actual"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showCurrentPw ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showCurrentPw"
            @click="showCurrentPw = !showCurrentPw"
          >
            {{ showCurrentPw ? "Ocultar" : "Mostrar" }}
          </button>
        </AuthField>

        <AuthField id="new_password" label="Nueva contraseña" icon="●">
          <input
            id="new_password"
            v-model="pwForm.new_password"
            :type="showNewPw ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showNewPw ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showNewPw"
            @click="showNewPw = !showNewPw"
          >
            {{ showNewPw ? "Ocultar" : "Mostrar" }}
          </button>
        </AuthField>

        <AuthField
          id="confirm_new_password"
          label="Confirmar nueva contraseña"
          icon="●"
        >
          <input
            id="confirm_new_password"
            v-model="pwForm.confirm_new_password"
            :type="showConfirmPw ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="Repite tu contraseña"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showConfirmPw ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showConfirmPw"
            @click="showConfirmPw = !showConfirmPw"
          >
            {{ showConfirmPw ? "Ocultar" : "Mostrar" }}
          </button>
        </AuthField>

        <p v-if="pwError" class="error-message" role="alert">
          {{ pwError }}
        </p>
        <p v-if="pwSuccess" class="success-message" role="status">
          {{ pwSuccess }}
        </p>

        <button class="submit-button" type="submit" :disabled="pwLoading">
          <span>{{ pwLoading ? "Guardando..." : "Actualizar contraseña" }}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>

    <!-- Cambiar correo -->
    <section class="settings-card" aria-labelledby="email-title">
      <div class="card-heading">
        <div>
          <p class="card-kicker">Cuenta</p>
          <h2 id="email-title">Cambiar correo</h2>
        </div>
      </div>

      <form class="settings-form" @submit.prevent="requestEmailChange">
        <AuthField id="email" label="Nuevo correo" icon="✉">
          <input
            id="email"
            v-model="emailForm.email"
            type="email"
            required
            autocomplete="email"
            placeholder="nuevo@correo.com"
          />
        </AuthField>

        <AuthField
          id="email_password"
          label="Contraseña actual"
          icon="●"
        >
          <input
            id="email_password"
            v-model="emailForm.password"
            :type="showEmailPw ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="Confirma con tu contraseña"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showEmailPw ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showEmailPw"
            @click="showEmailPw = !showEmailPw"
          >
            {{ showEmailPw ? "Ocultar" : "Mostrar" }}
          </button>
        </AuthField>

        <p v-if="emailError" class="error-message" role="alert">
          {{ emailError }}
        </p>
        <p v-if="emailSuccess" class="success-message" role="status">
          {{ emailSuccess }}
        </p>

        <button class="submit-button" type="submit" :disabled="emailLoading">
          <span>{{ emailLoading ? "Enviando..." : "Solicitar cambio de correo" }}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>

    <!-- Zona peligrosa -->
    <section class="settings-card danger" aria-labelledby="danger-title">
      <div class="card-heading">
        <div>
          <p class="card-kicker">Sesión</p>
          <h2 id="danger-title">Cerrar sesión</h2>
        </div>
      </div>

      <p class="settings-note">
        Se cerrará tu sesión en este dispositivo y volverás al inicio de sesión.
      </p>

      <button
        class="submit-button danger-button"
        type="button"
        @click="handleLogout"
      >
        <span>Cerrar sesión</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.settings-page {
  width: min(640px, 100%);
  margin: 0 auto;
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--foreground);
}

.settings-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.back-link {
  color: var(--label-ink);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  width: fit-content;
}

.back-link:hover {
  color: var(--ocean-deep);
  text-decoration: underline;
}

.settings-header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1;
  letter-spacing: -0.03em;
}

.settings-subtitle {
  margin: 0;
  color: var(--label-ink);
  font-size: 14px;
  line-height: 1.5;
}

.settings-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(20px, 3vw, 28px);
  border: 1px solid color-mix(in oklab, var(--foreground) 16%, transparent);
  border-radius: 20px;
  background: color-mix(in oklab, var(--label) 68%, transparent);
  backdrop-filter: blur(18px);
}

.settings-card .card-heading {
  padding-bottom: 0;
}

.settings-card h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.1;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-note {
  margin: 0;
  color: var(--label-ink);
  font-size: 13px;
  line-height: 1.5;
}

.danger {
  border-color: color-mix(in oklab, var(--tag-coral) 45%, transparent);
  background: color-mix(in oklab, var(--tag-coral) 8%, transparent);
}

.danger-button {
  background: var(--tag-coral);
}

.danger-button:hover:not(:disabled) {
  background: color-mix(in oklab, var(--tag-coral) 82%, var(--ocean-near));
}
.analytics-link { color: inherit; text-decoration: none; transition: transform 160ms ease, border-color 160ms ease; }
.analytics-link:hover { transform: translateY(-2px); border-color: color-mix(in oklab, var(--tag-teal) 52%, transparent); }
.analytics-link .card-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.analytics-link .card-heading > span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: var(--label); background: var(--ocean-deep); font-weight: 700; }
</style>
