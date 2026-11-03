<script setup lang="ts">
import { ridgeFacets, ridgeLine, type RidgeOptions } from '@/lib/ridge'
// Small illustrations for the project cards, drawn in three layers like the hero.
// On hover or keyboard focus of the card, the layers lift apart a little (see ProjectGrid).
export type ArtKind = 'homelab' | 'smarket' | 'gree' | 'site'
defineProps<{ kind: ArtKind }>()

// homelab, smarket and gree-smartir are guidebook ink: one pen in three weights, porphyry as
// the only spot colour, laid a little off the line. The site card is the hero's poster.
const tooth = Array.from({ length: 26 }, (_, i) => `l5 ${i % 2 ? -7 : 7}`).join(' ') // torn receipt edge
const pulses = 'M138 166 h10 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h14 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h10'

// the site itself: the hero as a small PLM poster, lettering band and all
const card = (seed: number, base: number, amp: number, bumps: { x: number; height: number; width: number }[]): RidgeOptions => ({
  seed,
  base,
  amp,
  scale: 0.012,
  octaves: 2,
  bumps,
  x0: -20,
  x1: 420,
  step: 6,
})
const siteFar = card(5, 150, 4, [{ x: 70, height: 18, width: 60 }, { x: 330, height: 10, width: 70 }])
const siteMid = card(13, 172, 6, [{ x: 150, height: 30, width: 40 }, { x: 250, height: 22, width: 36 }])
const siteNear = card(29, 204, 6, [{ x: 40, height: 34, width: 60 }, { x: 360, height: 26, width: 50 }])
const close = (o: RidgeOptions) => `${ridgeLine(o)} L420 260 L-20 260 Z`
const site = {
  far: close(siteFar),
  farShade: ridgeFacets(siteFar, { minProm: 6, smooth: 14, depth: 2 }),
  mid: close(siteMid),
  midShade: ridgeFacets(siteMid, { minProm: 6, smooth: 12, depth: 2 }),
  near: close(siteNear),
  nearShade: ridgeFacets(siteNear, { minProm: 6, smooth: 12, depth: 2 }),
}
</script>

<template>
  <div class="art print" :class="kind" aria-hidden="true">
    <div class="stage">
      <!-- back layer -->
      <svg class="layer l0" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <path d="M0 206 H400" class="ink-line" />
          <path d="M40 170 L64 154 H214 L190 170 Z M190 170 L214 154 V188 L190 204 Z" class="paper ink-line" />
          <path d="M40 170 H190 V204 H40 Z" class="paper ink-heavy" />
          <path d="M70 154 V106 M180 154 V110" class="ink-line" />
          <path d="M58 185 h4 v4 h-4 Z M68 185 h4 v4 h-4 Z M78 185 h4 v4 h-4 Z M88 185 h4 v4 h-4 Z M132 180 H176 M132 186 H176 M132 192 H176" class="ink-hair" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <g transform="rotate(-4 135 120)">
            <path :d="`M70 30 H200 V214 ${tooth.replace(/l5/g, 'l-5')} Z`" class="paper ink-heavy" />
            <path d="M100 46 H170" class="ink-line" />
            <path v-for="i in 8" :key="i" :d="`M84 ${62 + i * 15} H${120 + ((i * 17) % 34)}`" class="ink-hair" />
            <path v-for="i in 8" :key="'p' + i" :d="`M168 ${62 + i * 15} H188`" class="ink-line" />
            <path d="M84 196 H188" class="ink-heavy" />
          </g>
        </template>
        <template v-else-if="kind === 'gree'">
          <path d="M0 208 H400" class="ink-hair" />
          <path d="M326 22 H410 V150 H326 Z" class="ink-line" />
          <path d="M368 22 V150 M326 86 H410" class="ink-hair" />
        </template>
        <template v-else>
          <rect x="0" y="0" width="400" height="250" class="sky" />
          <rect x="0" y="112" width="400" height="22" class="sky-low" />
          <circle cx="306" cy="118" r="22" class="sun halo" />
          <circle cx="306" cy="118" r="13" class="sun" />
          <rect x="0" y="130" width="400" height="30" class="sea" />
          <path d="M318 130 L340 125 L372 127 L400 123 L400 130 Z" class="far" />
          <rect x="290" y="134" width="32" height="1.6" class="sun" />
          <rect x="298" y="138" width="16" height="1.6" class="sun" />
        </template>
      </svg>

      <!-- middle layer -->
      <svg class="layer l1" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <!-- the Mac mini on the router -->
          <path d="M84 138 L104 125 H198 L178 138 Z M178 138 L198 125 V147 L178 160 Z" class="paper ink-line" />
          <path d="M84 138 H178 V160 H84 Z" class="paper ink-heavy" />
          <path d="M97 153 H119" class="ink-hair" />
          <path d="M163.5 149.5 h5 v5 h-5 Z" class="spot" />
          <path d="M162 148 h5 v5 h-5 Z" class="ink-hair" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <!-- the shelf edge with its price tags -->
          <path d="M214 150 H400" class="ink-heavy" />
          <path d="M214 160 H400" class="ink-hair" />
          <path d="M228 160 H266 V182 H228 Z M296 160 H334 V182 H296 Z M364 160 H402 V182 H364 Z" class="paper ink-hair" />
          <path d="M234 168 H252 M234 175 H260 M302 168 H320 M302 175 H328 M370 168 H388" class="ink-hair" />
        </template>
        <template v-else-if="kind === 'gree'">
          <!-- the split unit: casing, vent line, louvre, the display -->
          <path d="M60 50 H290 V112 H60 Z" class="paper ink-heavy" />
          <path d="M60 96 H290" class="ink-line" />
          <path d="M80 112 L76 122 H274 L270 112" class="ink-line" />
          <path d="M243.5 64.5 h28 v10 h-28 Z" class="spot" />
          <path d="M242 63 h28 v10 h-28 Z M76 66 H110" class="ink-hair" />
        </template>
        <template v-else>
          <path :d="site.far" class="far" />
          <path :d="site.farShade" class="far-shade" />
          <path :d="site.mid" class="mid" />
          <path :d="site.midShade" class="mid-shade" />
        </template>
      </svg>

      <!-- front layer -->
      <svg class="layer l2" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <!-- the Raspberry Pi in its case, its cable running off the edge -->
          <path d="M250 176 L266 166 H346 L330 176 Z M330 176 L346 166 V194 L330 204 Z" class="paper ink-line" />
          <path d="M250 176 H330 V204 H250 Z" class="paper ink-heavy" />
          <path d="M262 171 H322" class="ink-hair dotted" />
          <path d="M261.5 187.5 h6 v6 h-6 Z" class="spot" />
          <path d="M260 186 h6 v6 h-6 Z M276 190 H316" class="ink-hair" />
          <path d="M338 190 C368 198 380 226 410 234 M250 196 C226 206 214 204 190 198" class="ink-line" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <!-- the price that went down: a tag with the old price struck out -->
          <path d="M240 34 C256 54 268 76 283 99" class="ink-hair" />
          <path d="M272.5 82.5 L284.5 70.5 H352.5 V132.5 H284.5 L272.5 120.5 Z" class="spot" />
          <path d="M270 80 L282 68 H350 V130 H282 L270 118 Z" class="ink-heavy" />
          <circle cx="283" cy="99" r="3.2" class="paper ink-hair" />
          <path d="M298 88 H336" class="ink-hair" />
          <path d="M296 94 L338 84" class="ink-line" />
          <path d="M298 112 H330" class="ink-heavy" />
        </template>
        <template v-else-if="kind === 'gree'">
          <!-- the remote, and the IR frame it sends as the pulses the generator decodes -->
          <g transform="rotate(-14 111 204)">
            <path d="M96 176 H126 V234 H96 Z" class="paper ink-heavy" />
            <path d="M101 190 h8 v6 h-8 Z M113 190 h8 v6 h-8 Z M101 200 h8 v6 h-8 Z M113 200 h8 v6 h-8 Z M104 214 H118" class="ink-hair" />
            <path d="M108.5 179.5 h7 v5 h-7 Z" class="spot" />
            <path d="M107 178 h7 v5 h-7 Z" class="ink-hair" />
          </g>
          <path d="M118 170 L138 162" class="ink-hair dashed" />
          <path :d="pulses" class="ink-line" />
        </template>
        <template v-else>
          <path :d="site.near" class="near" />
          <path :d="site.nearShade" class="near-shade" />
          <path d="M214 214 L232 186 L246 178 L300 174 L318 182 L352 192 L384 214 Z" class="rock" />
          <path d="M214 214 L232 186 L246 178 L250 200 L242 214 Z" class="rock-shade" />
          <path d="M246 178 L300 174 L302 177 L248 181 Z" class="rock-lit" />
          <!-- the desk, the screen and the figure in its beanie -->
          <rect x="272" y="166" width="16" height="10" class="figure" />
          <rect x="273.5" y="167.5" width="13" height="7" class="screen" />
          <path d="M254 176 C253 168 255 162 259 161 C263 160 265 164 265 170 L264 176 Z" class="figure" />
          <path d="M256 157 C256 152 263 151 263 156 Z" class="beanie" />
          <circle cx="259.5" cy="158.5" r="3.6" class="figure" />
          <path d="M256.2 156.6 C256 151.6 263 151 262.8 156 Z" class="beanie" />
          <!-- the lettering band -->
          <rect x="0" y="214" width="400" height="36" class="band" />
          <text x="200" y="238" class="lettering">PIERRE.KENSAE.COM</text>
        </template>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.art {
  position: relative;
  aspect-ratio: 8 / 5;
  overflow: hidden;
  perspective: 900px;
}
.stage {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform var(--dur-move) var(--ease);
}
.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: transform var(--dur-move) var(--ease);
}

/* guidebook ink: the pen is the text colour, porphyry the one spot */
.art:not(.site) {
  background: var(--surface);
  border: 1px solid var(--line);
}
.art:not(.site) svg {
  stroke: var(--ink);
}
.paper { fill: var(--surface); }
.spot { fill: var(--accent); stroke: none; }
.dashed { stroke-dasharray: 3 3; }
.dotted { stroke-dasharray: 1.5 3; }

/* the site card: the hero's scene tokens, so it follows the theme like the hero */
.site { background: var(--sky-top); }
.site .sky { fill: var(--sky-top); }
.site .sky-low { fill: var(--sky-low); }
.site .sun { fill: var(--sun); }
.site .halo { opacity: 0.35; }
.site .sea { fill: var(--sea-fill); }
.site .far { fill: var(--hill-far); }
.site .far-shade { fill: var(--hill-far-shade); }
.site .mid { fill: var(--hill-mid); }
.site .mid-shade { fill: var(--hill-mid-shade); }
.site .near { fill: var(--hill-near); }
.site .near-shade { fill: var(--hill-near-shade); }
.site .rock { fill: var(--rock); }
.site .rock-shade { fill: var(--rock-shade); }
.site .rock-lit { fill: var(--rock-lit); }
.site .figure { fill: var(--figure); }
.site .screen { fill: var(--screen); }
.site .beanie { fill: var(--accent); }
.site .band { fill: var(--ground); }
.site .lettering {
  fill: var(--on-ground);
  font: 800 17px var(--f-display);
  letter-spacing: 0.22em;
  text-anchor: middle;
}
</style>
