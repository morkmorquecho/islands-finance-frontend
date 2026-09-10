<!-- src/views/ResetPasswordConfirmView.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import authService from "@/services/auth.service";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthField from "@/components/auth/AuthField.vue";

const route = useRoute();
const router = useRouter();

const form = ref({ new_password: "", confirm_new_password: "" });
const errorMsg = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);

const uidb64 = computed(() =>
  typeof route.query.uidb64 === "string" ? route.query.uidb64 : ""
);
const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : ""
);

const linkIsValid = computed(() => uidb64.value !== "" && token.value !== "");
const passwordsMatch = computed(
  () => form.value.new_password === form.value.confirm_new_password
);

async function handleSubmit() {
  errorMsg.value = "";

  if (!passwordsMatch.value) {
    errorMsg.value = "Las contraseñas no coinciden.";
    return;
  }

  loading.value = true;
  try {
    await authService.confirmPasswordReset({
      uidb64: uidb64.value,
      token: token.value,
      ...form.value,
    });
    router.push({ name: "login" });
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : "No pudimos actualizar tu contraseña. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell title="Tu horizonte financiero">
    <AuthIntro
      eyebrow="Restablecer acceso"
      title="Define una nueva"
      highlight="clave de navegación."
      copy="Elige una contraseña segura para volver a tu isla financiera sin contratiempos."
    />

    <AuthCard
      kicker="Recuperación"
      heading="Nueva contraseña"
      @submit="handleSubmit"
    >
      <!-- Estado: link inválido o expirado -->
      <template v-if="!linkIsValid">
        <p class="error-message" role="alert">
          El enlace de recuperación no es válido o ha expirado.
        </p>

        <RouterLink
          class="submit-button"
          :to="{ name: 'reset-password' }"
        >
          <span>Solicitar un nuevo enlace</span>
          <span aria-hidden="true">→</span>
        </RouterLink>
      </template>

      <!-- Estado: formulario normal -->
      <template v-else>
        <AuthField id="new_password" label="Nueva contraseña" icon="●">
          <input
            id="new_password"
            v-model="form.new_password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres"
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
          id="confirm_new_password"
          label="Confirmar nueva contraseña"
          icon="●"
        >
          <input
            id="confirm_new_password"
            v-model="form.confirm_new_password"
            :type="showConfirm ? 'text' : 'password'"
            required
            minlength="6"
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

        <p v-if="errorMsg" class="error-message" role="alert">
          {{ errorMsg }}
        </p>

        <button class="submit-button" type="submit" :disabled="loading">
          <span>
            {{ loading ? "Guardando..." : "Guardar contraseña" }}
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