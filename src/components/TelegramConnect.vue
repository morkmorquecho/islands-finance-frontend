<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import QRCode from 'qrcode'
import { telegramService } from '@/services/telegramService'

// Cada cuánto preguntamos si ya se vinculó. Si tu límite de peticiones es
// muy bajo y ves el aviso de "demasiados intentos", súbelo.
const POLL_INTERVAL_MS = 5000

// loading | unlinked | waiting | expired | linked
const status = ref('loading')
const linkInfo = ref(null)
const deepLink = ref('')
const qrDataUrl = ref('')
const expiresAt = ref(0)
const secondsLeft = ref(0)
const busy = ref(false)
const errorMessage = ref('')

let pollTimer = null
let countdownTimer = null

const countdownText = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = String(secondsLeft.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

function stopWaiting() {
  clearInterval(pollTimer)
  clearInterval(countdownTimer)
  pollTimer = null
  countdownTimer = null
}

// Consulta al backend si la cuenta ya está vinculada.
async function loadStatus() {
  try {
    const data = await telegramService.getLink()
    if (data?.linked) {
      stopWaiting()
      linkInfo.value = data
      status.value = 'linked'
    } else if (status.value === 'loading') {
      status.value = 'unlinked'
    }
  } catch (error) {
    // Durante la espera ignoramos fallos puntuales; el siguiente intento lo reintenta.
    if (status.value === 'loading') {
      status.value = 'unlinked'
      errorMessage.value = error.message || 'No se pudo consultar el estado de Telegram.'
    }
  }
}

function tick() {
  secondsLeft.value = Math.max(0, Math.ceil((expiresAt.value - Date.now()) / 1000))
  if (secondsLeft.value === 0) {
    stopWaiting()
    status.value = 'expired'
  }
}

function poll() {
  // No gastamos peticiones si la pestaña está en segundo plano.
  if (document.hidden) return
  loadStatus()
}

// Al volver a la pestaña (por ejemplo desde la app de Telegram) revisamos al instante.
function onVisibilityChange() {
  if (!document.hidden && status.value === 'waiting') loadStatus()
}

async function startConnect() {
  busy.value = true
  errorMessage.value = ''
  stopWaiting()
  try {
    const data = await telegramService.createLinkCode()
    if (!data?.deep_link) {
      errorMessage.value =
        'El servidor no devolvió el enlace de Telegram. Revisa la variable TELEGRAM_BOT_USERNAME.'
      return
    }
    deepLink.value = data.deep_link
    qrDataUrl.value = await QRCode.toDataURL(data.deep_link, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      // Negro sobre blanco siempre: es lo que mejor leen las cámaras.
      // (La librería solo acepta colores hexadecimales, no oklch.)
      color: { dark: '#000000', light: '#ffffff' },
    })
    expiresAt.value = Date.now() + data.expires_in * 1000
    status.value = 'waiting'
    tick()
    countdownTimer = setInterval(tick, 1000)
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo generar el código.'
  } finally {
    busy.value = false
  }
}

function cancelConnect() {
  stopWaiting()
  status.value = 'unlinked'
}

async function disconnect() {
  busy.value = true
  errorMessage.value = ''
  try {
    await telegramService.unlink()
    linkInfo.value = null
    status.value = 'unlinked'
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo desvincular Telegram.'
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  loadStatus()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopWaiting()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <section class="telegram-connect">
    <h3 class="telegram-connect__title">Telegram</h3>

    <p v-if="status === 'loading'" class="telegram-connect__text">Cargando…</p>

    <!-- Ya vinculado -->
    <template v-else-if="status === 'linked'">
      <p class="telegram-connect__text">
        <span class="telegram-connect__badge">Conectado</span>
        <span v-if="linkInfo?.telegram_username"> como @{{ linkInfo.telegram_username }}</span>
      </p>
      <p class="telegram-connect__text">
        Escribe a <strong>@IslandFinanceBot</strong> mensajes como <code>350 tacos</code> para registrar un gasto.
      </p>
      <p class="telegram-connect__text">
        <template v-if="linkInfo?.default_island">
          Isla predeterminada: <strong>{{ linkInfo.default_island.name }}</strong>.
        </template>
        <template v-else>
          Aún no tienes isla predeterminada: escribe <code>/isla</code> en el bot para elegirla.
        </template>
      </p>
      <button
        class="telegram-connect__button telegram-connect__button--ghost"
        :disabled="busy"
        @click="disconnect"
      >
        Desconectar
      </button>
    </template>

    <!-- Esperando que escanee el QR -->
    <template v-else-if="status === 'waiting'">
      <p class="telegram-connect__text">
        Escanea este código con la cámara de tu celular y pulsa <strong>Iniciar</strong> en Telegram.
      </p>
      <div class="telegram-connect__qr">
        <img :src="qrDataUrl" alt="Código QR para vincular Telegram" width="240" height="240" />
      </div>
      <p class="telegram-connect__text">
        ¿Estás en el celular?
        <a :href="deepLink" target="_blank" rel="noopener">Abrir Telegram</a>
      </p>
      <p class="telegram-connect__hint">
        Esperando conexión… el código vence en {{ countdownText }}.
      </p>
      <button class="telegram-connect__button telegram-connect__button--ghost" @click="cancelConnect">
        Cancelar
      </button>
    </template>

    <!-- Código vencido -->
    <template v-else-if="status === 'expired'">
      <p class="telegram-connect__text">El código venció. Genera uno nuevo para intentarlo otra vez.</p>
      <button class="telegram-connect__button" :disabled="busy" @click="startConnect">
        Generar código nuevo
      </button>
    </template>

    <!-- No vinculado -->
    <template v-else>
      <p class="telegram-connect__text">
        Registra gastos e ingresos escribiéndole un mensaje a nuestro bot de Telegram.
      </p>
      <button class="telegram-connect__button" :disabled="busy" @click="startConnect">
        Conectar Telegram
      </button>
    </template>

    <p v-if="errorMessage" class="telegram-connect__error">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.telegram-connect {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.telegram-connect__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
}

.telegram-connect__text,
.telegram-connect__hint {
  margin: 0;
}

.telegram-connect__hint {
  font-size: 0.875rem;
  opacity: 0.7;
}

.telegram-connect code {
  padding: 0.1rem 0.4rem;
  border-radius: calc(var(--radius) / 2);
  background: var(--shore);
  font-size: 0.9em;
}

.telegram-connect a {
  color: var(--ocean-deep);
  font-weight: 600;
}

.telegram-connect__badge {
  display: inline-block;
  padding: 0.15rem 0.7rem;
  border-radius: 999px;
  background: var(--reef);
  color: var(--label-ink);
  font-size: 0.875rem;
  font-weight: 600;
}

.telegram-connect__qr {
  align-self: flex-start;
  padding: 0.75rem;
  background: oklch(1 0 0);
  border-radius: var(--radius);
  box-shadow: 0 1px 6px oklch(0.25 0.052 210 / 18%);
  line-height: 0;
}

.telegram-connect__button {
  align-self: flex-start;
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: var(--ocean-deep);
  color: var(--label);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.telegram-connect__button:hover:not(:disabled) {
  background: color-mix(in oklch, var(--ocean-deep), var(--foreground) 25%);
}

.telegram-connect__button:focus-visible,
.telegram-connect a:focus-visible {
  outline: 2px solid var(--ocean-deep);
  outline-offset: 2px;
}

.telegram-connect__button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.telegram-connect__button--ghost {
  background: transparent;
  border-color: var(--ocean-deep);
  color: var(--foreground);
}

.telegram-connect__button--ghost:hover:not(:disabled) {
  background: var(--shore);
}

.telegram-connect__error {
  margin: 0;
  color: color-mix(in oklch, var(--tag-coral), var(--foreground) 40%);
}
</style>