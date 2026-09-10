<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthShell from "@/components/auth/AuthShell.vue";
import AuthIntro from "@/components/auth/AuthIntro.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthField from "@/components/auth/AuthField.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = ref({ username: "", password: "" });
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
        : { name: "dashboard" }
    );
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message
        : "No pudimos iniciar tu sesión. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
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

    <AuthCard
      kicker="Acceso privado"
      heading="Iniciar sesión"
      @submit="handleSubmit"
    >
      <AuthField id="username" label="Usuario o correo" icon="@">
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          autocomplete="username"
          placeholder="tu@correo.com"
        />
      </AuthField>

      <AuthField id="password" label="Contraseña" icon="●">
        <template #action>
          <RouterLink class="forgot-link" :to="{ name: 'reset-password' }">
            ¿La olvidaste?
          </RouterLink>
        </template>
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
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? "Ocultar" : "Mostrar" }}
        </button>
      </AuthField>

      <p v-if="errorMsg" class="error-message" role="alert">{{ errorMsg }}</p>

      <button class="submit-button" type="submit" :disabled="loading">
        <span>{{ loading ? "Abriendo tu isla..." : "Ingresar a mi cuenta" }}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p class="register-copy">
        ¿Aún no tienes una cuenta?
        <RouterLink :to="{ name: 'register' }">Crea tu isla financiera</RouterLink>
      </p>
    </AuthCard>
  </AuthShell>
</template>