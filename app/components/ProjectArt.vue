<script setup lang="ts">
import { box } from '@/lib/box'
import { ridgeFacets, ridgeLine, type RidgeOptions } from '@/lib/ridge'
// Small illustrations for the project cards, drawn in three layers like the hero.
// On hover or keyboard focus of the card, the layers lift apart a little (see ProjectGrid).
export type ArtKind = 'homelab' | 'smarket' | 'gree' | 'site'
defineProps<{ kind: ArtKind; label: string; sub?: string }>()

// All four are printed vignettes from the hero's inks: a sky flat, the sea strip, a ground flat,
// objects as lit / face / lilac-shadow planes with one contour, porphyry as the one spot, grain
// on top, and the poster's lettering band under the picture.

// homelab: the router, the Mac mini on it, the Raspberry Pi beside them (the porphyry box)
const router = box(64, 170, 150, 30, 22, -15, 40)
const mini = box(92, 146, 96, 16, 16, -11)
const pi = box(256, 186, 66, 22, 16, -11, 28)

// smarket: the receipt standing on the stall, the shelf edge with its tags
const tooth = Array.from({ length: 22 }, (_, i) => `l5 ${i % 2 ? -6 : 6}`).join(' ')
const receipt = `M72 34 H182 V212 ${tooth.replace(/l5/g, 'l-5')} Z`
const shelf = box(206, 150, 210, 12, 0, -14)

// gree-smartir: the split unit on the wall, its shadow, the remote, the IR frame
const pulses = 'M138 166 h10 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h14 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h10'

// the site itself: the hero as a small PLM poster
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
const siteMid = card(13, 176, 6, [{ x: 150, height: 30, width: 40 }, { x: 250, height: 22, width: 36 }])
const siteNear = card(29, 212, 6, [{ x: 40, height: 34, width: 60 }, { x: 360, height: 26, width: 50 }])
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
    <div class="win">
      <div class="stage">
        <!-- back layer: the sky, the sea strip and the ground every vignette stands on -->
        <svg class="layer l0" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          <template v-if="kind === 'gree'">
            <rect x="0" y="0" width="400" height="250" class="wall" />
            <!-- the window: the same sky and sea as the other cards -->
            <rect x="318" y="26" width="70" height="138" class="sky" />
            <rect x="318" y="104" width="70" height="14" class="sea" />
            <rect x="318" y="118" width="70" height="4" class="shore" />
            <rect x="318" y="122" width="70" height="42" class="ground" />
            <path d="M318 104 L334 97 L352 99 L366 104 Z" class="far" />
            <path d="M318 26 H388 V164 H318 Z M353 26 V164 M318 98 H388" class="ink-line" />
            <rect x="0" y="212" width="400" height="38" class="ground" />
            <path d="M0 212 H400" class="ink-line" />
          </template>
          <template v-else-if="kind !== 'site'">
            <rect x="0" y="0" width="400" height="250" class="sky" />
            <rect x="0" y="92" width="400" height="16" class="sea" />
            <rect x="0" y="108" width="400" height="4" class="shore" />
            <path d="M262 92 L290 84 L316 86 L344 78 L378 84 L400 82 V92 Z" class="far" />
            <rect x="0" y="112" width="400" height="138" class="ground" />
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
        <svg class="layer l1" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          <template v-if="kind === 'homelab'">
            <!-- the router, two antennas, the Mac mini on top -->
            <path :d="router.cast" class="cast" />
            <path d="M88 156 V100 M190 156 V104" class="ink-heavy" />
            <path :d="router.front" class="face" />
            <path :d="router.top" class="lit" />
            <path :d="router.side" class="shade" />
            <path d="M80 185 h5 v5 h-5 Z M92 185 h5 v5 h-5 Z M104 185 h5 v5 h-5 Z M150 180 H200 M150 186 H200 M150 192 H200" class="ink-hair" />
            <path :d="router.outline" class="ink-line" />
            <path :d="mini.front" class="face" />
            <path :d="mini.top" class="lit" />
            <path :d="mini.side" class="shade" />
            <path d="M104 155 H128" class="ink-hair" />
            <path :d="mini.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'smarket'">
            <!-- the shelf edge, its paper tags -->
            <path d="M206 162 H400 V176 H206 Z" class="cast" />
            <path :d="shelf.front" class="face" />
            <path :d="shelf.top" class="lit" />
            <path d="M206 136 H416 V162 H206 Z" class="ink-line" />
            <path d="M226 162 H262 V184 H226 Z M292 162 H328 V184 H292 Z M358 162 H394 V184 H358 Z" class="lit" />
            <path d="M226 162 H262 V184 H226 Z M292 162 H328 V184 H292 Z M358 162 H394 V184 H358 Z" class="ink-line" />
            <path d="M232 170 H250 M232 177 H256 M298 170 H316 M298 177 H322 M364 170 H382" class="ink-hair" />
          </template>
          <template v-else-if="kind === 'gree'">
            <!-- the split unit: its shadow on the wall, the underside in shade, the display -->
            <path d="M290 62 H304 V128 L294 136 H82 L74 128 Z" class="cast" />
            <path d="M60 50 H290 V112 H60 Z" class="lit" />
            <path d="M60 96 H290" class="ink-hair" />
            <path d="M60 112 H290 L282 124 H68 Z" class="shade" />
            <path d="M78 118 H272" class="ink-line" />
            <path d="M60 50 H290 V112 L282 124 H68 L60 112 Z" class="ink-line" />
            <path d="M242 64 h28 v10 h-28 Z" class="spot" />
            <path d="M76 66 H110" class="ink-hair" />
          </template>
          <template v-else>
            <path :d="site.far" class="far" />
            <path :d="site.farShade" class="far-shade" />
            <path :d="site.mid" class="mid" />
            <path :d="site.midShade" class="mid-shade" />
          </template>
        </svg>

        <!-- front layer -->
        <svg class="layer l2" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          <template v-if="kind === 'homelab'">
            <!-- the cable, then the Raspberry Pi in its porphyry case, the one spot -->
            <path d="M236 182 C246 196 244 204 258 204 M338 192 C360 196 372 222 404 230" class="ink-line" />
            <path :d="pi.cast" class="cast" />
            <path :d="pi.front" class="spot" />
            <path :d="pi.top" class="spot-lit" />
            <path :d="pi.side" class="spot-shade" />
            <path d="M266 196 h6 v6 h-6 Z M280 199 H312" class="ink-hair" />
            <path :d="pi.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'smarket'">
            <g transform="rotate(-4 127 124)">
              <path d="M182 212 L190 208 H246 L236 216 Z" class="cast" />
              <path :d="receipt" class="lit" />
              <path d="M182 34 L190 40 V208 L182 212 Z" class="shade" />
              <path :d="receipt" class="ink-line" />
              <path d="M100 52 H154" class="ink-line" />
              <path v-for="i in 7" :key="i" :d="`M86 ${62 + i * 15} H${118 + ((i * 17) % 30)}`" class="ink-hair" />
              <path v-for="i in 7" :key="'p' + i" :d="`M152 ${62 + i * 15} H170`" class="ink-hair" />
              <path d="M86 186 H170" class="ink-heavy" />
            </g>
            <!-- the price that went down: the porphyry tag, hung from the shelf -->
            <path d="M296 0 V26" class="ink-line" />
            <path d="M262 38 L274 26 H334 V82 H274 L262 70 Z" class="spot" />
            <path d="M334 26 L342 32 V86 L334 82 Z" class="spot-shade" />
            <path d="M262 38 L274 26 H334 L342 32 V86 L334 82 H274 L262 70 Z M334 26 V82" class="ink-line" />
            <path d="M286 42 H322" class="ink-hair" />
            <path d="M286 44 L324 36" class="ink-line" />
            <path d="M288 66 H318" class="ink-heavy" />
          </template>
          <template v-else-if="kind === 'gree'">
            <!-- the remote, and the IR frame it sends as the pulses the generator decodes -->
            <g transform="rotate(-14 111 204)">
              <path d="M96 178 H126 V236 H96 Z" class="dark" />
              <path d="M126 178 L132 174 V232 L126 236 Z" class="shade" />
              <path d="M102 192 h8 v6 h-8 Z M114 192 h8 v6 h-8 Z M102 202 h8 v6 h-8 Z M114 202 h8 v6 h-8 Z" class="lit" />
              <path d="M96 178 L102 174 H132 V232 L126 236 H96 Z" class="ink-line" />
            </g>
            <path :d="pulses" class="ink-heavy" />
          </template>
          <template v-else>
            <path :d="site.near" class="near" />
            <path :d="site.nearShade" class="near-shade" />
            <path d="M214 252 L232 196 L246 186 L300 182 L318 190 L352 202 L384 252 Z" class="rock" />
            <path d="M214 252 L232 196 L246 186 L250 214 L242 252 Z" class="rock-shade" />
            <path d="M246 186 L300 182 L302 185 L248 189 Z" class="rock-lit" />
            <!-- the desk, the screen and the figure in its beanie -->
            <rect x="272" y="174" width="16" height="10" class="figure" />
            <rect x="273.5" y="175.5" width="13" height="7" class="screen" />
            <path d="M254 184 C253 176 255 170 259 169 C263 168 265 172 265 178 L264 184 Z" class="figure" />
            <circle cx="259.5" cy="166.5" r="3.6" class="figure" />
            <path d="M256.2 164.6 C256 159.6 263 159 262.8 164 Z" class="beanie" />
          </template>
        </svg>
      </div>
    </div>
    <!-- the poster's lettering band: the project's name, its main tool -->
    <p class="band" translate="no">
      <span class="name">{{ label }}</span>
      <span v-if="sub" class="sub">{{ sub }}</span>
    </p>
  </div>
</template>

<style scoped>
/* A printed card: ink rule, a hair inner rule, the picture, then the lettering band. */
.art {
  /* the pen is the darkest ink in both themes; flats come from the hero's scene tokens */
  --pen: var(--ink-oxblood);
  display: grid;
  border: 1.5px solid var(--ink);
  padding: 4px;
  background: var(--surface);
}
.win {
  position: relative;
  aspect-ratio: 8 / 5;
  overflow: hidden;
  perspective: 900px;
  border: 1px solid var(--ink);
  border-bottom: 0;
  background: var(--sky-top);
}
.art.gree .win {
  background: var(--sky-low);
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
/* only the pen strokes; flats meet edge to edge, like the poster's */
.layer :is(.ink-heavy, .ink-line, .ink-hair) {
  stroke: var(--pen);
}
/* the grain sits on the picture and the band, the band's words above it */
.band {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.2rem 1rem;
  margin: 0;
  padding: 0.5rem 0.85rem;
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.75rem / 1.3 var(--f-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.band .name {
  font-weight: 650;
}
.band .sub {
  opacity: 0.8;
}

/* flats, all from the scene tokens so the dusk palette repaints them */
.sky { fill: var(--sky-top); }
.sea { fill: var(--sea-fill); }
.shore { fill: var(--sea-shore); }
.ground { fill: var(--plain); }
.far { fill: var(--esterel); }
.wall { fill: var(--sky-low); }
.lit { fill: var(--rock-lit); }
.face { fill: var(--rock); }
.shade { fill: var(--rock-shade); }
.cast { fill: var(--rock-shade); }
.dark { fill: var(--figure); }
.spot { fill: var(--ink-porphyry); }
.spot-lit { fill: color-mix(in srgb, var(--ink-porphyry) 55%, var(--ink-ochre)); }
.spot-shade { fill: color-mix(in srgb, var(--ink-porphyry) 55%, var(--ink-oxblood)); }
.lit,
.face,
.shade,
.cast,
.dark,
.spot,
.spot-lit,
.spot-shade {
  stroke: none;
}

/* the site card: the hero's scene tokens, so it follows the theme like the hero */
.site .sky-low { fill: var(--sky-low); }
.site .sun { fill: var(--sun); }
.site .halo { opacity: 0.35; }
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
</style>
