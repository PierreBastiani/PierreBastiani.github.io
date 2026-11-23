<script setup lang="ts">
import { ref } from 'vue'
import {
  FRONT_RIDGE,
  ridgeFacets,
  ridgeLine,
  ridgePath,
  ridgeY,
  type RidgeOptions,
} from '@/lib/ridge'
import {
  VAR_PLAIN,
  cityBlocks,
  cloud,
  coastPath,
  shoreLights,
  shoreStrip,
  village,
  windows,
} from '@/lib/scene'
import { ramp } from '@/lib/halftone'
import { useParallax } from '@/composables/useParallax'
import type { Built, Frame, Lattice } from '@/composables/usePress'
import PressPlate from './PressPlate.vue'
import HeroLayer from './hero/HeroLayer.vue'
import SummitSetup from './hero/SummitSetup.vue'
import DeskFigureLink from './hero/DeskFigureLink.vue'

// The view south from the Baou de Saint-Jeannet late in the day. Left is east: the Var plain
// running down to Nice and the airport. Ahead: hills stepping down to the sea at Cagnes.
// Right is west: Vence, Saint-Paul, La Colle, Antibes and its cap, the Estérel on the horizon.
// Scene units and the phone-safe zone are described in lib/scene.ts.

// The sky's one screened plate: the sky ink breaks into dots on its way down to the paper band
// at the horizon, in four steps of one tile. Tiles of 32 scene units, about 17 px on screen (12 px
// between dots), so the dots read as print at any width and never beat with the pixels.
const SKY_P = 32
const skyRamp = ramp(320, SKY_P, 1, [0.13, 0.24, 0.24, 0.13])
// Under the wordmark the same ramp is printed on its own plate, set from the letters instead of
// the scene: it starts at the caps' top and runs down to the warm band, so the dots only show
// between the letters and the open sky over the name stays flat. The column width sets the
// caps' height and the viewport sets the scene's, so no scene unit fits every screen; the plate
// counts in px instead, an 18 px tile (32 units on a 574 px phone scene), the same screen at
// every size, as a printer's would be.
const PLATE_P = 18
const PLATE_SOLID = 2 // tiles of flat sky ink at the plate's top, under its first two bands
// Two screens for the same ramp. At dusk on a phone the light dots sit right between the
// letters of the first line and the standard screen reads busy there, so it gets a calmer one:
// smaller dots, the heaviest band lightest (CSS picks the set, see .ramp .calm).
const plateSets = [
  { id: 'std', bands: ramp(0, PLATE_P, 1, [0.13, 0.24, 0.24, 0.13]) },
  { id: 'calm', bands: ramp(0, PLATE_P, 1, [0.08, 0.15, 0.19, 0.11]) },
]

const clouds = [
  cloud(3, 446, 920, 1180, 10, 22),
  cloud(5, 486, 1680, 2060, 12, 24),
  cloud(9, 470, -640, -400, 10, 18),
  cloud(12, 500, 300, 470, 7, 12),
]

const coast = {
  land: coastPath(600),
  shallows: shoreStrip(6, 600),
  blocks: cityBlocks(41),
  lights: shoreLights(43),
}

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
const front = FRONT_RIDGE
const hills = {
  far: ridgePath(far),
  mid: ridgePath(mid),
  near: ridgePath(near),
  front: ridgePath(front),
}
// Printed in two flats per plane: the hill, then its shadow sides (see ridgeFacets).
const shade = {
  far: ridgeFacets(far, { minProm: 10, smooth: 60 }),
  mid: ridgeFacets(mid, { minProm: 14, smooth: 40 }),
  near: ridgeFacets(near, { minProm: 16, smooth: 40 }),
}

// Faint strata in the band, like the bedding of the limestone under the summit. Static.
const strata = Array.from({ length: 10 }, (_, i) =>
  ridgeLine({
    seed: 80 + i,
    base: 18 + i * 36,
    amp: 7 + i * 0.5,
    scale: 0.0035,
    octaves: 2,
    x0: -240,
    x1: 1840,
    step: 20,
  }),
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
  mid: [
    ...windows(towns.laGaude.houses, 2, 41),
    ...windows(towns.saintPaul.houses, 2, 42),
    ...windows(towns.laColle.houses, 2, 43),
  ],
  near: [...windows(vence.houses, 2, 44), ...windows(saintJeannet.houses, 2, 45)],
}

// The table d'orientation: each name on a leader line over its place. base is the place, a and
// b the leader's ends above it, t the text's baseline (scene units).
type Label = { name: string; x: number; base: number; a: number; b: number; t: number }
const label = (name: string, x: number, base: number, a: number, b: number, t: number): Label => ({
  name,
  x,
  base,
  a: base - a,
  b: base - b,
  t: base - t,
})
const labelsIn = {
  plain: [label('Var', 250, 590, 0, 22, 28)],
  far: [label('Nice', -160, 549, 0, 43, 49), label('Antibes', 1400, 540, 0, 34, 40)],
  mid: [label('La Gaude', gx, gy, 12, 40, 46), label('Saint-Paul', px, py, 16, 40, 46)],
  near: [label('Saint-Jeannet', jx, jy, 16, 40, 46), label('Vence', vx, vy, 20, 46, 52)],
}
// Over the wordmark a name would print across a letter. Each hover the names are checked
// against the caps: one that would cross a letter drops under its place, on its own hill, if
// that spot is clear and not hidden by a nearer hill; otherwise it stays off.
const placed = ref<Record<string, 'down' | 'off' | undefined>>({})
const DROP = { a: -6, b: -26, t: -42 } // the dropped leader and baseline, under the place
const leader = (l: Label) =>
  placed.value[l.name] === 'down'
    ? `M${l.x} ${l.base - DROP.a} V${l.base - DROP.b}`
    : `M${l.x} ${l.a} V${l.b}`
const textY = (l: Label) => (placed.value[l.name] === 'down' ? l.base - DROP.t : l.t)

const scene = ref<HTMLElement | null>(null)
const isShape = (e: Element) => e instanceof SVGGeometryElement || e instanceof SVGTextElement
function placeLabels() {
  const el = scene.value
  const h1 = el?.querySelector('.wordmark h1')
  if (!el || !h1) return
  // the caps of each letter: a glyph's box is the font's content area (1.3em, the baseline
  // 1em down); the caps are the 0.714em over the baseline
  const caps: number[][] = []
  const range = document.createRange()
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? ''
    const fs = parseFloat(getComputedStyle(n.parentElement!).fontSize)
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') continue
      range.setStart(n, i)
      range.setEnd(n, i + 1)
      const r = range.getBoundingClientRect()
      caps.push([r.left, r.top + 0.286 * fs, r.right, r.top + fs])
    }
  }
  const pad = 4
  const hits = (r: DOMRect, dy = 0) =>
    caps.some(
      ([a, b, c, d]) =>
        r.right + pad > a! &&
        r.left - pad < c! &&
        r.bottom + dy + pad > b! &&
        r.top + dy - pad < d!,
    )
  const next: Record<string, 'down' | 'off' | undefined> = {}
  const box = el.getBoundingClientRect()
  for (const g of el.querySelectorAll<SVGGElement>('[data-label]')) {
    const name = g.dataset.label!
    const l = Object.values(labelsIn)
      .flat()
      .find((x) => x.name === name)!
    const text = g.querySelector('text')!
    const k = (g.ownerSVGElement?.getScreenCTM()?.d ?? 1) || 1 // px per scene unit
    const now = text.getBoundingClientRect()
    const cur = textY(l)
    const up = (l.t - cur) * k
    if (!hits(now, up)) continue
    const dy = (l.base - DROP.t - cur) * k
    const cx = (now.left + now.right) / 2
    const cy = (now.top + now.bottom) / 2 + dy
    const own = g.ownerSVGElement
    const clear =
      !hits(now, dy) &&
      now.bottom + dy < box.bottom &&
      [now.left + 2, cx, now.right - 2].every(
        // the first painted shape there (a layer's own svg box is hit everywhere)
        (x) => document.elementsFromPoint(x, cy).find(isShape)?.closest('svg') === own,
      )
    next[name] = clear ? 'down' : 'off'
  }
  placed.value = next
}
function onSceneEnter(e: PointerEvent) {
  if (props.fit && e.pointerType === 'mouse') placeLabels()
}

// noTranslate: the title is a name, which browser translation would garble.
// fit: set the title as a wordmark that fills the column, behind the hills (the main page).
// Its numbers are the title's width in em at 800 with -0.035em tracking, in caps, measured in
// Chrome: the whole title on one line first, then each line on its own (phones).
const props = defineProps<{ title: string[]; noTranslate?: boolean; fit?: number[] }>()
const fitStyle = props.fit
  ? Object.fromEntries(props.fit.map((w, i) => [i ? `--fit-${i - 1}` : '--fit', w]))
  : undefined

const cardOpen = ref(false) // the summit figure's card holds the pointer parallax while open
useParallax(scene, cardOpen)

// The signature: the pointer presses the plate's screen (see usePress). The plate's lattice is
// read off the SVG as it is now: its box, which screen CSS shows (the calm one on dark phones),
// and where its tiles fall. Over the plate is open sky: paper dots of no size; under its bands,
// bare paper.
const plate = ref<SVGSVGElement | null>(null)
function plateLattice(f: Frame, cv: HTMLCanvasElement): Built | null {
  const svg = plate.value
  if (!svg) return null
  const cr = cv.getBoundingClientRect()
  const sr = svg.getBoundingClientRect()
  const shownSet =
    plateSets.find((s) => {
      const g = svg.querySelector(`g.${s.id}`)
      return g && getComputedStyle(g).display !== 'none'
    }) ?? plateSets[0]!
  const p = PLATE_P
  // the pattern's tiles start at the SVG's own origin, which runs past the canvas's left
  const ox = (((sr.left - cr.left) % p) + p) % p
  const oy = sr.top - cr.top
  const cols = Math.ceil(f.w / p) + 2
  const j0 = -Math.ceil(oy / p) // rows of open sky over the plate, up to the canvas's top
  const rows = Math.ceil(f.h / p) + 1
  const n = cols * rows * 2
  const L: Lattice = {
    xs: new Float32Array(n),
    ys: new Float32Array(n),
    r0: new Float32Array(n),
    kind: new Uint8Array(n),
  }
  let k = 0
  for (let j = j0; j < j0 + rows; j++) {
    const band = shownSet.bands[j]
    const r = band ? band.dots[0]!.r : 0
    const paper = j < 0 || band?.paper ? 1 : 0
    for (let i = -1; i < cols - 1; i++)
      for (const q of [0.25, 0.75]) {
        L.xs[k] = ox + (i + q) * p
        L.ys[k] = oy + (j + q) * p
        L.r0[k] = r
        L.kind[k] = paper
        k++
      }
  }
  // the flat sky ink at the plate's top and over it, on the paper
  const solid = Math.max(0, oy + PLATE_SOLID * p)
  return {
    lattice: L,
    under: (c, inks) => {
      c.fillStyle = inks.ink
      c.fillRect(0, 0, f.w, solid)
    },
  }
}
</script>

<template>
  <section id="top" class="hero" :class="{ wm: props.fit }" aria-labelledby="hero-title">
    <div ref="scene" class="scene print" @pointerenter="onSceneEnter">
      <!-- sky and sun: flat bands, a darker band at the top, two thin ones at the horizon -->
      <HeroLayer :y0="-400" :h="940" :depth="0">
        <defs>
          <pattern
            v-for="(b, i) in skyRamp"
            :id="`ht-sky-${i}`"
            :key="i"
            patternUnits="userSpaceOnUse"
            :width="SKY_P"
            :height="SKY_P"
          >
            <circle
              v-for="(d, j) in b.dots"
              :key="j"
              :cx="d.cx"
              :cy="d.cy"
              :r="d.r"
              :fill="b.paper ? 'var(--sky-screen)' : 'var(--sky-top)'"
            />
          </pattern>
        </defs>
        <rect x="-1300" y="-400" width="4200" height="940" fill="var(--sky-top)" />
        <template v-if="!props.fit">
          <rect x="-1300" y="384" width="4200" height="156" fill="var(--sky-screen)" />
          <rect
            v-for="(b, i) in skyRamp"
            :key="'ht' + i"
            x="-1300"
            :y="b.y"
            width="4200"
            :height="b.h"
            :fill="`url(#ht-sky-${i})`"
          />
        </template>
        <!-- under the wordmark's plate: the paper it leaves bare when the parallax lifts it -->
        <rect v-else x="-1300" y="400" width="4200" height="140" fill="var(--sky-screen)" />
        <rect x="-1300" y="494" width="4200" height="46" fill="var(--sky-low)" />
      </HeroLayer>

      <!-- the wordmark's screened plate: sky ink, the ramp, then paper down to the warm band.
           It moves with the wordmark, so the caps never slide into the dots -->
      <div v-if="props.fit" class="skyplate" :style="fitStyle" aria-hidden="true">
        <div class="bleed">
          <svg ref="plate" class="ramp" focusable="false">
            <defs>
              <template v-for="set in plateSets" :key="set.id">
                <pattern
                  v-for="(b, i) in set.bands"
                  :id="`ht-${set.id}-${i}`"
                  :key="i"
                  patternUnits="userSpaceOnUse"
                  :width="PLATE_P"
                  :height="PLATE_P"
                >
                  <circle
                    v-for="(d, j) in b.dots"
                    :key="j"
                    :cx="d.cx"
                    :cy="d.cy"
                    :r="d.r"
                    :fill="b.paper ? 'var(--sky-screen)' : 'var(--sky-top)'"
                  />
                </pattern>
              </template>
            </defs>
            <rect width="100%" :height="PLATE_SOLID * PLATE_P" fill="var(--sky-top)" />
            <rect :y="PLATE_SOLID * PLATE_P" width="100%" height="100%" fill="var(--sky-screen)" />
            <g v-for="set in plateSets" :key="set.id" :class="set.id">
              <rect
                v-for="(b, i) in set.bands"
                :key="i"
                :y="b.y"
                width="100%"
                :height="b.h"
                :fill="`url(#ht-${set.id}-${i})`"
              />
            </g>
          </svg>
          <!-- the same plate redrawn while the pointer presses it (fine pointers), see
               usePress; hidden at rest, so the page at rest is the SVG above -->
          <PressPlate
            v-if="props.fit"
            class="press"
            host=".scene"
            :tile="PLATE_P"
            :depth="0.26"
            :windowed="false"
            :build="plateLattice"
            ground="var(--sky-screen)"
            ink="var(--sky-top)"
            paper="var(--sky-screen)"
            ink-press="var(--press-on-paper)"
            paper-press="var(--press-on-sky)"
          />
        </div>
      </div>

      <!-- the sun, over the plate -->
      <HeroLayer :y0="400" :h="140" :depth="0">
        <g class="sun">
          <circle cx="1560" cy="472" r="62" fill="var(--sun-halo)" />
          <circle cx="1560" cy="472" r="38" fill="var(--sun-halo-2)" />
          <circle cx="1560" cy="472" r="24" fill="var(--sun)" />
        </g>
      </HeroLayer>

      <!-- a few flat clouds, each with its shadow flat underneath -->
      <HeroLayer :y0="400" :h="120" :depth="0.05">
        <path
          v-for="(d, i) in clouds"
          :key="'s' + i"
          :d="d"
          fill="var(--cloud-shade)"
          transform="translate(6 4)"
        />
        <path v-for="(d, i) in clouds" :key="i" :d="d" fill="var(--cloud)" />
      </HeroLayer>

      <!-- the sea, one block of ink; Cap Ferrat to the east, the Estérel to the west -->
      <HeroLayer :y0="490" :h="90" :depth="0.1">
        <rect x="-1300" y="519" width="4200" height="61" fill="var(--sea-fill)" />
        <path
          d="M-1300 520 L-1300 500 L-1200 504 L-1110 498 L-1040 510 L-1000 516 L-960 522 L-900 526 L-880 530 L-940 530 L-1020 524 Z"
          fill="var(--esterel)"
        />
        <path
          d="M1600 520 L1650 513 L1720 509 L1790 512 L1860 505 L1950 510 L2060 506 L2200 513 L2360 509 L2560 515 L2900 517 L2900 520 Z"
          fill="var(--esterel)"
        />
        <g fill="var(--sun)">
          <rect x="1526" y="523" width="64" height="1.6" />
          <rect x="1540" y="528" width="36" height="1.6" />
          <rect x="1550" y="533" width="18" height="1.6" />
        </g>
      </HeroLayer>

      <!-- the shore: Nice, the airport, Saint-Laurent, Cagnes and its castle hill, Antibes -->
      <HeroLayer :y0="515" :h="85" :depth="0.16">
        <path :d="coast.shallows" fill="var(--sea-shore)" />
        <path :d="coast.land" fill="var(--coast)" />
        <path
          d="M712 556 C724 546 736 543 748 546 C758 548 766 552 772 556 Z"
          fill="var(--coast)"
        />
        <rect
          v-for="(b, i) in coast.blocks"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="b.h"
          fill="var(--city)"
        />
        <rect x="738" y="536" width="5" height="9" fill="var(--city)" />
        <g class="lights">
          <circle v-for="(d, i) in coast.lights" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
      </HeroLayer>

      <!-- the wordmark: in front of the sea and the shore, behind the hills, so the summits
           of La Gaude and Saint-Paul stand over its feet like a poster's lettering -->
      <div v-if="props.fit" class="wordmark" :style="fitStyle">
        <div class="bleed">
          <h1 id="hero-title" :translate="props.noTranslate ? 'no' : undefined">
            <template v-for="(line, i) in props.title" :key="line"
              >{{ i > 0 ? ' ' : '' }}<span :class="`l${i}`">{{ line }}</span></template
            >
          </h1>
        </div>
      </div>

      <!-- the Var valley floor, seen through the notch near the coast -->
      <HeroLayer :y0="545" :h="165" :depth="0.2">
        <path :d="VAR_PLAIN" fill="var(--plain)" />
        <g class="labels">
          <g v-for="l in labelsIn.plain" :key="l.name" :class="placed[l.name]" :data-label="l.name">
            <path :d="leader(l)" /><text :x="l.x" :y="textY(l)">{{ l.name }}</text>
          </g>
        </g>
      </HeroLayer>

      <!-- far hills: the Nice side on the left, the hills behind Cagnes and Antibes -->
      <HeroLayer :y0="470" :h="530" :depth="0.22">
        <path :d="hills.far" fill="var(--hill-far)" />
        <path :d="shade.far" fill="var(--hill-far-shade)" />
        <g class="labels">
          <g v-for="l in labelsIn.far" :key="l.name" :class="placed[l.name]" :data-label="l.name">
            <path :d="leader(l)" /><text :x="l.x" :y="textY(l)">{{ l.name }}</text>
          </g>
        </g>
      </HeroLayer>

      <!-- mid hills: La Gaude, Saint-Paul, La Colle -->
      <HeroLayer :y0="470" :h="530" :depth="0.4">
        <path :d="hills.mid" fill="var(--hill-mid)" />
        <path :d="shade.mid" fill="var(--hill-mid-shade)" />
        <g v-for="(v, name) in towns" :key="name">
          <g v-for="(h, i) in v.houses" :key="i">
            <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" fill="var(--villa)" />
            <rect :x="h.x" :y="h.y" :width="h.w * 0.4" :height="h.h" fill="var(--villa-shade)" />
            <rect
              :x="h.x - 0.5"
              :y="h.y - h.h * 0.3"
              :width="h.w + 1"
              :height="h.h * 0.32"
              fill="var(--roof)"
            />
          </g>
        </g>
        <rect
          :x="towns.saintPaul.tower.x"
          :y="towns.saintPaul.tower.y"
          :width="towns.saintPaul.tower.w"
          :height="towns.saintPaul.tower.h"
          fill="var(--villa)"
        />
        <rect
          :x="towns.saintPaul.tower.x"
          :y="towns.saintPaul.tower.y"
          :width="towns.saintPaul.tower.w * 0.4"
          :height="towns.saintPaul.tower.h"
          fill="var(--villa-shade)"
        />
        <rect :x="px - 22" :y="py + 12" width="44" height="6" fill="var(--villa)" />
        <rect :x="px - 22" :y="py + 12" width="16" height="6" fill="var(--villa-shade)" />
        <g class="lights">
          <circle v-for="(d, i) in dusk.mid" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
        <g class="labels">
          <g v-for="l in labelsIn.mid" :key="l.name" :class="placed[l.name]" :data-label="l.name">
            <path :d="leader(l)" /><text :x="l.x" :y="textY(l)">{{ l.name }}</text>
          </g>
        </g>
      </HeroLayer>

      <!-- near hills: Saint-Jeannet under the cliff, Vence to the west -->
      <HeroLayer :y0="640" :h="360" :depth="0.55">
        <path :d="hills.near" fill="var(--hill-near)" />
        <path :d="shade.near" fill="var(--hill-near-shade)" />
        <g v-for="(h, i) in [...saintJeannet.houses, ...vence.houses]" :key="i">
          <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" fill="var(--villa)" />
          <rect :x="h.x" :y="h.y" :width="h.w * 0.4" :height="h.h" fill="var(--villa-shade)" />
          <rect
            :x="h.x - 0.5"
            :y="h.y - h.h * 0.3"
            :width="h.w + 1"
            :height="h.h * 0.32"
            fill="var(--roof)"
          />
        </g>
        <template v-for="t in [saintJeannet.tower, vence.tower]" :key="t.x">
          <rect :x="t.x" :y="t.y" :width="t.w" :height="t.h" fill="var(--villa)" />
          <rect :x="t.x" :y="t.y" :width="t.w * 0.4" :height="t.h" fill="var(--villa-shade)" />
        </template>
        <g class="lights">
          <circle v-for="(d, i) in dusk.near" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
        </g>
        <g class="labels">
          <g v-for="l in labelsIn.near" :key="l.name" :class="placed[l.name]" :data-label="l.name">
            <path :d="leader(l)" /><text :x="l.x" :y="textY(l)">{{ l.name }}</text>
          </g>
        </g>
      </HeroLayer>

      <!-- the summit and the desk -->
      <HeroLayer :y0="380" :h="620" :depth="0.85">
        <SummitSetup />
        <!-- an Aleppo pine on the crest to the west: the poster's frame on wide screens; the
             wordmark frames the view instead (the crown would sit on its last letters) -->
        <g v-if="!props.fit" transform="translate(305 22)">
          <path
            d="M1434 782 C1428 700 1412 600 1396 482 L1408 480 C1424 600 1442 700 1450 782 Z"
            fill="var(--trunk-shade)"
          />
          <path
            d="M1442 782 C1436 700 1419 600 1402 481 L1408 480 C1424 600 1442 700 1450 782 Z"
            fill="var(--trunk)"
          />
          <path
            d="M1399 530 C1380 505 1360 488 1334 474 L1338 468 C1364 482 1386 498 1404 520 Z"
            fill="var(--trunk-shade)"
          />
          <path
            d="M1402 505 C1424 488 1446 474 1474 462 L1477 468 C1450 480 1428 494 1406 512 Z"
            fill="var(--trunk)"
          />
          <path
            d="M1290 470 C1296 452 1320 444 1344 446 C1356 432 1384 428 1404 436 C1420 424 1452 424 1470 436 C1494 432 1522 440 1532 456 C1540 466 1528 474 1510 472 C1490 480 1462 476 1446 470 C1424 480 1392 478 1376 472 C1356 482 1322 482 1306 476 C1296 476 1288 474 1290 470 Z"
            fill="var(--pine)"
          />
          <path
            d="M1350 446 C1366 436 1388 433 1404 438 C1422 428 1450 428 1468 438 C1490 436 1512 444 1524 456 C1500 450 1478 446 1460 448 C1440 442 1418 444 1404 448 C1388 444 1366 446 1350 446 Z"
            fill="var(--pine-lit)"
          />
        </g>
      </HeroLayer>

      <!-- foreground: the edge of the band below -->
      <HeroLayer :y0="860" :h="140" :depth="1" still>
        <path :d="hills.front" fill="var(--ground)" />
      </HeroLayer>

      <DeskFigureLink v-model:open="cardOpen" />

      <div v-if="!props.fit" class="title" style="--depth: 0.6">
        <div class="wrap">
          <h1 id="hero-title" :translate="props.noTranslate ? 'no' : undefined">
            <!-- a space between the lines, so the heading's text reads "Pierre Bastiani" -->
            <template v-for="(line, i) in props.title" :key="line"
              >{{ i > 0 ? ' ' : '' }}<span :class="{ indent: i > 0 }">{{ line }}</span></template
            >
          </h1>
        </div>
      </div>
    </div>

    <div class="intro on-ground">
      <svg
        class="strata"
        viewBox="0 0 1600 360"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
        focusable="false"
      >
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
  /* how much of the top of the sky is cut off: none, except on phones (below) */
  --sky-cut: 0px;
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
  stroke-width: var(--w-hair);
  font: 500 15px var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-anchor: middle;
}
.labels path {
  vector-effect: non-scaling-stroke;
}
.labels text {
  stroke: none;
}
.labels .off {
  display: none;
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
  padding-top: calc(clamp(2.5rem, 9svh, 6rem) + var(--sky-cut));
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
/* The wordmark runs off both edges of the screen, like a poster title cropped by its sheet:
   the caps' ink is a little wider than the screen, so the edges cut into the P's stem and the
   last I's, never further, and the I less (a thin I would read as a rule). Sizes count from
   the scene's width (100cqi in .bleed). The fit numbers are advance widths; the caps' ink
   starts 0.063em in and ends about 0.02em short, and each edge cuts --cut-l / --cut-r more. On very wide screens the caps stop growing at half the scene's
   height, then stand inside it, centred.
   Phones: the two lines run off the left edge only (the P's and the B's stems are cut) and
   both end on the right gutter, so the E and the last I, the letters a cut would turn into
   something else, stay whole. */
.wordmark,
.skyplate {
  --depth: 0.18;
  --cut-l: 0.065;
  --cut-r: 0.03;
  --cut-phone: 0.07;
  --fs: min(100cqi / (var(--fit) - 0.09 - var(--cut-l) - var(--cut-r)), 50cqh);
  /* Phones, two lines. Each line would fill the width, but Kensae Sans is narrow, so two full
     lines can stand taller than the sky they have: the scene is 68svh tall, the caps' feet sit
     43.5% up it, and the sticky header covers its top (10svh, at most 5.25rem). --room is what
     is left, less half a rem of air; --ratio keeps the second line as wide as the first. When
     the height binds, both lines shrink together and stop short of the right gutter. */
  --ink-0: calc(var(--fit-0) - 0.09 - var(--cut-phone));
  --ink-1: calc(var(--fit-1) - 0.09 - var(--cut-phone));
  --ratio: calc(var(--ink-0) / var(--ink-1));
  --room: calc(0.565 * 68svh - min(10svh, 5.25rem) - 0.5rem);
  --fs-0: min(
    calc((100cqi - var(--gutter-r)) / var(--ink-0)),
    calc(var(--room) / (0.764 + 0.8 * var(--ratio)))
  );
  --fs-1: calc(var(--fs-0) * var(--ratio));
}
.wordmark {
  position: absolute;
  inset-inline: 0;
  /* the caps' feet sit on the shore, under the horizon (52%), where the summits of the mid
     plane rise in front of them */
  bottom: 41.5%;
  pointer-events: none;
  transform: translate3d(
    calc(var(--px) * var(--depth) * -18px),
    calc(var(--scroll) * (1 - var(--depth)) * 150px + var(--py) * var(--depth) * -6px),
    0
  );
}
.bleed {
  container-type: inline-size;
}
/* The plate shares the wordmark's plane and width, so 100cqi is the caps' measure here too. */
.skyplate {
  /* from the wordmark's foot to its cap line: the caps are 0.714em tall, and in a 0.8 line box
     of a font 1.3em deep their top sits 0.764em above the box's foot */
  --cap: calc(0.764 * var(--fs));
  --foot: 41.5%;
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translate3d(
    calc(var(--px) * var(--depth) * -18px),
    calc(var(--scroll) * (1 - var(--depth)) * 150px + var(--py) * var(--depth) * -6px),
    0
  );
}
.skyplate .bleed {
  height: 100%;
}
.ramp,
.press {
  position: absolute;
  /* a little past both edges, for the pointer parallax; the scene clips it */
  left: -1.5rem;
  width: calc(100% + 3rem);
  /* The foot is the warm band at y 494 and the top is the cap line, so the first dots start
     under the caps' top edge and the open sky above the name stays flat. Where the caps sit too
     low for four tiles (a 1280 screen leaves about three), the plate keeps its four and rises
     past the cap line instead of cutting the ramp. */
  bottom: 50.6%;
  height: max(calc(var(--foot) - 50.6% + var(--cap)), 4 * 18px);
}
/* the pressed plate also covers the open sky over the name, which the press can reach: from
   the scene's top down to the plate's foot (a canvas has no bitmap until pressed, so its height
   is set, never left to its intrinsic size) */
.press {
  display: block;
  top: 0;
  height: 49.4%;
  visibility: hidden;
}
.press.on {
  visibility: visible;
}
.ramp .calm {
  display: none;
}
.wordmark h1 {
  /* one line, its ink a hair wider than the screen: the part the edges leave is centred on it
     (0.0215em moves the ink's centre, not the advance's, onto the screen's) */
  position: relative;
  left: 50%;
  width: max-content;
  translate: calc(-50% - ((var(--cut-l) - var(--cut-r)) / 2) * 1em) 0;
  /* Kensae Sans: its ink starts 0.045em in and ends 0.045em short, the same on both sides,
     so the 0.09 in the sizes above and no centring shift here */
  font-family: var(--f-title);
  /* the Signature level: ledges on the Es, pulleys on the N, the Baou's cliff for the As, a git
     node on the K. The fit numbers are measured with it on (the Baou A is 3 units wider). */
  font-feature-settings: 'ss01';
  font-size: var(--fs);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--ink);
  pointer-events: auto;
}
/* Wide screens: the wordmark is the sky's subject, so the empty top of the sky goes, the same
   cut the phones get */
@media (min-width: 40.0625rem) {
  .wm .scene {
    --sky-cut: min(13svh, 6.5rem);
    margin-top: calc(-1 * var(--sky-cut));
    clip-path: inset(var(--sky-cut) 0 0 0);
  }
}
/* Phones: two lines, each as wide as the screen from its left edge to the right gutter, like a
   justified poster block slid off the sheet */
@media (max-width: 40rem) {
  /* a little higher: at this width the near hills fill the whole foot of the second line */
  .wordmark {
    bottom: 43.5%;
  }
  .wordmark h1 {
    left: 0;
    width: auto;
    translate: none;
    white-space: normal;
  }
  .wordmark h1 span {
    display: block;
    margin-left: calc(-1em * (0.045 + var(--cut-phone)));
  }
  .wordmark .l0 {
    font-size: var(--fs-0);
  }
  .wordmark .l1 {
    font-size: var(--fs-1);
  }
  /* the cap line of the first line: the whole second line box, then the first line's caps */
  .skyplate {
    --cap: calc(0.8 * var(--fs-1) + 0.764 * var(--fs-0));
    --foot: 43.5%;
  }
}
/* Dusk on a phone: the calmer screen (see plateSets) */
@media (max-width: 40rem) and (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .ramp .std {
    display: none;
  }
  :root:not([data-theme='light']) .ramp .calm {
    display: inline;
  }
}
@media (max-width: 40rem) {
  :root[data-theme='dark'] .ramp .std {
    display: none;
  }
  :root[data-theme='dark'] .ramp .calm {
    display: inline;
  }
}
/* Phones: the top of the sky is cut off, so the line under the name (the role, or the shop's
   offer) comes up onto the first screen. The scene keeps its size, so the drawing and the
   figure's card keep their scale; it moves up under the header and the cut part is clipped. */
@media (max-width: 40rem) {
  .scene {
    /* about a seventh of the scene; capped, since the scene itself stops growing at 44rem */
    --sky-cut: min(10svh, 5.25rem);
    margin-top: calc(-1 * var(--sky-cut));
    clip-path: inset(var(--sky-cut) 0 0 0);
  }
  /* the name moves up with it, so the sky under it stays as tall as the sky above */
  .title {
    padding-top: calc(2.5rem + var(--sky-cut));
  }
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
  stroke-width: var(--w-hair);
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
  .title,
  .wordmark,
  .skyplate {
    transform: none;
  }
  .labels {
    transition: none;
  }
}
</style>
