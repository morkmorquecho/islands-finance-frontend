<script setup lang="ts">
import { computed, useId } from "vue";
import type { BrandTint } from "../types/brand-tints";

const props = withDefaults(
  defineProps<{
    name: string;
    brandTint: BrandTint;
    animationDelay?: number;
    variant?: number;
    compact?: boolean;
    vegetation?: boolean;
  }>(),
  {
    animationDelay: 0,
    variant: 0,
    compact: false,
    vegetation: false,
  }
);

const COASTS = [
  "M10 65 C15 59 19 57 18 50 C17 45 22 43 28 42 C34 41 34 33 40 29 C46 26 52 30 57 24 C62 18 67 16 73 19 C79 22 81 13 88 12 C95 11 98 20 105 19 C113 18 116 25 121 29 C127 33 136 31 138 39 C140 45 150 45 152 51 C154 57 145 61 150 66 C157 72 148 78 141 76 C134 74 133 84 126 87 C119 90 113 82 106 87 C99 92 94 88 88 92 C80 98 74 90 67 91 C60 92 56 84 50 85 C43 86 39 80 32 82 C27 83 28 75 22 73 C16 71 12 72 10 65 Z",
  "M12 60 C18 55 25 56 23 48 C21 42 29 39 35 38 C42 37 43 29 49 26 C55 23 60 28 65 22 C71 15 78 19 82 22 C88 25 91 14 98 15 C105 16 104 24 112 25 C120 26 120 33 128 35 C137 37 143 43 140 50 C138 56 150 59 153 65 C155 71 145 73 140 76 C134 80 130 88 123 87 C116 86 111 81 104 86 C97 91 91 87 85 91 C77 96 72 88 65 89 C58 90 54 81 47 83 C40 85 37 77 30 78 C23 79 26 70 19 69 C14 68 10 65 12 60 Z",
  "M15 57 C20 51 29 53 30 45 C31 38 38 38 44 35 C50 32 49 24 57 23 C64 22 67 28 73 22 C79 16 85 19 90 23 C96 28 98 17 105 18 C112 19 114 27 120 30 C126 33 135 30 137 38 C139 45 148 48 146 55 C144 61 155 66 151 71 C147 77 138 73 134 80 C130 87 122 87 116 83 C109 79 104 89 97 90 C90 91 86 84 79 88 C72 92 66 86 60 87 C52 88 50 80 43 80 C36 80 35 73 28 73 C21 73 24 65 18 64 C14 63 12 60 15 57 Z",
  "M9 66 C16 61 21 58 20 52 C19 46 26 43 33 44 C39 44 39 35 45 31 C51 27 57 32 62 26 C67 20 74 18 80 22 C86 26 89 16 96 14 C103 12 108 22 114 23 C122 25 123 32 130 34 C138 36 138 44 147 48 C154 52 148 59 151 64 C156 71 147 75 140 75 C133 75 132 85 124 87 C116 89 112 82 105 87 C98 92 92 86 86 91 C78 97 72 88 65 91 C57 94 53 84 46 85 C39 86 36 80 30 82 C23 84 25 76 19 74 C13 72 8 71 9 66 Z",
  "M14 62 C21 57 28 59 27 51 C26 44 34 42 40 39 C47 36 48 29 55 27 C62 25 67 31 72 25 C77 19 84 22 89 25 C96 28 99 19 106 20 C113 21 116 29 122 31 C129 34 139 32 141 41 C143 48 151 50 149 57 C147 64 157 67 151 73 C146 78 138 74 133 81 C128 88 120 84 114 83 C107 82 103 90 96 91 C89 92 84 85 78 89 C71 94 65 87 59 88 C52 89 47 82 41 83 C34 84 32 77 25 78 C18 79 22 70 16 69 C12 68 11 65 14 62 Z",
  "M11 59 C17 53 24 55 25 47 C26 40 34 38 41 36 C48 34 51 27 58 25 C65 23 70 29 76 23 C82 17 88 20 94 24 C100 28 103 18 110 20 C117 22 118 29 126 32 C134 35 142 38 140 46 C138 53 151 57 150 63 C149 70 141 72 136 77 C130 82 129 89 121 88 C113 87 109 80 102 85 C95 90 89 85 83 89 C76 94 70 87 63 89 C56 91 51 82 44 84 C37 86 34 78 28 79 C21 80 23 71 17 69 C12 67 8 63 11 59 Z",
];

const LANDMASSES = [
  "M25 61 C32 54 37 48 45 46 C51 43 52 35 59 32 C66 29 71 34 77 28 C83 23 89 27 94 29 C101 32 104 27 111 31 C118 34 122 38 128 42 C134 46 130 53 135 58 C139 63 132 69 126 70 C120 72 118 79 111 80 C104 81 100 85 94 82 C87 79 82 86 76 84 C69 82 65 78 58 80 C52 82 49 73 43 74 C37 75 35 69 30 69 C26 69 23 65 25 61 Z",
  "M29 57 C36 49 43 47 51 44 C57 41 58 34 65 32 C71 30 76 35 82 30 C88 26 94 29 99 31 C106 34 110 31 116 35 C123 39 127 43 132 47 C136 52 129 56 134 61 C138 66 130 70 124 72 C118 74 114 80 108 79 C101 78 97 84 91 82 C84 80 78 85 72 81 C66 77 60 80 54 78 C48 76 45 70 39 71 C34 71 32 65 28 64 C25 63 26 60 29 57 Z",
  "M31 55 C38 47 45 45 52 42 C59 39 61 32 68 31 C75 30 78 35 84 29 C90 24 96 28 101 30 C107 33 111 31 117 35 C123 39 125 44 131 47 C136 51 130 57 135 61 C140 65 131 70 125 71 C119 73 116 80 109 78 C102 77 98 84 91 81 C84 78 79 85 72 82 C66 79 60 81 55 77 C49 73 44 71 38 70 C33 68 36 62 31 60 C28 59 28 57 31 55 Z",
  "M26 61 C33 55 39 49 47 46 C54 43 55 36 62 33 C69 30 74 35 80 29 C86 24 92 27 97 30 C104 33 108 29 115 33 C121 37 125 40 131 44 C137 48 132 54 136 59 C140 64 133 69 127 70 C121 72 118 80 111 80 C104 80 100 85 94 82 C87 79 82 86 76 83 C69 80 64 78 58 81 C52 83 49 74 43 75 C37 76 34 70 29 69 C25 68 23 64 26 61 Z",
  "M30 58 C37 50 45 48 51 45 C58 42 59 35 66 33 C73 31 77 36 83 30 C89 26 95 29 100 32 C106 35 111 32 117 36 C124 40 128 44 133 48 C137 53 131 57 135 62 C138 66 131 71 125 72 C119 73 115 79 109 78 C102 77 98 84 92 81 C85 78 79 85 73 82 C67 79 61 80 55 78 C49 76 46 70 40 71 C35 72 33 66 29 64 C26 62 27 60 30 58 Z",
  "M27 57 C34 50 42 46 49 44 C56 41 59 34 66 32 C73 30 78 35 84 29 C90 24 96 28 101 31 C108 35 112 31 119 36 C126 41 129 44 134 48 C138 53 132 57 136 62 C140 67 132 71 126 73 C120 75 117 81 110 79 C103 77 98 84 92 82 C85 80 80 85 73 82 C66 79 60 81 54 78 C48 75 44 71 38 71 C33 71 32 65 28 64 C24 62 24 59 27 57 Z",
];

const id = useId().replaceAll(":", "");

const shapeIndex = computed(() => props.variant % COASTS.length);
const coast = computed(() => COASTS[shapeIndex.value]);
const landmass = computed(() => LANDMASSES[shapeIndex.value]);
</script>

<template>
  <figure
    :class="['finance-island', { 'finance-island--compact': compact }]"
    :style="{ '--island-delay': `${animationDelay}s` }"
    tabindex="0"
    :aria-label="`Cuenta ${name}`"
  >
    <svg viewBox="0 0 168 112" role="img" aria-hidden="true">
      <defs>
        <clipPath :id="`coast-${id}`">
          <path :d="coast" />
        </clipPath>
      </defs>

      <path
        class="island-waterline island-waterline--outer"
        :d="coast"
        transform="translate(0 7) scale(1 1.02)"
      />
      <path
        class="island-waterline island-waterline--inner"
        :d="coast"
        transform="translate(0 3)"
      />
      <path class="island-sand" :d="coast" />

      <g :clip-path="`url(#coast-${id})`">
        <path :class="`island-land island-land--${brandTint}`" :d="landmass" />

        <path
          class="island-shore"
          d="M17 64 C25 60 34 61 43 65 C48 67 53 66 58 63
             M116 69 C125 64 135 63 145 67
             M47 82 C55 78 63 78 70 82"
        />

        <path
          class="island-contour island-contour--one"
          d="M40 58 C47 50 54 46 64 45 C72 44 75 36 85 36
             C94 36 98 31 108 35 C114 38 119 38 125 41"
        />
        <path
          class="island-contour island-contour--two"
          d="M50 66 C58 57 67 54 76 55 C84 56 87 47 97 48
             C105 49 110 44 119 49"
        />
        <path
          class="island-contour island-contour--three"
          d="M63 71 C71 65 80 63 87 65 C95 67 99 58 108 60 C113 61 117 61 121 64"
        />

        <path
          class="island-hatch"
          d="M43 48 C40 50 38 52 37 55
             M54 37 C51 39 49 41 48 44
             M111 34 C114 36 116 38 118 41
             M124 48 C127 50 129 52 131 55
             M102 73 C105 75 107 77 109 79
             M61 73 C59 75 57 77 55 79"
        />
      </g>

      <path
        class="island-cliff"
        d="M131 37 C136 39 141 43 146 48 C149 52 146 57 143 60
           C140 57 137 56 138 51 C139 47 136 44 132 43 Z"
      />
      <path
        class="island-rock"
        d="M142 76 C145 72 148 69 151 70 C155 72 157 75 155 79
           C153 82 148 83 145 81 Z"
      />
      <path
        class="island-pebble"
        d="M18 78 C20 75 23 73 26 75 C29 76 30 79 28 82
           C25 83 21 83 19 81 Z
           M129 92 C131 89 134 87 137 89 C140 91 140 94 138 96
           C134 96 131 95 129 92 Z"
      />

      <g v-if="vegetation" class="island-palm" transform="translate(79 35)">
        <path class="palm-shadow" d="M-13 29 C-5 26 9 25 20 29" />
        <path class="palm-trunk" d="M0 29 C4 21 3 12 8 2" />
        <path class="palm-trunk-detail" d="M2 23 C4 23 5 24 6 24 M4 17 C6 17 7 18 8 18 M5 11 C7 11 8 12 9 12" />
        <path
          class="palm-frond"
          d="M8 3 C1-4-8-3-15 3
             M8 3 C16-4 25-1 29 6
             M8 3 C12-4 12-11 9-16
             M8 3 C2-5-6-8-13-5
             M8 3 C17 1 23 6 24 13"
        />
        <path
          class="palm-leaflets"
          d="M-8 0 C-9 2-9 4-9 5
             M-3-2 C-3 0-3 2-3 4
             M19 0 C19 2 18 4 18 6
             M24 3 C24 5 23 7 22 8
             M10-8 C8-9 6-10 5-10
             M11-5 C13-6 15-7 16-7
             M-6-5 C-7-3-8-1-8 0
             M18 7 C17 8 15 9 14 10"
        />
        <circle class="palm-crown" cx="8" cy="3" r="2.4" />
      </g>
    </svg>

    <figcaption>{{ name }}</figcaption>
  </figure>
</template>

<style scoped>

  .finance-island {
    width: min(170px, 48%);
    margin: -5px -7px 7px;
    outline: none;
    animation: island-bob 7s ease-in-out infinite;
    animation-delay: var(--island-delay);
  }
  .finance-island:focus-visible {
    outline: 3px solid var(--tag-coral);
    outline-offset: 4px;
  }
  .finance-island:nth-child(even) { margin-top: 45px; }
  .finance-island--compact { width: 33%; margin-inline: 0; }
  .finance-island svg {
    display: block;
    width: 100%;
    overflow: visible;
    filter: drop-shadow(0 9px 6px color-mix(in oklab, var(--ocean-deep) 19%, transparent));
  }
  .finance-island figcaption {
    width: fit-content;
    max-width: 90%;
    margin: -2px auto 0;
    padding: 4px 9px;
    overflow: hidden;
    border-radius: 999px;
    color: var(--label-ink);
    background: var(--label);
    box-shadow: 0 1px 0 color-mix(in oklab, var(--foreground) 12%, transparent);
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .island-waterline { fill: none; stroke-linejoin: bevel; }
  .island-waterline--outer { stroke: color-mix(in oklab, var(--reef) 72%, transparent); stroke-width: 7; opacity: .62; }
  .island-waterline--inner { stroke: color-mix(in oklab, var(--shore) 76%, transparent); stroke-width: 2; opacity: .76; }
  .island-sand { fill: color-mix(in oklab, var(--sand) 90%, var(--label)); stroke: color-mix(in oklab, var(--rock) 34%, var(--sand)); stroke-width: 1.4; stroke-linejoin: bevel; }
  .island-land { stroke: color-mix(in oklab, var(--rock) 25%, transparent); stroke-width: 1.1; stroke-linejoin: bevel; }
  .island-land--default { fill: color-mix(in oklab, var(--tint-default) 76%, var(--sand)); }
  .island-land--nu { fill: color-mix(in oklab, var(--tint-nu) 18%, var(--tint-default)); }
  .island-land--mercado-pago { fill: color-mix(in oklab, var(--tint-mercado-pago) 20%, var(--tint-default)); }
  .island-land--revolut { fill: color-mix(in oklab, var(--tint-revolut) 17%, var(--tint-default)); }
  .island-land--cetes { fill: color-mix(in oklab, var(--tint-cetes) 24%, var(--tint-default)); }
  .island-shore { fill: none; stroke: var(--shore); stroke-width: 1.8; stroke-linecap: round; opacity: .72; }
  .island-contour { fill: none; stroke: color-mix(in oklab, var(--rock) 43%, transparent); stroke-linecap: round; stroke-linejoin: round; }
  .island-contour--one { stroke-width: 1.15; opacity: .66; }
  .island-contour--two { stroke-width: 1; opacity: .5; }
  .island-contour--three { stroke-width: .85; opacity: .4; }
  .island-hatch { fill: none; stroke: color-mix(in oklab, var(--rock) 34%, transparent); stroke-width: .8; stroke-linecap: round; opacity: .46; }
  .island-cliff { fill: var(--rock); opacity: .78; }
  .island-rock { fill: var(--rock); opacity: .66; }
  .island-pebble { fill: color-mix(in oklab, var(--rock) 68%, var(--sand)); opacity: .72; }
  .island-palm { fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: .86; }

  .palm-shadow { stroke: color-mix(in oklab, var(--rock) 28%, transparent); stroke-width: 3; opacity: .5; }
  .palm-trunk { stroke: color-mix(in oklab, var(--rock) 88%, var(--label-ink)); stroke-width: 2.6; }
  .palm-trunk-detail { stroke: color-mix(in oklab, var(--sand) 52%, var(--rock)); stroke-width: .8; }
  .palm-frond { stroke: color-mix(in oklab, var(--label-ink) 68%, var(--tint-default)); stroke-width: 2.1; }
  .palm-leaflets { stroke: color-mix(in oklab, var(--label-ink) 50%, var(--tint-default)); stroke-width: .8; opacity: .8; }
  .palm-crown { fill: var(--rock); stroke: none; }

  @keyframes island-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @media (max-width: 760px) {
    .finance-island { width: min(150px, 45%); }
    .finance-island--compact { width: 30%; }
    .finance-island:nth-child(even) { margin-top: 28px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .finance-island { animation: none; }
  }
</style>
