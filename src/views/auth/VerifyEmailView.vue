<!-- src/views/VerifyEmailView.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import authService from "@/services/auth.service";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";

type Status = "loading" | "success" | "error";

const route = useRoute();
const router = useRouter();

const status = ref<Status>("loading");
const errorMsg = ref("");

onMounted(async () => {
  const token =
    typeof route.query.token === "string" ? route.query.token : "";

  if (!token) {
    status.value = "error";
    errorMsg.value = "Falta el token de verificación.";
    return;
  }

  try {
    await authService.verifyEmail(token);
    status.value = "success";
    setTimeout(() => router.push({ name: "login" }), 2500);
  } catch (err) {
    status.value = "error";
    errorMsg.value =
      err instanceof Error
        ? err.message
        : "No pudimos verificar tu cuenta. Intenta nuevamente.";
  }
});
</script>

<template>
  <AuthShell title="Tu horizonte financiero">
    <AuthIntro
      eyebrow="Verificación"
      title="Estamos validando"
      highlight="tu llegada a la isla."
      copy="Solo tomará un momento mientras confirmamos tu cuenta para que puedas zarpar sin contratiempos."
    />

    <AuthCard kicker="Verificación de correo" heading="Confirmando tu cuenta">
      <!-- Cargando -->
      <template v-if="status === 'loading'">
        <p class="status-line" role="status">
          Verificando tu cuenta…
        </p>
      </template>

      <!-- Éxito -->
      <template v-else-if="status === 'success'">
        <p class="success-message" role="status">
          ¡Cuenta verificada! Te estamos redirigiendo al inicio de sesión…
        </p>

        <RouterLink class="submit-button" :to="{ name: 'login' }">
          <span>Ir a iniciar sesión</span>
          <span aria-hidden="true">→</span>
        </RouterLink>
      </template>

      <!-- Error -->
      <template v-else>
        <p class="error-message" role="alert">
          {{ errorMsg }}
        </p>

        <RouterLink class="submit-button" :to="{ name: 'register' }">
          <span>Volver a registrarme</span>
          <span aria-hidden="true">→</span>
        </RouterLink>

        <p class="register-copy">
          ¿Ya tienes cuenta?
          <RouterLink :to="{ name: 'login' }">Inicia sesión</RouterLink>
        </p>
      </template>
    </AuthCard>
  </AuthShell>
</template>