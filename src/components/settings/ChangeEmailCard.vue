<script setup lang="ts">
import { ref } from "vue";
import usersService from "@/services/users.service";
import AuthField from "@/components/auth/AuthField.vue";

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
    emailSuccess.value = "Revisa tu nuevo correo para confirmar el cambio.";
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
</script>

<template>
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

      <AuthField id="email_password" label="Contraseña actual" icon="●">
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

      <p v-if="emailError" class="error-message" role="alert">{{ emailError }}</p>
      <p v-if="emailSuccess" class="success-message" role="status">{{ emailSuccess }}</p>

      <button class="submit-button" type="submit" :disabled="emailLoading">
        <span>{{ emailLoading ? "Enviando..." : "Solicitar cambio de correo" }}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  </section>
</template>

<style scoped>
/* mismos estilos base que ChangePasswordCard */
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