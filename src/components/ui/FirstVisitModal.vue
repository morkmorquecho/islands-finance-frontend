<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'island-finance:first-visit-modal-seen'
const isOpen = ref(false)

onMounted(() => {
  isOpen.value = localStorage.getItem(STORAGE_KEY) !== 'true'
})

function closeModal() {
  localStorage.setItem(STORAGE_KEY, 'true')
  isOpen.value = false
}

function reopenModal() {
  isOpen.value = true
}

defineExpose({ reopenModal })
</script>

<template>
  <Teleport to="body">
    <Transition name="map-modal">
      <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
        <section class="map-modal" role="dialog" aria-modal="true" aria-labelledby="map-title">
          <button class="close-button" type="button" aria-label="Cerrar introducción" @click="closeModal">
            ×
          </button>

          <div class="compass" aria-hidden="true">✦</div>
          <p class="eyebrow">Tu carta de navegación</p>
          <h2 id="map-title">Bienvenido, navegante</h2>
          <p class="description">
            Cada archipiélago representa un propósito financiero. Crea islas para organizar tus cuentas,
            explorar tu patrimonio y encontrar el rumbo de tus metas.
          </p>

          <div class="route" aria-hidden="true">
            <span></span><i>⚓</i><span></span>
          </div>

          <button class="primary-button" type="button" @click="closeModal">
            Empezar la travesía
          </button>
          <button class="secondary-button" type="button" @click="closeModal">
            No mostrar de nuevo
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(8 30 39 / 62%);
  backdrop-filter: blur(5px);
}

.map-modal {
  position: relative;
  width: min(430px, 100%);
  padding: 42px 32px 30px;
  overflow: hidden;
  text-align: center;
  color: #183d46;
  background:
    radial-gradient(circle at 20% 15%, rgb(255 255 255 / 55%), transparent 25%),
    #e9d7aa;
  border: 1px solid #b8925e;
  border-radius: 18px 8px 22px 10px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 32%), inset 0 0 0 7px rgb(255 246 210 / 25%);
  transform: rotate(-0.7deg);
}

.map-modal::before,
.map-modal::after {
  position: absolute;
  inset: 14px;
  pointer-events: none;
  content: '';
  border: 1px dashed rgb(139 104 54 / 48%);
  border-radius: 12px 5px 16px 7px;
}

.map-modal::after {
  inset: auto -20px 38px auto;
  width: 95px;
  height: 95px;
  border: 0;
  border-radius: 50%;
  background: rgb(41 112 117 / 13%);
}

.close-button {
  position: absolute;
  top: 20px;
  right: 22px;
  z-index: 1;
  width: 30px;
  height: 30px;
  color: #80623d;
  font-size: 25px;
  line-height: 1;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.compass {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 16px;
  color: #e9d7aa;
  font-size: 25px;
  background: #287477;
  border: 4px solid #c49a5d;
  border-radius: 50%;
  box-shadow: 0 3px 0 #9c7545;
}

.eyebrow {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #9b7140;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h2 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(28px, 6vw, 38px);
  line-height: 1;
}

.description {
  position: relative;
  z-index: 1;
  margin: 18px auto 20px;
  max-width: 320px;
  color: #496267;
  font-size: 14px;
  line-height: 1.6;
}

.route {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 170px;
  margin: 0 auto 22px;
}

.route span {
  flex: 1;
  border-top: 1px dashed #b28b56;
}

.route i {
  color: #9b7140;
  font-style: normal;
}

.primary-button,
.secondary-button {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
}

.primary-button {
  padding: 12px 18px;
  color: #f6e8c4;
  font-weight: 700;
  background: #287477;
  border: 1px solid #1d5c60;
  box-shadow: 0 3px 0 #1d5c60;
}

.secondary-button {
  margin-top: 14px;
  padding: 4px;
  color: #80623d;
  font-size: 12px;
  background: transparent;
  border: 0;
}

.map-modal-enter-active,
.map-modal-leave-active {
  transition: opacity 180ms ease;
}

.map-modal-enter-active .map-modal,
.map-modal-leave-active .map-modal {
  transition: transform 180ms ease, opacity 180ms ease;
}

.map-modal-enter-from,
.map-modal-leave-to {
  opacity: 0;
}

.map-modal-enter-from .map-modal,
.map-modal-leave-to .map-modal {
  opacity: 0;
  transform: rotate(-0.7deg) scale(0.94);
}
</style>

