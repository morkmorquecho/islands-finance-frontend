<script setup lang="ts">
const BUBBLES = [
  { left: "6%", bottom: "4%", size: "6px", duration: "8s" },
  { left: "14%", bottom: "16%", size: "4px", duration: "6.5s", delay: "-2s" },
  { left: "22%", bottom: "10%", size: "8px", duration: "9s" },
  { left: "30%", bottom: "2%", size: "5px", duration: "7.5s", delay: "-3s" },
  { left: "38%", bottom: "20%", size: "4px", duration: "6s", delay: "-1s" },
  { left: "48%", bottom: "4%", size: "5px", duration: "7s", delay: "-2s" },
  { left: "55%", bottom: "14%", size: "9px", duration: "10s", delay: "-5s" },
  { left: "66%", bottom: "14%", size: "10px", duration: "11s", delay: "-4s" },
  { left: "78%", bottom: "18%", size: "6px", duration: "8.4s", delay: "-2.2s" },
  { left: "88%", bottom: "10%", size: "4px", duration: "6.4s", delay: "-4.8s" },
  { left: "93%", bottom: "6%", size: "7px", duration: "9.6s", delay: "-0.5s" },
]

const NARROW_ALGAE = [
  { left: "4%", height: "145px", width: "3px", delay: "-1s" },
  { left: "10%", height: "95px", width: "2px", delay: "-3s" },
  { left: "18%", height: "170px", width: "3px", delay: "-2s" },
  { left: "29%", height: "120px", width: "2px", delay: "-4s" },
  { left: "42%", height: "155px", width: "3px", delay: "-1.5s" },
  { left: "56%", height: "105px", width: "2px", delay: "-3.5s" },
  { left: "68%", height: "165px", width: "3px", delay: "-2.5s" },
  { left: "81%", height: "125px", width: "2px", delay: "-4.5s" },
  { left: "92%", height: "150px", width: "3px", delay: "-1.8s" },
]
</script>

<template>
  <div class="ocean-background" aria-hidden="true">
    <div class="deep-seabed" />

    <svg
      class="seabed"
      viewBox="0 0 1200 190"
      preserveAspectRatio="none"
    >
      <path
        d="M0 92C110 48 200 106 320 78C455 46 530 120 660 82C800 42 890 108 1010 73C1090 50 1145 68 1200 45V190H0Z"
      />
    </svg>

    <div
      v-for="(algae, index) in NARROW_ALGAE"
      :key="`algae-${index}`"
      class="narrow-algae"
      :style="{
        left: algae.left,
        height: algae.height,
        width: algae.width,
        animationDelay: algae.delay,
      }"
    >
      <span class="algae-tip" />
      <span class="algae-branch branch-left" />
      <span class="algae-branch branch-right" />
      <span class="algae-branch branch-left-small" />
    </div>

    <span
      v-for="(bubble, index) in BUBBLES"
      :key="`bubble-${index}`"
      class="bubble"
      :style="{
        left: bubble.left,
        bottom: bubble.bottom,
        width: bubble.size,
        height: bubble.size,
        animationDuration: bubble.duration,
        animationDelay: bubble.delay || '0s',
      }"
    />
  </div>
</template>

<style scoped>
.ocean-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.deep-seabed {
  position: absolute;
  inset: 48% 0 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 37, 45, 0.08) 16%,
    rgba(0, 24, 31, 0.42) 100%
  );
}

.seabed {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 190px;
  fill: rgba(0, 24, 31, 0.8);
}

.narrow-algae {
  position: absolute;
  bottom: 13px;
  z-index: 2;
  transform-origin: bottom center;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(
    90deg,
    rgba(4, 56, 62, 0.95),
    rgba(37, 157, 139, 0.76),
    rgba(5, 72, 73, 0.95)
  );
  box-shadow: 0 0 8px rgba(78, 202, 180, 0.16);
  animation: narrow-algae-sway 5s ease-in-out infinite;
}

.algae-tip {
  position: absolute;
  top: -22px;
  left: 50%;
  width: 2px;
  height: 28px;
  border-radius: 999px;
  background: inherit;
  transform: translateX(-50%) rotate(-8deg);
  transform-origin: bottom;
}

.algae-branch {
  position: absolute;
  width: 2px;
  height: 42px;
  border-radius: 999px;
  background: inherit;
  transform-origin: bottom;
}

.branch-left {
  top: 20%;
  left: 0;
  transform: rotate(-25deg);
}

.branch-right {
  top: 42%;
  right: 0;
  transform: rotate(28deg);
}

.branch-left-small {
  top: 63%;
  left: 0;
  height: 30px;
  transform: rotate(-35deg);
}

.bubble {
  position: absolute;
  z-index: 4;
  display: block;
  border: 1px solid rgba(184, 241, 231, 0.72);
  border-radius: 50%;
  background: rgba(170, 237, 229, 0.1);
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.48),
    0 0 5px rgba(139, 239, 226, 0.32);
  opacity: 0.55;
  animation: bubble-rise linear infinite;
}

@keyframes narrow-algae-sway {
  0%,
  100% {
    transform: rotate(-5deg);
  }

  50% {
    transform: translateX(3px) rotate(7deg);
  }
}

@keyframes bubble-rise {
  0% {
    transform: translate3d(0, 20px, 0) scale(0.8);
    opacity: 0;
  }

  15% {
    opacity: 0.55;
  }

  85% {
    opacity: 0.35;
  }

  100% {
    transform: translate3d(18px, -520px, 0) scale(1.15);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bubble,
  .narrow-algae {
    animation: none;
  }
}
</style>