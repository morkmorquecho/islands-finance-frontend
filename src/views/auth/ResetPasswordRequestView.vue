<!-- src/views/ResetPasswordRequestView.vue -->
<script setup lang="ts">
import { ref } from "vue";
import authService from "@/services/auth.service";
import { useApiError } from "@/composable/useApiError";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthField from "@/components/auth/AuthField.vue";

const {
  errorMessage,
  fieldErrors,
  retryAfterSeconds,
  handle: handleApiError,
  reset: resetApiError,
} = useApiError();

const email = ref("");
const sent = ref(false);
const loading = ref(false);

async function handleSubmit() {
  resetApiError();
  loading.value = true;
  try {
    await authService.requestPasswordReset(email.value);
    sent.value = true;
  } catch (err) {
    handleApiError(err);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  sent.value = false;
  email.value = "";
  resetApiError();
}
</script>

<template>
  <AuthShell title="Tu horizonte financiero">
    <AuthIntro
      eyebrow="Recupera tu rumbo"
      title="Retoma el timón de"
      highlight="tu cuenta."
      copy="Ingresa tu correo y te enviaremos las instrucciones para volver a tu isla financiera."
    />

    <AuthCard
      kicker="Recuperación"
      heading="Restablecer contraseña"
      @submit="handleSubmit"
    >
      <!-- Estado: enviado -->
      <template v-if="sent">
        <p class="success-message" role="status">
          Si el correo <strong>{{ email }}</strong> está registrado, recibirás
          las instrucciones en unos minutos.
        </p>

        <button
          class="submit-button"
          type="button"
          @click="resetForm"
        >
          <span>Usar otro correo</span>
          <span aria-hidden="true">←</span>
        </button>
      </template>

      <!-- Estado: formulario -->
      <template v-else>
        <AuthField
          id="email"
          label="Correo"
          icon="✉"
          :error="fieldErrors.email?.[0]"
        >
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="tu@correo.com"
          />
        </AuthField>

        <p v-if="errorMessage" class="error-message" role="alert">
          {{ errorMessage }}
          <span v-if="retryAfterSeconds"> ({{ retryAfterSeconds }}s)</span>
        </p>

        <button class="submit-button" type="submit" :disabled="loading">
          <span>
            {{ loading ? "Enviando..." : "Enviar instrucciones" }}
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </template>

      <p class="register-copy">
        ¿Recordaste tu contraseña?
        <RouterLink :to="{ name: 'login' }">Volver al inicio de sesión</RouterLink>
      </p>
    </AuthCard>
  </AuthShell>
</template>