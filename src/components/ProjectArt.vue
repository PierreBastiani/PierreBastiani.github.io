<script setup lang="ts">
// Small flat illustrations for the project cards, drawn in three layers like the hero.
// On hover or keyboard focus of the card, the layers lift apart a little (see ProjectGrid).
export type ArtKind = 'homelab' | 'smarket' | 'gree' | 'site'
defineProps<{ kind: ArtKind }>()

// Isometric slab: top, left and right faces of a box w × d × h standing at height z.
const O = { x: 200, y: 150 }
const iso = (x: number, y: number, z: number) =>
  `${(O.x + (x - y) * 0.866).toFixed(1)},${(O.y + (x + y) * 0.5 - z).toFixed(1)}`
function slab(w: number, d: number, h: number, z: number) {
  const x0 = -w / 2
  const y0 = -d / 2
  const x1 = w / 2
  const y1 = d / 2
  const t = z + h
  return {
    top: [iso(x0, y0, t), iso(x1, y0, t), iso(x1, y1, t), iso(x0, y1, t)].join(' '),
    left: [iso(x0, y1, t), iso(x1, y1, t), iso(x1, y1, z), iso(x0, y1, z)].join(' '),
    right: [iso(x1, y0, t), iso(x1, y1, t), iso(x1, y1, z), iso(x1, y0, z)].join(' '),
  }
}
const router = slab(150, 96, 14, -40)
const mini = slab(104, 104, 26, 2)
const pi = slab(64, 44, 22, 56)
const at = (x: number, y: number, z: number) => iso(x, y, z).split(',').map(Number) as [number, number]
const antennas = [at(-60, -48, -26), at(30, -48, -26)]
const piLed = at(32, 6, 66)
const miniLed = at(52, 20, 10)
const routerLeds = [-40, -25, -10, 5].map((x) => at(x, 48, -33))

// smarket: a price line over a receipt
const prices = [150, 138, 146, 120, 128, 104, 112, 92]
const curve = prices.map((p, i) => `${70 + i * 38},${p}`).join(' ')
const last = { x: 70 + (prices.length - 1) * 38, y: prices[prices.length - 1]! }
const receiptLines = [0, 1, 2, 3, 4, 5, 6, 7]

// the site itself: three ridges and a sun, the hero in miniature
const ridge = (base: number, amp: number, phase: number) => {
  const pts: string[] = []
  for (let x = 0; x <= 400; x += 20) pts.push(`${x},${(base - amp * Math.sin(x / 55 + phase) - amp * 0.5 * Math.sin(x / 23 + phase * 2)).toFixed(1)}`)
  return `M0,250 L${pts.join(' L')} L400,250 Z`
}
const ridges = [ridge(150, 14, 0.4), ridge(178, 18, 2.1), ridge(206, 16, 4)]
</script>

<template>
  <div class="art" :class="kind" aria-hidden="true">
    <div class="stage">
      <!-- back layer -->
      <svg class="layer l0" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <ellipse cx="200" cy="214" rx="150" ry="26" class="shadow" />
          <polygon :points="router.left" class="sea-l" />
          <polygon :points="router.right" class="sea-r" />
          <polygon :points="router.top" class="sea-t" />
          <line v-for="(a, i) in antennas" :key="i" :x1="a[0]" :y1="a[1]" :x2="a[0]" :y2="a[1] - 34" class="stroke-ink" />
          <circle v-for="(l, i) in routerLeds" :key="'l' + i" :cx="l[0]" :cy="l[1]" r="2.2" class="led-soft" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <g transform="rotate(-5 150 130)">
            <path d="M80 34 H220 V214 l-10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 Z" class="paper" />
            <rect v-for="i in receiptLines" :key="i" x="98" :y="58 + i * 18" :width="i % 3 === 0 ? 70 : 104" height="5" rx="2.5" class="ink-soft" />
            <rect x="98" y="200" width="104" height="2" class="ink-soft" />
          </g>
        </template>
        <template v-else-if="kind === 'gree'">
          <rect x="0" y="196" width="400" height="54" class="floor" />
          <rect x="300" y="36" width="70" height="96" rx="4" class="window" />
          <line x1="335" y1="36" x2="335" y2="132" class="frame" />
        </template>
        <template v-else>
          <rect x="0" y="0" width="400" height="250" class="sky" />
          <circle cx="300" cy="104" r="15" class="sun" />
        </template>
      </svg>

      <!-- middle layer -->
      <svg class="layer l1" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <polygon :points="mini.left" class="alu-l" />
          <polygon :points="mini.right" class="alu-r" />
          <polygon :points="mini.top" class="alu-t" />
          <circle :cx="miniLed[0]" :cy="miniLed[1]" r="2" class="led-soft" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <g class="grid">
            <line v-for="i in 4" :key="i" x1="56" :x2="352" :y1="70 + i * 26" :y2="70 + i * 26" />
          </g>
          <line x1="56" y1="176" x2="352" y2="176" class="axis" />
        </template>
        <template v-else-if="kind === 'gree'">
          <rect x="70" y="56" width="210" height="64" rx="14" class="unit" />
          <rect x="70" y="100" width="210" height="20" rx="10" class="unit-shade" />
          <line v-for="i in 5" :key="i" :x1="92 + i * 28" y1="110" :x2="104 + i * 28" y2="110" class="slat" />
          <rect x="236" y="70" width="26" height="9" rx="2" class="display" />
        </template>
        <template v-else>
          <path :d="ridges[0]" class="ridge-far" />
          <path :d="ridges[1]" class="ridge-mid" />
        </template>
      </svg>

      <!-- front layer -->
      <svg class="layer l2" viewBox="0 0 400 250">
        <template v-if="kind === 'homelab'">
          <polygon :points="pi.left" class="stone-l" />
          <polygon :points="pi.right" class="stone-r" />
          <polygon :points="pi.top" class="stone-t" />
          <circle :cx="piLed[0]" :cy="piLed[1]" r="3" class="accent" />
        </template>
        <template v-else-if="kind === 'smarket'">
          <polyline :points="curve" class="curve" />
          <circle v-for="(p, i) in prices.slice(0, -1)" :key="i" :cx="70 + i * 38" :cy="p" r="3.5" class="dot" />
          <circle :cx="last.x" :cy="last.y" r="6" class="accent" />
        </template>
        <template v-else-if="kind === 'gree'">
          <rect x="96" y="178" width="30" height="52" rx="7" class="remote" transform="rotate(-18 111 204)" />
          <circle cx="114" cy="186" r="3" class="accent" />
          <g class="waves">
            <path d="M132 164 q14 -14 6 -32" />
            <path d="M146 172 q24 -22 12 -54" />
            <path d="M160 180 q34 -30 18 -76" />
          </g>
        </template>
        <template v-else>
          <path :d="ridges[2]" class="ridge-near" />
          <path d="M230 250 L262 196 L300 186 L330 210 L360 250 Z" class="crag" />
          <rect x="276" y="176" width="18" height="11" rx="1.5" class="screen" />
        </template>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.art {
  position: relative;
  aspect-ratio: 8 / 5;
  border-radius: 1rem;
  background: var(--art-bg);
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

/* palette: every colour is a token (main.css, art block) */
.shadow { fill: var(--art-shadow); }
.sea-t { fill: var(--art-sea-t); }
.sea-l { fill: var(--art-sea-l); }
.sea-r { fill: var(--art-sea-r); }
.alu-t { fill: var(--art-alu-t); }
.alu-l { fill: var(--art-alu-l); }
.alu-r { fill: var(--art-alu-r); }
.stone-t { fill: var(--art-stone-t); }
.stone-l { fill: var(--art-stone-l); }
.stone-r { fill: var(--art-stone-r); }
.stroke-ink { stroke: var(--art-ink); stroke-width: 3; stroke-linecap: round; }
.led-soft { fill: var(--art-led); }
.accent { fill: var(--accent); }
.paper { fill: var(--art-paper); }
.ink-soft { fill: var(--art-line); }
.grid line { stroke: var(--art-line); stroke-width: 1; stroke-dasharray: 3 5; }
.axis { stroke: var(--art-ink); stroke-width: 1.5; opacity: 0.5; }
.curve { fill: none; stroke: var(--sea); stroke-width: 3.5; stroke-linejoin: round; stroke-linecap: round; }
.dot { fill: var(--art-bg); stroke: var(--sea); stroke-width: 2.5; }
.floor { fill: var(--art-floor); }
.window { fill: var(--art-window); }
.frame { stroke: var(--art-wall); stroke-width: 3; }
.unit { fill: var(--art-paper); }
.unit-shade { fill: var(--art-alu-t); }
.slat { stroke: var(--art-alu-l); stroke-width: 2.5; stroke-linecap: round; }
.display { fill: var(--art-ink); opacity: 0.75; }
.remote { fill: var(--art-ink); }
.waves path { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; }
.sky { fill: var(--art-window); }
.sun { fill: var(--art-sun); }
.ridge-far { fill: var(--art-alu-t); }
.ridge-mid { fill: var(--art-alu-l); }
.ridge-near { fill: var(--art-sea-l); }
.crag { fill: var(--art-stone-t); }
.screen { fill: var(--art-ink); }
</style>
