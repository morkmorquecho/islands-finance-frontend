<template>
  <div class="ocean-background" aria-hidden="true">
    <div class="sun-glow" />

    <svg class="gull gull--one" viewBox="0 0 44 18">
      <path d="M2 14Q11 3 22 13Q32 2 42 12" />
    </svg>

    <svg class="gull gull--two" viewBox="0 0 44 18">
      <path d="M2 14Q11 3 22 13Q32 2 42 12" />
    </svg>

    <svg class="gull gull--three" viewBox="0 0 44 18">
      <path d="M2 14Q11 3 22 13Q32 2 42 12" />
    </svg>

    <div class="ocean-horizon" />

    <svg class="ocean-wave ocean-wave--far" viewBox="0 0 1200 180" preserveAspectRatio="none">
      <path d="M0 84C120 38 200 105 320 70S520 40 640 77s210 40 330 2 145-20 230 10v91H0Z" />
    </svg>

    <svg class="ocean-wave ocean-wave--middle" viewBox="0 0 1200 210" preserveAspectRatio="none">
      <path d="M0 110c100-45 190 25 300-10s205-52 320-8 215 39 320-5 180-24 260 13v110H0Z" />
    </svg>

    <svg class="ocean-wave ocean-wave--near" viewBox="0 0 1200 230" preserveAspectRatio="none">
      <path d="M0 112c95-42 190 28 300-8s210-48 325-5 216 35 315-7 175-22 260 14v124H0Z" />
    </svg>

    <svg class="ocean-current ocean-current--one" viewBox="0 0 1200 220" preserveAspectRatio="none">
      <path d="M-30 102C121 28 235 175 393 98S684 32 832 111s270 51 410-18" />
      <path d="M-42 146c148-70 268 61 414 7s277-76 441-3 281 34 430-31" />
    </svg>

    <svg class="ocean-current ocean-current--two" viewBox="0 0 1200 260" preserveAspectRatio="none">
      <path d="M-55 92C95 29 226 153 370 91s278-38 427 24 292 46 458-31" />
      <path d="M-38 188c169-72 278 38 438-16s270-27 424 24 279 25 426-24" />
    </svg>

    <div class="ocean-ripples" />
    <div class="ocean-caustics" />
    <div class="ocean-haze" />
    <div class="ocean-sparkles" />
  </div>
</template>

<style scoped>
.ocean-background {
  --horizon-shift: var(--ocean-horizon-shift, 8%);

  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  isolation: isolate;
  background:
    linear-gradient(
      to bottom,
      var(--sky-top) 0%,
      var(--sky-horizon) calc(39% - var(--horizon-shift)),
      var(--ocean-far) calc(40% - var(--horizon-shift)),
      color-mix(in oklab, var(--ocean-near) 88%, var(--ocean-silt))
        calc(72% - var(--horizon-shift)),
      var(--ocean-deep) 100%
    );
}

.ocean-background::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.18;
  background:
    radial-gradient(ellipse at 50% 44%, var(--shore), transparent 34%),
    linear-gradient(115deg, transparent 35%, color-mix(in oklab, var(--ocean-glint) 24%, transparent), transparent 68%);
  animation: ambient-light 15s ease-in-out infinite alternate;
}

.sun-glow {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(34vw, 360px);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--shore), transparent 68%);
  opacity: 0.1;
  filter: blur(16px);
  animation: sun-pulse 9s ease-in-out infinite;
}

.ocean-horizon {
  position: absolute;
  top: calc(39.5% - var(--horizon-shift));
  width: 100%;
  height: 2px;
  background: color-mix(in oklab, var(--shore) 65%, transparent);
  box-shadow: 0 0 20px color-mix(in oklab, var(--shore) 35%, transparent);
  animation: horizon-glow 7s ease-in-out infinite alternate;
}

.ocean-wave {
  position: absolute;
  left: -7%;
  width: 114%;
  fill: var(--ocean-far);
  transform-origin: center bottom;
  animation: wave-breathe 14s ease-in-out infinite alternate;
}

.ocean-wave--far {
  top: calc(37% - var(--horizon-shift));
  height: 18%;
  opacity: 0.7;
}

.ocean-wave--middle {
  top: calc(43% - var(--horizon-shift));
  height: 22%;
  fill: var(--ocean-near);
  opacity: 0.38;
  animation-duration: 17s;
  animation-delay: -4s;
}

.ocean-wave--near {
  top: calc(50% - var(--horizon-shift));
  height: 25%;
  fill: var(--ocean-deep);
  opacity: 0.28;
  animation-duration: 20s;
  animation-delay: -8s;
  animation-direction: alternate-reverse;
}

.ocean-current {
  position: absolute;
  left: -10%;
  width: 120%;
  overflow: visible;
  fill: none;
  stroke: var(--ocean-glint);
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.42;
  animation: current-flow 16s ease-in-out infinite alternate;
}

.ocean-current path:nth-child(2) {
  opacity: 0.46;
  stroke-width: 1.25;
}

.ocean-current--one {
  top: calc(48% - var(--horizon-shift));
  height: 22%;
}

.ocean-current--two {
  top: calc(68% - var(--horizon-shift));
  height: 26%;
  opacity: 0.25;
  animation-duration: 23s;
  animation-direction: alternate-reverse;
}

.ocean-ripples {
  position: absolute;
  inset: calc(51% - var(--horizon-shift)) -5% 0;
  opacity: 0.2;
  background-image:
    repeating-linear-gradient(
      174deg,
      transparent 0 28px,
      var(--shore) 29px 30px,
      transparent 31px 56px
    );
  background-size: 100% 120px;
  animation: ripple-drift 19s ease-in-out infinite alternate-reverse;
}

.ocean-caustics {
  position: absolute;
  inset: calc(47% - var(--horizon-shift)) -8% -8%;
  opacity: 0.22;
  background-image:
    radial-gradient(
      ellipse at 18% 18%,
      transparent 0 34%,
      var(--ocean-glint) 35% 36%,
      transparent 37% 100%
    ),
    radial-gradient(
      ellipse at 73% 44%,
      transparent 0 38%,
      var(--ocean-glint) 39% 40%,
      transparent 41% 100%
    );
  background-size: 330px 150px, 440px 190px;
  mix-blend-mode: soft-light;
  animation: caustic-shimmer 12s ease-in-out infinite alternate;
}

.ocean-haze {
  position: absolute;
  inset: calc(43% - var(--horizon-shift)) -5% -5%;
  background:
    radial-gradient(ellipse at 24% 22%, var(--ocean-silt), transparent 36%),
    radial-gradient(
      ellipse at 76% 56%,
      color-mix(in oklab, var(--ocean-silt) 70%, transparent),
      transparent 43%
    );
  filter: blur(28px);
  mix-blend-mode: soft-light;
  pointer-events: none;
  animation: silt-breathe 18s ease-in-out infinite;
}

.ocean-sparkles {
  position: absolute;
  inset: calc(48% - var(--horizon-shift)) 0 0;
  opacity: 0.3;
  background-image:
    radial-gradient(circle, var(--shore) 0 1px, transparent 1.5px),
    radial-gradient(circle, var(--ocean-glint) 0 1px, transparent 1.5px);
  background-position: 10px 18px, 70px 44px;
  background-size: 130px 95px, 180px 125px;
  mask-image: linear-gradient(to bottom, transparent, black 25%, transparent 90%);
  animation: sparkle-flow 18s linear infinite;
}

.gull {
  position: absolute;
  width: 38px;
  fill: none;
  stroke: var(--label-ink);
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.32;
  animation: gull-drift 18s ease-in-out infinite;
}

.gull--one {
  top: 16%;
  left: 13%;
}

.gull--two {
  top: 24%;
  right: 19%;
  width: 25px;
  animation-delay: -6s;
}

.gull--three {
  top: 12%;
  right: 34%;
  width: 18px;
  opacity: 0.22;
  animation-delay: -11s;
}

@keyframes wave-breathe {
  0% {
    transform: translate3d(-3%, 0, 0) scaleY(0.96);
  }
  50% {
    transform: translate3d(1%, 5px, 0) scaleY(1.03);
  }
  100% {
    transform: translate3d(3%, -3px, 0) scaleY(0.98);
  }
}

@keyframes current-flow {
  0% {
    transform: translate3d(-7%, 0, 0) scaleX(1.08);
  }
  50% {
    transform: translate3d(1%, 8px, 0) scaleX(0.98);
  }
  100% {
    transform: translate3d(7%, -3px, 0) scaleX(1.08);
  }
}

@keyframes ripple-drift {
  from {
    transform: translate3d(-3%, 0, 0) skewX(-1deg);
    background-position: 0 0;
  }
  to {
    transform: translate3d(3%, -12px, 0) skewX(1deg);
    background-position: 80px 50px;
  }
}

@keyframes caustic-shimmer {
  0% {
    transform: translate3d(-4%, -1%, 0) scale(1);
    opacity: 0.16;
  }
  50% {
    opacity: 0.34;
  }
  100% {
    transform: translate3d(4%, 2%, 0) scale(1.04);
    opacity: 0.2;
  }
}

@keyframes silt-breathe {
  0%,
  100% {
    transform: translate3d(-2%, 0, 0) scale(1);
    opacity: 0.16;
  }
  50% {
    transform: translate3d(2%, -7px, 0) scale(1.05);
    opacity: 0.25;
  }
}

@keyframes sparkle-flow {
  from {
    transform: translate3d(-2%, 0, 0);
  }
  to {
    transform: translate3d(5%, -24px, 0);
  }
}

@keyframes ambient-light {
  from {
    transform: translateX(-4%);
    opacity: 0.12;
  }
  to {
    transform: translateX(4%);
    opacity: 0.24;
  }
}

@keyframes sun-pulse {
  0%,
  100% {
    transform: translateX(-50%) scale(0.96);
    opacity: 0.08;
  }
  50% {
    transform: translateX(-50%) scale(1.08);
    opacity: 0.16;
  }
}

@keyframes horizon-glow {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes gull-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(7px, -4px, 0);
  }
}

@media (max-width: 760px) {
  .ocean-background {
    --horizon-shift: 4%;
  }

  .ocean-horizon {
    top: calc(33% - var(--horizon-shift));
  }

  .ocean-wave--far {
    top: calc(32% - var(--horizon-shift));
  }

  .ocean-wave--middle {
    top: calc(38% - var(--horizon-shift));
  }

  .ocean-wave--near {
    top: calc(43% - var(--horizon-shift));
  }

  .ocean-ripples {
    inset-block-start: calc(44% - var(--horizon-shift));
  }

  .gull--one {
    left: 7%;
  }

  .gull--three {
    display: none;
  }

  .sun-glow {
    width: 55vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ocean-background *,
  .ocean-background::before {
    animation: none !important;
  }
}
</style>