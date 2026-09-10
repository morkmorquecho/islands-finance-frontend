<script setup lang="ts">
const KELP = [
  { style: "left:8%; bottom:6%; width:3px; height:120px; animation-delay:-1s;" },
  { style: "left:14%; bottom:6%; width:3px; height:90px; animation-delay:-3s;" },
  { style: "right:12%; bottom:5%; width:3px; height:140px; animation-delay:-2s;" },
  { style: "right:22%; bottom:6%; width:2px; height:80px; animation-delay:-4.5s;" },
];

const BUBBLES = [
  { style: "left:6%; bottom:4%; width:5px; height:5px; animation-duration:8s;" },
  { style: "left:14%; bottom:16%; width:3px; height:3px; animation-duration:6.5s; animation-delay:-2s;" },
  { style: "left:22%; bottom:10%; width:6px; height:6px; animation-duration:9s;" },
  { style: "left:30%; bottom:2%; width:4px; height:4px; animation-duration:7.5s; animation-delay:-3s;" },
  { style: "left:38%; bottom:20%; width:3px; height:3px; animation-duration:6s; animation-delay:-1s;" },
  { style: "left:48%; bottom:4%; width:4px; height:4px; animation-duration:7s; animation-delay:-2s;" },
  { style: "left:55%; bottom:14%; width:7px; height:7px; animation-duration:10s; animation-delay:-5s;" },
  { style: "left:62%; bottom:8%; width:3px; height:3px; animation-duration:6.8s; animation-delay:-1.5s;" },
  { style: "left:66%; bottom:14%; width:8px; height:8px; animation-duration:11s; animation-delay:-4s;" },
  { style: "left:73%; bottom:2%; width:4px; height:4px; animation-duration:7.2s; animation-delay:-3.5s;" },
  { style: "left:78%; bottom:18%; width:5px; height:5px; animation-duration:8.4s; animation-delay:-2.2s;" },
  { style: "left:82%; bottom:2%; width:5px; height:5px; animation-duration:8s; animation-delay:-1s;" },
  { style: "left:88%; bottom:10%; width:3px; height:3px; animation-duration:6.4s; animation-delay:-4.8s;" },
  { style: "left:93%; bottom:6%; width:6px; height:6px; animation-duration:9.6s; animation-delay:-0.5s;" },
];
</script>

<template>
  <div class="seabed-background" aria-hidden="true">
    <svg class="seabed-floor" viewBox="0 0 1200 160" preserveAspectRatio="none">
      <path d="M0 60C140 20 260 90 420 55S680 15 840 60s220 70 360 20v80H0Z" />
    </svg>
    <span
      v-for="(k, i) in KELP"
      :key="`kelp-${i}`"
      class="seabed-kelp"
      :style="`${k.style} background: color-mix(in oklab, var(--ocean-near) 60%, black);`"
    />
    <span
      v-for="(b, i) in BUBBLES"
      :key="`bubble-${i}`"
      class="seabed-bubble"
      :style="b.style"
    />
  </div>
</template>


<style scoped>
.seabed-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: var(--deep-progress, 0);
  background: linear-gradient(to bottom,
    transparent 0%,
    color-mix(in oklab, var(--ocean-deep) 35%, black) 50%,
    oklch(0.09 0.035 194) 100%);
  pointer-events: none;
}

@keyframes kelp-sway {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}

@keyframes bubble-rise {
  from { transform: translateY(0); opacity: .35; }
  to { transform: translateY(-420px); opacity: 0; }
}

.seabed-floor {
  position: absolute;
  bottom: 0;
  width: 100%;
  fill: color-mix(in oklab, var(--ocean-deep) 45%, black);
  opacity: .85;
}

.seabed-kelp {
  position: absolute;
  border-radius: 3px;
  transform-origin: bottom center;
  animation: kelp-sway 6s ease-in-out infinite;
  opacity: .55;
}

.seabed-bubble {
  position: absolute;
  border-radius: 50%;
  background: color-mix(in oklab, var(--shore) 55%, transparent);
  opacity: .35;
  animation: bubble-rise linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .seabed-bubble,
  .seabed-kelp {
    animation: none;
  }
}
</style>