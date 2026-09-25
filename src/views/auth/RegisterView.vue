<!-- src/views/RegisterView.vue -->
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/auth.service";
import { useApiError } from "@/composable/useApiError";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthField from "@/components/auth/AuthField.vue";

const router = useRouter();
const {
  errorMessage,
  fieldErrors,
  retryAfterSeconds,
  handle: handleApiError,
  reset: resetApiError,
} = useApiError();

const form = ref({
  username: "",
  email: "",
  password: "",
  confirm_password: "",
});

const localError = ref("");
const successMsg = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);
let redirectTimer: ReturnType<typeof setTimeout> | null = null;

const passwordsMatch = computed(
  () => form.value.password === form.value.confirm_password
);

async function handleSubmit() {
  resetApiError();
  localError.value = "";
  successMsg.value = "";

  if (!passwordsMatch.value) {
    localError.value = "Las contraseñas no coinciden.";
    return;
  }

  loading.value = true;
  const startTime = Date.now();
  const MIN_DELAY = 10000; 

  try {
    await authService.register(form.value);
    successMsg.value = "Cuenta creada. Revisa tu correo para verificarla, recuerda revisar spam";

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DELAY - elapsed);

    redirectTimer = setTimeout(() => {
      router.push({ name: "login" });
    }, remaining);
  } catch (err) {
    handleApiError(err);
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(() => {
  if (redirectTimer) clearTimeout(redirectTimer);
});
</script>

<template>
  <AuthShell title="Tu horizonte financiero">
    <AuthIntro
      eyebrow="Empieza tu travesía"
      title="Construye tu"
      highlight="isla financiera."
      copy="Crea tu cuenta y empieza a mapear cada ingreso, meta y logro en un solo horizonte."
    />

    <AuthCard
      kicker="Nuevo navegante"
      heading="Crear cuenta"
      @submit="handleSubmit"
    >
      <AuthField
        id="username"
        label="Usuario"
        icon="@"
        :error="fieldErrors.username?.[0]"
      >
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          autocomplete="username"
          placeholder="Tu nombre de usuario"
        />
      </AuthField>

      <AuthField
        id="email"
        label="Correo"
        icon="✉"
        :error="fieldErrors.email?.[0]"
      >
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          placeholder="tu@correo.com"
        />
      </AuthField>

      <AuthField
        id="password"
        label="Contraseña"
        icon="●"
        :error="fieldErrors.password?.[0]"
      >
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          required
          autocomplete="new-password"
          placeholder="Crea una contraseña"
        />
        <button
          class="password-toggle"
          type="button"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? "Ocultar" : "Mostrar" }}
        </button>
      </AuthField>

      <AuthField
        id="confirm_password"
        label="Confirmar contraseña"
        icon="●"
        :error="fieldErrors.confirm_password?.[0]"
      >
        <input
          id="confirm_password"
          v-model="form.confirm_password"
          :type="showConfirm ? 'text' : 'password'"
          required
          autocomplete="new-password"
          placeholder="Repite tu contraseña"
        />
        <button
          class="password-toggle"
          type="button"
          :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showConfirm"
          @click="showConfirm = !showConfirm"
        >
          {{ showConfirm ? "Ocultar" : "Mostrar" }}
        </button>
      </AuthField>

      <p v-if="localError || errorMessage" class="error-message" role="alert">
        {{ localError || errorMessage }}
        <span v-if="retryAfterSeconds"> ({{ retryAfterSeconds }}s)</span>
      </p>
      <p v-if="successMsg" class="success-message" role="status">
        {{ successMsg }}
      </p>

      <button class="submit-button" type="submit" :disabled="loading">
        <span>
          {{ loading ? "Creando tu isla..." : "Registrarme" }}
        </span>
        <span aria-hidden="true">→</span>
      </button>

      <p class="register-copy">
        ¿Ya tienes una cuenta?
        <RouterLink :to="{ name: 'login' }">Inicia sesión</RouterLink>
      </p>
    </AuthCard>
  </AuthShell>
</template>