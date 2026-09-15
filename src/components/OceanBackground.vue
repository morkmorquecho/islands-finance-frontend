<template>
  <div class="ocean-background" aria-hidden="true">
    <svg class="gull gull--one" viewBox="0 0 44 18"><path d="M2 14Q11 3 22 13Q32 2 42 12" /></svg>
    <svg class="gull gull--two" viewBox="0 0 44 18"><path d="M2 14Q11 3 22 13Q32 2 42 12" /></svg>
    <svg class="gull gull--three" viewBox="0 0 44 18"><path d="M2 14Q11 3 22 13Q32 2 42 12" /></svg>
    <div class="ocean-horizon" />
    <svg class="ocean-wave ocean-wave--far" viewBox="0 0 1200 160" preserveAspectRatio="none">
      <path d="M0 78C104 43 195 99 301 67S505 42 611 76s197 35 304 1 189-20 285 5v78H0Z" />
    </svg>
    <svg class="ocean-wave ocean-wave--near" viewBox="0 0 1200 190" preserveAspectRatio="none">
      <path d="M0 91c91-37 187 23 284-8s190-46 296-7 207 30 308-8 211-21 312 15v107H0Z" />
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
  </div>
</template>

<style scoped>
.ocean-background {
  /* ⬅️ MODIFICADO: subí el mar. Aumentá este valor para subirlo más, bajalo para devolverlo. */
  --horizon-shift: 8%;

  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  /* ⬅️ MODIFICADO: los stops del degradado ahora siguen a --horizon-shift */
  background: linear-gradient(to bottom,
    var(--sky-top) 0%,
    var(--sky-horizon) calc(39% - var(--horizon-shift)),
    var(--ocean-far) calc(40% - var(--horizon-shift)),
    color-mix(in oklab, var(--ocean-near) 88%, var(--ocean-silt)) calc(72% - var(--horizon-shift)),
    var(--ocean-deep) 100%);
}

.ocean-horizon {
  position: absolute;
  /* ⬅️ MODIFICADO */
  top: calc(39.5% - var(--horizon-shift));
  width: 100%;
  height: 2px;
  background: color-mix(in oklab, var(--shore) 65%, transparent);
}

.ocean-wave { position: absolute; left: -5%; width: 110%; fill: var(--ocean-far); animation: ocean-drift 13s ease-in-out infinite alternate; }
/* ⬅️ MODIFICADO: top de ambas olas */
.ocean-wave--far { top: calc(38% - var(--horizon-shift)); height: 17%; opacity: .72; }
.ocean-wave--near { top: calc(49% - var(--horizon-shift)); height: 22%; fill: var(--ocean-deep); opacity: .25; animation-duration: 17s; animation-direction: alternate-reverse; }

.ocean-current { position: absolute; left: -9%; width: 118%; overflow: visible; fill: none; stroke: var(--ocean-glint); stroke-width: 2; stroke-linecap: round; opacity: .42; animation: current-flow 16s ease-in-out infinite alternate; }
.ocean-current path:nth-child(2) { opacity: .46; stroke-width: 1.25; }
/* ⬅️ MODIFICADO: top de ambas corrientes */
.ocean-current--one { top: calc(48% - var(--horizon-shift)); height: 22%; }
.ocean-current--two { top: calc(68% - var(--horizon-shift)); height: 26%; opacity: .25; animation-duration: 23s; animation-direction: alternate-reverse; }

/* ⬅️ MODIFICADO: inset superior de ripples / caustics / haze */
.ocean-ripples { position: absolute; inset: calc(51% - var(--horizon-shift)) -5% 0; opacity: .2; background-image: repeating-linear-gradient(174deg, transparent 0 28px, var(--shore) 29px 30px, transparent 31px 56px); background-size: 100% 120px; animation: ocean-drift 20s ease-in-out infinite alternate-reverse; }
.ocean-caustics { position: absolute; inset: calc(47% - var(--horizon-shift)) -8% -8%; opacity: .22; background-image: radial-gradient(ellipse at 18% 18%, transparent 0 34%, var(--ocean-glint) 35% 36%, transparent 37% 100%), radial-gradient(ellipse at 73% 44%, transparent 0 38%, var(--ocean-glint) 39% 40%, transparent 41% 100%); background-size: 330px 150px, 440px 190px; animation: water-shimmer 12s ease-in-out infinite alternate; mix-blend-mode: soft-light; }
.ocean-haze { position: absolute; inset: calc(43% - var(--horizon-shift)) -5% -5%; background: radial-gradient(ellipse at 24% 22%, var(--ocean-silt), transparent 36%), radial-gradient(ellipse at 76% 56%, color-mix(in oklab, var(--ocean-silt) 70%, transparent), transparent 43%); filter: blur(28px); animation: silt-breathe 18s ease-in-out infinite; mix-blend-mode: soft-light; pointer-events: none; }

.gull { position: absolute; width: 38px; fill: none; stroke: var(--label-ink); stroke-width: 2; stroke-linecap: round; opacity: .32; animation: gull-drift 18s ease-in-out infinite; }
.gull--one { top: 16%; left: 13%; }
.gull--two { top: 24%; right: 19%; width: 25px; animation-delay: -6s; }
.gull--three { top: 12%; right: 34%; width: 18px; animation-delay: -11s; opacity: .22; }

@keyframes ocean-drift {
  from { transform: translate3d(-2%, 0, 0); }
  to { transform: translate3d(2%, 4px, 0); }
}
@keyframes current-flow {
  0% { transform: translate3d(-7%, 0, 0) scaleX(1.08); }
  50% { transform: translate3d(1%, 8px, 0) scaleX(.98); }
  100% { transform: translate3d(7%, -3px, 0) scaleX(1.08); }
}
@keyframes water-shimmer {
  0% { transform: translate3d(-4%, -1%, 0); opacity: .18; }
  50% { opacity: .34; }
  100% { transform: translate3d(4%, 2%, 0); opacity: .2; }
}
@keyframes silt-breathe {
  0%, 100% { transform: translate3d(-2%, 0, 0) scale(1); opacity: .16; }
  50% { transform: translate3d(2%, -7px, 0) scale(1.05); opacity: .25; }
}
@keyframes gull-drift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(7px); }
}

@media (max-width: 760px) {
  .ocean-background {
    /* ⬅️ MODIFICADO: en móvil el horizonte ya está más arriba, subo menos */
    --horizon-shift: 4%;
  }
  /* ⬅️ MODIFICADO: los overrides de móvil también siguen la variable */
  .ocean-horizon { top: calc(33% - var(--horizon-shift)); }
  .ocean-wave--far { top: calc(32% - var(--horizon-shift)); }
  .ocean-wave--near { top: calc(43% - var(--horizon-shift)); }
  .ocean-ripples { inset-block-start: calc(44% - var(--horizon-shift)); }
  .gull--one { left: 7%; }
  .gull--three { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ocean-wave, .ocean-current, .ocean-ripples, .ocean-caustics, .ocean-haze, .gull { animation: none; }
}
</style>