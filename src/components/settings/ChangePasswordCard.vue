<script setup lang="ts">
import { ref, computed } from "vue";
import authService from "@/services/auth.service";
import { useApiError } from "@/composable/useApiError";
import AuthField from "@/components/auth/AuthField.vue";

const {
  errorMessage,
  fieldErrors,
  retryAfterSeconds,
  handle: handleApiError,
  reset: resetApiError,
} = useApiError();

const pwForm = ref({
  current_password: "",
  new_password: "",
  confirm_new_password: "",
});
const localError = ref("");
const pwSuccess = ref("");
const pwLoading = ref(false);
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const showConfirmPw = ref(false);

const newPasswordsMatch = computed(
  () => pwForm.value.new_password === pwForm.value.confirm_new_password
);

async function changePassword() {
  resetApiError();
  localError.value = "";
  pwSuccess.value = "";

  if (!newPasswordsMatch.value) {
    localError.value = "Las contraseñas nuevas no coinciden.";
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
    handleApiError(err);
  } finally {
    pwLoading.value = false;
  }
}
</script>

<template>
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
        :error="fieldErrors.current_password?.[0]"
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

      <AuthField
        id="new_password"
        label="Nueva contraseña"
        icon="●"
        :error="fieldErrors.new_password?.[0]"
      >
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
        :error="fieldErrors.confirm_new_password?.[0]"
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

      <p v-if="localError || errorMessage" class="error-message" role="alert">
        {{ localError || errorMessage }}
        <span v-if="retryAfterSeconds"> ({{ retryAfterSeconds }}s)</span>
      </p>
      <p v-if="pwSuccess" class="success-message" role="status">{{ pwSuccess }}</p>

      <button class="submit-button" type="submit" :disabled="pwLoading">
        <span>{{ pwLoading ? "Guardando..." : "Actualizar contraseña" }}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  </section>
</template>

<style scoped>
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
.settings-card .card-heading { padding-bottom: 0; }
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
</style>