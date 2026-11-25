<script setup lang="ts">
import { useId } from 'vue'
import { box } from '@/lib/box'
import { screenOpen } from '@/lib/halftone'
import { ridgeFacets, ridgeLine, type RidgeOptions } from '@/lib/ridge'
// Small illustrations for the project cards, drawn in three layers like the hero.
// On hover or keyboard focus of the card, the layers lift apart a little (see ProjectGrid).
export type ArtKind = 'homelab' | 'smarket' | 'gree' | 'site' | 'talk' | 'paste'
defineProps<{ kind: ArtKind; label: string; sub?: string }>()

// The vignettes' one screened plate is the cast shadow of the three object cards: lilac dots
// overprinted on the ground they fall on, as a printer would lay a tint instead of a second
// flat. Tiles of 9 units: 7 px at 1280, 5 px on a phone, coarse enough to stay dots on a 2x
// screen. The site card has no cast
// shadow and no screen: at its size the hero's sky ramp read as a fade, so the hero keeps the
// site's only other screen.
const uid = useId()
const CAST_P = 9
const castDots = screenOpen(CAST_P, 0.2 * CAST_P)
const castFill = `url(#${uid}-cast)`

// All four are printed vignettes from the hero's inks: a sky flat, the sea strip, a ground flat,
// objects as lit / face / lilac-shadow planes with one contour, porphyry as the one spot, grain
// on top, and the catalogue band across the top of the picture.

// homelab: the router, the Mac mini on it, the Raspberry Pi beside them (the porphyry box)
const router = box(64, 170, 150, 30, 22, -15, 40)
const mini = box(92, 146, 96, 16, 16, -11)
const pi = box(256, 186, 66, 22, 16, -11, 28)

// smarket: the receipt standing on the stall, the shelf edge with its tags
const tooth = Array.from({ length: 22 }, (_, i) => `l5 ${i % 2 ? -6 : 6}`).join(' ')
const receipt = `M72 34 H182 V212 ${tooth.replace(/l5/g, 'l-5')} Z`
const shelf = box(206, 150, 210, 12, 0, -14)

// gree-smartir: the split unit on the wall, its shadow, the remote, the IR frame
const pulses =
  'M138 166 h10 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h5 v-12 h14 v12 h5 v-12 h5 v12 h14 v-12 h5 v12 h10'

// from-chat-to-agent: the projection screen with the harness on it (the added line in the spot,
// as the deck prints it in orange), the chat bubble in front, the agent's terminal beside it
const screen = box(118, 34, 180, 104, 10, -7)
const term = box(296, 178, 74, 40, 10, -7, 30)

// slack-paste: the clipboard standing on the ground (its clip the porphyry spot, the sheet with
// a # heading line and two bullets, the plugin's icon), and in front the chat bubble it pastes
// into, holding the table that survives
const board = box(92, 44, 118, 164, 10, -7, 44)

// the site itself: the hero as a small PLM poster
const card = (
  seed: number,
  base: number,
  amp: number,
  bumps: { x: number; height: number; width: number }[],
): RidgeOptions => ({
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
const siteFar = card(5, 150, 4, [
  { x: 70, height: 18, width: 60 },
  { x: 330, height: 10, width: 70 },
])
const siteMid = card(13, 176, 6, [
  { x: 150, height: 30, width: 40 },
  { x: 250, height: 22, width: 36 },
])
const siteNear = card(29, 212, 6, [
  { x: 40, height: 34, width: 60 },
  { x: 360, height: 26, width: 50 },
])
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
    <!-- the catalogue band across the top: the plate's code, its number -->
    <p class="band" translate="no">
      <span class="name">{{ label }}</span>
      <span v-if="sub" class="sub">{{ sub }}</span>
    </p>
    <div class="win">
      <div class="stage">
        <!-- back layer: the sky, the sea strip and the ground every vignette stands on -->
        <svg class="layer l0" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
          <defs v-if="kind !== 'site'">
            <pattern
              :id="`${uid}-cast`"
              patternUnits="userSpaceOnUse"
              :width="CAST_P"
              :height="CAST_P"
            >
              <circle
                v-for="(d, j) in castDots"
                :key="j"
                :cx="d.cx"
                :cy="d.cy"
                :r="d.r"
                class="cast-dot"
              />
            </pattern>
          </defs>
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
            <circle cx="306" cy="118" r="22" class="halo" />
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
            <path
              d="M80 185 h5 v5 h-5 Z M92 185 h5 v5 h-5 Z M104 185 h5 v5 h-5 Z M150 180 H200 M150 186 H200 M150 192 H200"
              class="ink-hair"
            />
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
            <path
              d="M226 162 H262 V184 H226 Z M292 162 H328 V184 H292 Z M358 162 H394 V184 H358 Z"
              class="lit"
            />
            <path
              d="M226 162 H262 V184 H226 Z M292 162 H328 V184 H292 Z M358 162 H394 V184 H358 Z"
              class="ink-line"
            />
            <path
              d="M232 170 H250 M232 177 H256 M298 170 H316 M298 177 H322 M364 170 H382"
              class="ink-hair"
            />
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
          <template v-else-if="kind === 'talk'">
            <!-- the stand's shadow, its tripod, then the screen and the code on it -->
            <path d="M210 226 L236 218 H300 L276 226 Z" class="cast" />
            <path d="M208 138 V226 M208 196 L180 228 M208 196 L236 228" class="ink-heavy" />
            <path :d="screen.front" class="lit" />
            <path :d="screen.top" class="face" />
            <path :d="screen.side" class="shade" />
            <path d="M132 50 H188 M132 64 H222 M144 76 H250 M144 88 H206" class="ink-hair" />
            <path d="M144 98 H262 V108 H144 Z" class="spot" />
            <path d="M144 120 H232 M132 130 H160" class="ink-hair" />
            <path :d="screen.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'paste'">
            <!-- the clipboard: its shadow, the board, the sheet, the clip and its ring -->
            <path :d="board.cast" class="cast" />
            <path :d="board.front" class="face" />
            <path :d="board.top" class="lit" />
            <path :d="board.side" class="shade" />
            <path d="M104 62 H198 V198 H104 Z" class="lit" />
            <path d="M104 62 H198 V198 H104 Z" class="ink-hair" />
            <path :d="board.outline" class="ink-line" />
            <path d="M132 34 H170 V58 H132 Z" class="spot" />
            <path d="M170 34 L176 30 V54 L170 58 Z" class="spot-shade" />
            <circle cx="151" cy="34" r="12" class="spot" />
            <circle cx="151" cy="34" r="4.5" class="lit" />
            <path d="M132 34 H139 A12 12 0 0 1 163 34 H170 V58 H132 Z" class="ink-line" />
            <!-- the sheet: # and its heading line, then two bullets -->
            <path
              d="M121 84 L116 112 M133 84 L128 112 M113 93 H138 M111 103 H136"
              class="ink-heavy"
            />
            <path d="M146 98 H186" class="ink-heavy" />
            <circle cx="120" cy="136" r="4" class="dark" />
            <path d="M132 136 H184" class="ink-heavy" />
            <circle cx="120" cy="160" r="4" class="dark" />
            <path d="M132 160 H168" class="ink-heavy" />
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
            <path
              d="M236 182 C246 196 244 204 258 204 M338 192 C360 196 372 222 404 230"
              class="ink-line"
            />
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
              <path
                v-for="i in 7"
                :key="i"
                :d="`M86 ${62 + i * 15} H${118 + ((i * 17) % 30)}`"
                class="ink-hair"
              />
              <path
                v-for="i in 7"
                :key="'p' + i"
                :d="`M152 ${62 + i * 15} H170`"
                class="ink-hair"
              />
              <path d="M86 186 H170" class="ink-heavy" />
            </g>
            <!-- the price that went down: the porphyry tag, hung from the shelf -->
            <path d="M296 0 V26" class="ink-line" />
            <path d="M262 38 L274 26 H334 V82 H274 L262 70 Z" class="spot" />
            <path d="M334 26 L342 32 V86 L334 82 Z" class="spot-shade" />
            <path
              d="M262 38 L274 26 H334 L342 32 V86 L334 82 H274 L262 70 Z M334 26 V82"
              class="ink-line"
            />
            <path d="M286 42 H322" class="ink-hair" />
            <path d="M286 44 L324 36" class="ink-line" />
            <path d="M288 66 H318" class="ink-heavy" />
          </template>
          <template v-else-if="kind === 'gree'">
            <!-- the remote, and the IR frame it sends as the pulses the generator decodes -->
            <g transform="rotate(-14 111 204)">
              <path d="M96 178 H126 V236 H96 Z" class="dark" />
              <path d="M126 178 L132 174 V232 L126 236 Z" class="shade" />
              <path
                d="M102 192 h8 v6 h-8 Z M114 192 h8 v6 h-8 Z M102 202 h8 v6 h-8 Z M114 202 h8 v6 h-8 Z"
                class="lit"
              />
              <path d="M96 178 L102 174 H132 V232 L126 236 H96 Z" class="ink-line" />
            </g>
            <path :d="pulses" class="ink-heavy" />
          </template>
          <template v-else-if="kind === 'talk'">
            <!-- the chat: a paper bubble, its tail down to the left -->
            <path d="M34 150 H134 V196 H72 L56 212 V196 H34 Z" class="lit" />
            <path d="M48 164 H118 M48 176 H100" class="ink-hair" />
            <path d="M34 150 H134 V196 H72 L56 212 V196 H34 Z" class="ink-line" />
            <!-- the agent: a terminal on the ground, prompt and cursor in the paper ink -->
            <path :d="term.cast" class="cast" />
            <path :d="term.front" class="dark" />
            <path :d="term.top" class="face" />
            <path :d="term.side" class="shade" />
            <path d="M306 188 L314 193 L306 198 Z M320 196 h12 v3 h-12 Z" class="lit" />
            <path :d="term.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'paste'">
            <!-- the chat bubble, tail down to the left, and the table that arrives in it -->
            <path d="M236 116 H376 V196 H276 L258 214 V196 H236 Z" class="lit" />
            <path d="M252 130 H360 V146 H252 Z" class="face" />
            <path
              d="M252 130 H360 V182 H252 Z M288 130 V182 M324 130 V182 M252 146 H360 M252 164 H360"
              class="ink-hair"
            />
            <path
              d="M262 156 H278 M298 156 H314 M334 156 H352 M262 174 H280 M298 174 H310 M334 174 H346"
              class="ink-hair"
            />
            <path d="M236 116 H376 V196 H276 L258 214 V196 H236 Z" class="ink-line" />
          </template>
          <template v-else>
            <path :d="site.near" class="near" />
            <path :d="site.nearShade" class="near-shade" />
            <path
              d="M214 252 L232 196 L246 186 L300 182 L318 190 L352 202 L384 252 Z"
              class="rock"
            />
            <path d="M214 252 L232 196 L246 186 L250 214 L242 252 Z" class="rock-shade" />
            <path d="M246 186 L300 182 L302 185 L248 189 Z" class="rock-lit" />
            <!-- the desk, the screen and the figure in its beanie -->
            <rect x="272" y="174" width="16" height="10" class="figure" />
            <rect x="273.5" y="175.5" width="13" height="7" class="screen" />
            <path
              d="M254 184 C253 176 255 170 259 169 C263 168 265 172 265 178 L264 184 Z"
              class="figure"
            />
            <circle cx="259.5" cy="166.5" r="3.6" class="figure" />
            <path d="M256.2 164.6 C256 159.6 263 159 262.8 164 Z" class="beanie" />
          </template>
        </svg>
      </div>
    </div>
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
  border-top: 0;
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
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.band .name {
  font-weight: 500;
}
.band .sub {
  color: var(--on-ground-muted);
}

/* flats, all from the scene tokens so the dusk palette repaints them */
.sky {
  fill: var(--sky-top);
}
.sea {
  fill: var(--sea-fill);
}
.shore {
  fill: var(--sea-shore);
}
.ground {
  fill: var(--plain);
}
.far {
  fill: var(--esterel);
}
.wall {
  fill: var(--sky-low);
}
.lit {
  fill: var(--rock-lit);
}
.face {
  fill: var(--rock);
}
.shade {
  fill: var(--rock-shade);
}
/* the cast shadow is the vignette's screened plate: lilac dots, the ground between them */
.cast {
  fill: v-bind(castFill);
}
.cast-dot {
  /* the shadow ink overprinted on the paper it falls on (the ground, or the wall behind the AC),
     so the screen reads as a shade of that paper, not as blue specks */
  fill: var(--vig-cast, color-mix(in srgb, var(--rock-shade) 72%, var(--cast-paper)));
}
.art {
  --cast-paper: var(--plain);
}
.art.gree {
  --cast-paper: var(--sky-low);
}
.dark {
  fill: var(--figure);
}
/* the one spot per drawing: porphyry, unless the page around it is already porphyry (the
   projects flood sets --vig-spot) */
.art {
  --spot: var(--vig-spot, var(--ink-porphyry));
}
.spot {
  fill: var(--spot);
}
.spot-lit {
  fill: color-mix(in srgb, var(--spot) 60%, var(--ink-shell));
}
.spot-shade {
  fill: color-mix(in srgb, var(--spot) 60%, var(--ink-oxblood));
}
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
.site .sky-low {
  fill: var(--sky-low);
}
.site .sun {
  fill: var(--sun);
}
.site .halo {
  fill: var(--sun-halo);
}
.site .far {
  fill: var(--hill-far);
}
.site .far-shade {
  fill: var(--hill-far-shade);
}
.site .mid {
  fill: var(--hill-mid);
}
.site .mid-shade {
  fill: var(--hill-mid-shade);
}
.site .near {
  fill: var(--hill-near);
}
.site .near-shade {
  fill: var(--hill-near-shade);
}
.site .rock {
  fill: var(--rock);
}
.site .rock-shade {
  fill: var(--rock-shade);
}
.site .rock-lit {
  fill: var(--rock-lit);
}
.site .figure {
  fill: var(--figure);
}
.site .screen {
  fill: var(--screen);
}
.site .beanie {
  fill: var(--vig-beanie, var(--accent));
}
</style>
