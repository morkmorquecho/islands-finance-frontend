<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import authService from "@/services/auth.service";
import { useApiError } from "@/composable/useApiError";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthField from "@/components/auth/AuthField.vue";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { errorMessage, fieldErrors, retryAfterSeconds, handle: handleApiError, reset: resetApiError } = useApiError();

const form = ref({ username: "", password: "" });
const loading = ref(false);
const showPassword = ref(false);
const localError = ref("");

function redirectAfterLogin() {
  router.push(
    typeof route.query.redirect === "string"
      ? route.query.redirect
      : { name: "home" }
  );
}

async function handleSubmit() {
  resetApiError();
  localError.value = "";
  loading.value = true;
  try {
    await auth.login(form.value);
    redirectAfterLogin();
  } catch (err) {
    handleApiError(err);
  } finally {
    loading.value = false;
  }
}

// ── Google ────────────────────────────────────────────────────────────────────
async function handleGoogleSuccess(credential: string) {
  resetApiError();
  localError.value = "";
  loading.value = true;
  try {
    // El interceptor de api.js ya devuelve response.data.data = { access, refresh, user }.
    // Tipado como any porque TS infiere AxiosResponse desde el JS del servicio.
    const data: any = await authService.loginWithGoogle(credential);
    auth.setSession(data);
    redirectAfterLogin();
  } catch (err) {
    handleApiError(err);
  } finally {
    loading.value = false;
  }
}

function handleGoogleError(msg: string) {
  localError.value = msg;
}
</script>

<template>
  <AuthShell title="Tu horizonte financiero">
    <AuthIntro
      eyebrow="Bienvenido de vuelta"
      title="Navega hacia un"
      highlight="mejor futuro financiero."
      copy="Retoma el control de tus finanzas y descubre todo lo que has construido, isla por isla."
    />

    <AuthCard kicker="Acceso privado" heading="Iniciar sesión" @submit="handleSubmit">
      <AuthField id="username" label="Usuario o correo" icon="@" :error="fieldErrors.username?.[0]">
        <input id="username" v-model="form.username" type="text" required autocomplete="username" placeholder="tu@correo.com" />
      </AuthField>

      <AuthField id="password" label="Contraseña" icon="●" :error="fieldErrors.password?.[0]">
        <template #action>
          <RouterLink class="forgot-link" :to="{ name: 'reset-password' }">¿La olvidaste?</RouterLink>
        </template>
        <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password" placeholder="Tu contraseña" />
        <button class="password-toggle" type="button" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
          {{ showPassword ? "Ocultar" : "Mostrar" }}
        </button>
      </AuthField>

      <p v-if="localError || errorMessage" class="error-message" role="alert">
        {{ localError || errorMessage }}
        <span v-if="retryAfterSeconds"> ({{ retryAfterSeconds }}s)</span>
      </p>

      <button class="submit-button" type="submit" :disabled="loading">
        <span>{{ loading ? "Abriendo tu isla..." : "Ingresar a mi cuenta" }}</span>
        <span aria-hidden="true">→</span>
      </button>

      <div class="google-divider" role="separator">
        <span>o continúa con</span>
      </div>

      <GoogleAuthButton
        text="signin_with"
        @success="handleGoogleSuccess"
        @error="handleGoogleError"
      />

      <p class="register-copy">
        ¿Aún no tienes una cuenta?
        <RouterLink :to="{ name: 'register' }">Crea tu isla financiera</RouterLink>
      </p>
    </AuthCard>
  </AuthShell>
</template>

<style scoped>
.google-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.google-divider::before,
.google-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.25;
}
</style>