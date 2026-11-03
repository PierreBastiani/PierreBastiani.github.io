<script setup lang="ts">
import { ref } from 'vue'
import { ridgeLine, ridgePath, ridgeY, type RidgeOptions } from '@/lib/ridge'
import { VAR_PLAIN, cityBlocks, cloud, coastPath, shoreLights, village, windows } from '@/lib/scene'
import { useParallax } from '@/composables/useParallax'
import HeroLayer from './hero/HeroLayer.vue'
import SummitSetup from './hero/SummitSetup.vue'
import DeskFigureLink from './hero/DeskFigureLink.vue'

// The view south from the Baou de Saint-Jeannet late in the day. Left is east: the Var plain
// running down to Nice and the airport. Ahead: hills stepping down to the sea at Cagnes.
// Right is west: Vence, Saint-Paul, La Colle, Antibes and its cap, the Estérel on the horizon.
// Scene units and the phone-safe zone are described in lib/scene.ts.

const clouds = [
  cloud(3, 446, 920, 1180, 10, 22),
  cloud(5, 486, 1680, 2060, 12, 24),
  cloud(9, 470, -640, -400, 10, 18),
  cloud(12, 500, 300, 470, 7, 12),
]

const coast = { land: coastPath(600), blocks: cityBlocks(41), lights: shoreLights(43) }

// Three planes of hills, heights exaggerated. The far one (the Nice side on the left, the hills
// behind Cagnes and Antibes on the right) stays below the shore towns. The Var valley floor shows
// only through a notch in the mid plane near the coast.
const far: RidgeOptions = {
  seed: 5,
  base: 574,
  amp: 8,
  scale: 0.006,
  bumps: [
    { x: -1150, height: 70, width: 180 },
    { x: -420, height: 16, width: 220 },
    { x: 250, height: -42, width: 40 }, // the Var
    { x: 1050, height: 16, width: 150 },
    { x: 1950, height: 50, width: 340 },
    { x: 2620, height: 30, width: 300 },
  ],
}
// The mid plane: the hills east of the Var, the Var notch, La Gaude, the Cagnes valley,
// Saint-Paul on its spur, La Colle lower down, then the long rise toward Vence.
const mid: RidgeOptions = {
  seed: 13,
  base: 642,
  amp: 12,
  scale: 0.005,
  bumps: [
    { x: -560, height: 56, width: 240 },
    { x: -120, height: 34, width: 130 },
    { x: 245, height: -64, width: 64 }, // the Var
    { x: 520, height: 92, width: 115 }, // La Gaude
    { x: 780, height: -36, width: 80 },
    { x: 1090, height: 84, width: 80 }, // Saint-Paul
    { x: 1200, height: -12, width: 50 },
    { x: 1300, height: 44, width: 60 }, // La Colle
    { x: 1820, height: 60, width: 260 },
    { x: 2500, height: 76, width: 300 },
  ],
}
// The near plane: hills east of the Var, the end of the La Gaude ridge, Saint-Jeannet's shoulder
// under the cliff, Vence.
const near: RidgeOptions = {
  seed: 29,
  base: 802,
  amp: 14,
  scale: 0.005,
  bumps: [
    { x: -420, height: 96, width: 260 },
    { x: 20, height: 40, width: 110 },
    { x: 170, height: -34, width: 70 },
    { x: 380, height: 116, width: 120 },
    { x: 480, height: -18, width: 50 },
    { x: 600, height: 56, width: 90 }, // Saint-Jeannet
    { x: 1650, height: 104, width: 170 }, // Vence
    { x: 2300, height: 80, width: 250 },
  ],
}
// The foreground: a low edge of rock and scrub in the band's colour, so the scene runs into the
// intro band below instead of stopping on a straight line.
const front: RidgeOptions = {
  seed: 37,
  base: 966, // stays well above any lift the pointer gives the layers behind it
  amp: 4,
  scale: 0.008,
  bumps: [
    { x: -300, height: 52, width: 260 },
    { x: 300, height: 40, width: 120 },
    { x: 640, height: 20, width: 60 },
    { x: 1190, height: 34, width: 90 },
    { x: 1720, height: 48, width: 210 },
  ],
}
const hills = { far: ridgePath(far), mid: ridgePath(mid), near: ridgePath(near), front: ridgePath(front) }

// Faint strata in the band, like the bedding of the limestone under the summit. Static.
const strata = Array.from({ length: 10 }, (_, i) =>
  ridgeLine({ seed: 80 + i, base: 18 + i * 36, amp: 7 + i * 0.5, scale: 0.0035, octaves: 2, x0: -240, x1: 1840, step: 20 }),
)

// Villages sit on the hill tops, a little below the line so they read as built into the slope.
const at = (o: RidgeOptions, x: number): [number, number] => [x, ridgeY(o, x) + 3]
const [gx, gy] = at(mid, 520)
const [px, py] = at(mid, 1090)
const [cx, cy] = at(mid, 1300)
const [vx, vy] = at(near, 1650)
const [jx, jy] = at(near, 590)
const towns = {
  laGaude: village(21, gx, gy, 22, 8, 9),
  saintPaul: village(23, px, py, 18, 11, 8),
  laColle: village(25, cx, cy, 14, 6, 7),
}
const vence = village(27, vx, vy, 42, 14, 10)
const saintJeannet = village(31, jx, jy, 42, 12, 12)
const dusk = {
  mid: [...windows(towns.laGaude.houses, 2, 41), ...windows(towns.saintPaul.houses, 2, 42), ...windows(towns.laColle.houses, 2, 43)],
  near: [...windows(vence.houses, 2, 44), ...windows(saintJeannet.houses, 2, 45)],
}

// noTranslate: the title is a name, which browser translation would garble.
const props = defineProps<{ title: string[]; noTranslate?: boolean }>()

const scene = ref<HTMLElement | null>(null)
const cardOpen = ref(false) // the summit figure's card holds the pointer parallax while open
useParallax(scene, cardOpen)
</script>

<template>
  <section id="top" class="hero" aria-labelledby="hero-title">
    <div ref="scene" class="scene">
      <!-- sky and sun -->
      <HeroLayer :y0="-400" :h="940" :depth="0">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="-400" x2="0" y2="520" gradientUnits="userSpaceOnUse">
            <stop offset="0" style="stop-color: var(--sky-top)" />
            <stop offset="0.8" style="stop-color: var(--sky-mid)" />
            <stop offset="1" style="stop-color: var(--sky-low)" />
          </linearGradient>
          <radialGradient
            id="hero-sun-glow"
            cx="1560"
            cy="490"
            r="420"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(1560 490) scale(1.8 1) translate(-1560 -490)"
          >
            <stop offset="0" style="stop-color: var(--sun); stop-opacity: 0.7" />
            <stop offset="0.4" style="stop-color: var(--sun); stop-opacity: 0.18" />
            <stop offset="1" style="stop-color: var(--sun); stop-opacity: 0" />
          </radialGradient>
        </defs>
        <rect x="-1300" y="-400" width="4200" height="940" fill="url(#hero-sky)" />
        <rect x="-1300" y="-400" width="4200" height="940" fill="url(#hero-sun-glow)" />
        <circle class="sun" cx="1560" cy="472" r="24" fill="var(--sun)" />
      </HeroLayer>

      <!-- a few flat clouds -->
      <HeroLayer :y0="400" :h="120" :depth="0.05">
        <path v-for="(d, i) in clouds" :key="i" :d="d" fill="var(--cloud)" />
      </HeroLayer>

      <!-- the sea, Cap Ferrat to the east, the Estérel to the west -->
      <HeroLayer :y0="490" :h="90" :depth="0.1">
        <defs>
          <linearGradient id="hero-sea" x1="0" y1="520" x2="0" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" style="stop-color: var(--sea-haze)" />
            <stop offset="1" style="stop-color: var(--sea-band)" />
          </linearGradient>
        </defs>
        <rect x="-1300" y="519" width="4200" height="61" fill="url(#hero-sea)" />
        <path d="M-1300 520 L-1300 500 L-1200 504 L-1110 498 L-1040 510 L-1000 516 L-960 522 L-900 526 L-880 530 L-940 530 L-1020 524 Z" fill="var(--esterel)" />
        <path
          d="M1600 520 L1650 513 L1720 509 L1790 512 L1860 505 L1950 510 L2060 506 L2200 513 L2360 509 L2560 515 L2900 517 L2900 520 Z"
          fill="var(--esterel)"
        />
        <g fill="var(--sun)" opacity="0.7">
          <rect x="1530" y="523" width="56" height="1.5" />
          <rect x="1542" y="528" width="34" height="1.5" />
        </g>
      </HeroLayer>

      <!-- the shore: Nice, the airport, Saint-Laurent, Cagnes and its castle hill, Antibes -->
      <HeroLayer :y0="515" :h="85" :depth="0.16">
        <path :d="coast.land" fill="var(--coast)" />
        <path d="M712 556 C724 546 736 543 748 546 C758 548 766 552 772 556 Z" fill="var(--coast)" />
        <rect v-for="(b, i) in coast.blocks" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" fill="var(--city)" />
        <rect x="738" y="536" width="5" height="9" fill="var(--city)" />
        <g class="lights">
          <circle v-for="(d, i) in coast.lights" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
      </HeroLayer>

      <!-- the Var valley floor, seen through the notch near the coast -->
      <HeroLayer :y0="545" :h="165" :depth="0.2">
        <path :d="VAR_PLAIN" fill="var(--plain)" />
        <g class="labels">
          <path d="M250 590 V568" /><text x="250" y="562">Var</text>
        </g>
      </HeroLayer>

      <!-- far hills: the Nice side on the left, the hills behind Cagnes and Antibes -->
      <HeroLayer :y0="470" :h="530" :depth="0.22">
        <defs>
          <linearGradient id="hero-hill-far" x1="0" y1="540" x2="0" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0" style="stop-color: var(--hill-far)" />
            <stop offset="1" style="stop-color: var(--haze)" />
          </linearGradient>
          <linearGradient id="hero-hill-mid" x1="0" y1="550" x2="0" y2="860" gradientUnits="userSpaceOnUse">
            <stop offset="0" style="stop-color: var(--hill-mid)" />
            <stop offset="1" style="stop-color: var(--haze)" />
          </linearGradient>
          <linearGradient id="hero-hill-near" x1="0" y1="690" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0" style="stop-color: var(--hill-near)" />
            <stop offset="1" style="stop-color: var(--hill-far)" />
          </linearGradient>
        </defs>
        <path :d="hills.far" fill="url(#hero-hill-far)" />
        <g class="labels">
          <path d="M-160 549 V506" /><text x="-160" y="500">Nice</text>
          <path d="M1400 540 V506" /><text x="1400" y="500">Antibes</text>
        </g>
      </HeroLayer>

      <!-- mid hills: La Gaude, Saint-Paul, La Colle -->
      <HeroLayer :y0="470" :h="530" :depth="0.4">
        <path :d="hills.mid" fill="url(#hero-hill-mid)" />
        <g v-for="(v, name) in towns" :key="name">
          <g v-for="(h, i) in v.houses" :key="i">
            <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" fill="var(--villa)" />
            <rect :x="h.x - 0.5" :y="h.y - h.h * 0.35" :width="h.w + 1" :height="h.h * 0.4" fill="var(--roof)" />
          </g>
        </g>
        <rect :x="towns.saintPaul.tower.x" :y="towns.saintPaul.tower.y" :width="towns.saintPaul.tower.w" :height="towns.saintPaul.tower.h" fill="var(--villa)" />
        <rect :x="px - 22" :y="py + 12" width="44" height="6" fill="var(--villa)" />
        <g class="lights">
          <circle v-for="(d, i) in dusk.mid" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
        <g class="labels">
          <path :d="`M${gx} ${gy - 12} V${gy - 40}`" /><text :x="gx" :y="gy - 46">La Gaude</text>
          <path :d="`M${px} ${py - 16} V${py - 40}`" /><text :x="px" :y="py - 46">Saint-Paul</text>
        </g>
      </HeroLayer>

      <!-- near hills: Saint-Jeannet under the cliff, Vence to the west -->
      <HeroLayer :y0="640" :h="360" :depth="0.55">
        <path :d="hills.near" fill="url(#hero-hill-near)" />
        <g v-for="(h, i) in [...saintJeannet.houses, ...vence.houses]" :key="i">
          <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" fill="var(--villa)" />
          <rect :x="h.x - 0.5" :y="h.y - h.h * 0.35" :width="h.w + 1" :height="h.h * 0.4" fill="var(--roof)" />
        </g>
        <rect :x="saintJeannet.tower.x" :y="saintJeannet.tower.y" :width="saintJeannet.tower.w" :height="saintJeannet.tower.h" fill="var(--villa)" />
        <rect :x="vence.tower.x" :y="vence.tower.y" :width="vence.tower.w" :height="vence.tower.h" fill="var(--villa)" />
        <g class="lights">
          <circle v-for="(d, i) in dusk.near" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
        <g class="labels">
          <path :d="`M${jx} ${jy - 16} V${jy - 40}`" /><text :x="jx" :y="jy - 46">Saint-Jeannet</text>
          <path :d="`M${vx} ${vy - 20} V${vy - 46}`" /><text :x="vx" :y="vy - 52">Vence</text>
        </g>
      </HeroLayer>

      <!-- the summit and the desk -->
      <HeroLayer :y0="620" :h="380" :depth="0.85">
        <SummitSetup />
      </HeroLayer>

      <!-- foreground: the edge of the band below -->
      <HeroLayer :y0="860" :h="140" :depth="1" still>
        <path :d="hills.front" fill="var(--ground)" />
      </HeroLayer>

      <DeskFigureLink v-model:open="cardOpen" />

      <div class="title" style="--depth: 0.6">
        <div class="wrap">
          <h1 id="hero-title" :translate="props.noTranslate ? 'no' : undefined">
            <span v-for="(line, i) in props.title" :key="line" :class="{ indent: i > 0 }">{{ line }}</span>
          </h1>
        </div>
      </div>
    </div>

    <div class="intro on-ground">
      <svg class="strata" viewBox="0 0 1600 360" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
        <path v-for="(d, i) in strata" :key="i" :d="d" />
      </svg>
      <div class="wrap inner">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.scene {
  position: relative;
  height: clamp(24rem, 68svh, 44rem);
  overflow: hidden;
  isolation: isolate;
  container-type: size; /* lets the figure link use cqh: one scene unit = 0.1cqh */
  background: var(--ground);
  --scroll: 0;
  --px: 0;
  --py: 0;
}
.sun {
  transform: translateY(var(--sun-drop));
}
.lights {
  fill: var(--lights);
  opacity: var(--lights-opacity);
}
/* A table d'orientation: place names show while the pointer is over the view, desktop only. */
.labels {
  opacity: 0;
  transition: opacity var(--dur-fade) var(--ease);
  fill: var(--label);
  stroke: var(--label);
  stroke-width: 1;
  font: 500 15px var(--f-mono);
  letter-spacing: 0.04em;
  text-anchor: middle;
}
.labels text {
  stroke: none;
}
.scene:hover .labels {
  opacity: 1;
}
@media (hover: none) {
  .labels {
    display: none;
  }
}
.title {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  /* capped by the scene height so the name always sits on the sky, above the horizon at 52% */
  padding-top: clamp(2.5rem, 9svh, 6rem);
  pointer-events: none;
  transform: translate3d(
    calc(var(--px) * var(--depth) * -18px),
    calc(var(--scroll) * (1 - var(--depth)) * 150px + var(--py) * var(--depth) * -6px),
    0
  );
}
/* same column as the content below: .wrap gives the max-width and the gutters */
.title h1 {
  font-size: min(var(--step-4), 12svh);
  font-weight: 800;
  line-height: 0.86;
  letter-spacing: -0.035em;
  color: var(--ink);
  pointer-events: auto;
}
.title h1 span {
  display: block;
}
.title h1 .indent {
  padding-left: 0.5em;
}
.intro {
  position: relative;
  /* overlap the scene by a few px, same colour, so rounding at any zoom can't open a seam */
  margin-top: -4px;
  padding-top: 4px;
  background: var(--ground);
  color: var(--on-ground);
}
.strata {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.strata path {
  fill: none;
  stroke: none;
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
@supports (stroke: color-mix(in srgb, red 50%, blue)) {
  .strata path {
    stroke: color-mix(in srgb, var(--on-ground) 8%, var(--ground));
  }
}
.inner {
  position: relative;
  display: grid;
  gap: 0.9rem;
  padding-block: 1.8rem 3.5rem;
}
@media (prefers-reduced-motion: reduce) {
  .title {
    transform: none;
  }
  .labels {
    transition: none;
  }
}
</style>
