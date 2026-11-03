<script setup lang="ts">
// Before / after for each thing the shop page offers, drawn flat like the rest of the site.
// No brands, no real business names. Captions are HTML (they translate); drawings are decorative.
defineProps<{ kind: 'google' | 'site' | 'orders' | 'fix'; before: string; after: string }>()

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const stars = [0, 1, 2, 3, 4].map((i) => star(52 + i * 11, 64, 4.2))
</script>

<template>
  <figure class="ba">
    <div class="pair">
      <!-- before: drawn in the quiet ink, no spot colour -->
      <div class="panel before print">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <template v-if="kind === 'google'">
            <path d="M34 14 H126 V106 H34 Z" class="paper ink-heavy" />
            <path d="M44 24 H116 V50 H44 Z" class="ink-hair dashed" />
            <path d="M44 58 H86" class="ink-line" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="ink-hair" />
            <path d="M44 78 H100 M44 86 H82" class="ink-hair" />
            <path d="M106 80 H118 V92 H106 Z" class="ink-line" />
            <path d="M109.5 83.5 C109.5 81.5 114.5 81.5 114.5 84 C114.5 86 112 85.6 112 88 M112 89.6 V91" class="ink-line" />
          </template>
          <template v-else-if="kind === 'site'">
            <path d="M54 6 H106 V114 H54 Z" class="paper ink-heavy" />
            <path d="M72 6 V10 H88 V6" class="ink-line" />
            <path v-for="i in 9" :key="i" :d="`M58 ${18 + i * 6} H${116 + (i % 3) * 8}`" class="ink-hair" />
            <path d="M60 80 H86 V98 H60 Z M60 80 L86 98 M86 80 L60 98" class="ink-hair" />
          </template>
          <template v-else-if="kind === 'orders'">
            <g transform="rotate(-6 45 65)">
              <path d="M16 26 H74 V104 H16 Z" class="paper ink-heavy" />
              <path v-for="i in 6" :key="i" :d="`M13 ${30 + i * 11} H19`" class="ink-line" />
              <path v-for="i in 6" :key="'s' + i" :d="`M26 ${33 + i * 11} q6 -4 12 0 t12 0 t12 0`" class="ink-hair" />
            </g>
            <path d="M82 62 H100 M95 57 L100 62 L95 67" class="ink-line" />
            <path d="M108 44 H148 V70 H108 Z" class="paper ink-line" />
            <path d="M102 74 H154 L150 70 H106 Z" class="paper ink-line" />
            <path v-for="i in 3" :key="'k' + i" :d="`M113 ${50 + i * 5} q4 -3 8 0 t8 0 t8 0`" class="ink-hair" />
          </template>
          <template v-else>
            <path d="M58 30 H102 V50 H58 Z" class="paper ink-heavy" />
            <path d="M64 30 V20 M96 30 V18" class="ink-line" />
            <path d="M64 40 H67" class="ink-line" />
            <path d="M64 50 C40 70 110 66 70 86 S30 96 50 108" class="ink-line" />
            <path d="M80 50 C120 72 30 76 96 92 S120 100 104 108" class="ink-line" />
            <path d="M94 50 C70 64 140 88 80 104" class="ink-hair" />
            <path d="M124 23 A14 14 0 0 1 144 23 M128 27 A8 8 0 0 1 140 27" class="ink-hair" />
            <path d="M122 12 L146 32" class="ink-line" />
          </template>
        </svg>
      </div>

      <span class="arrow-mid" aria-hidden="true">→</span>

      <!-- after: the same object, put right, with the one spot of porphyry laid a little off the line -->
      <div class="panel after print">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <template v-if="kind === 'google'">
            <path d="M34 14 H126 V106 H34 Z" class="paper ink-heavy" />
            <path d="M45.5 25.5 H67.5 V51.5 H45.5 Z" class="spot" />
            <path d="M44 24 H66 V50 H44 Z M69 24 H91 V50 H69 Z M94 24 H116 V50 H94 Z" class="ink-line" />
            <path d="M69 44 L75 38 L79 42 L84 35 L91 44 M94 38 H116 M100 31 V50" class="ink-hair" />
            <path d="M44 58 H90" class="ink-heavy" />
            <polygon v-for="(p, i) in stars" :key="'f' + i" :points="p" class="spot" transform="translate(1.2 1.2)" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="ink-hair" />
            <path d="M40 78 L42 80 L46 75.5 M40 88 L42 90 L46 85.5" class="ink-line" />
            <path d="M50 78 H94 M50 88 H86" class="ink-hair" />
            <path d="M98 74 H128 V92 H108 L102 98 V92 H98 Z" class="paper ink-line" />
            <path d="M102 80 H122 M102 86 H114" class="ink-hair" />
          </template>
          <template v-else-if="kind === 'site'">
            <path d="M54 6 H106 V114 H54 Z" class="paper ink-heavy" />
            <path d="M72 6 V10 H88 V6" class="ink-line" />
            <circle cx="94.5" cy="24.5" r="4" class="spot" />
            <path d="M58 16 H102 V44 H58 Z" class="ink-line" />
            <path d="M58 40 L68 31 L75 36 L84 26 L102 40" class="ink-hair" />
            <path d="M62 52 H92" class="ink-heavy" />
            <path d="M62 60 H98 M62 66 H90" class="ink-hair" />
            <path d="M63.5 81.5 H99.5 V93.5 H63.5 Z" class="spot" />
            <path d="M62 80 H98 V92 H62 Z" class="ink-line" />
            <path d="M68 83.5 L70.5 83.5 L71.5 85.5 L70.5 86.5 C71.3 88 72.5 89.2 74 90 L75 89 L77 90 V92 M80 86 H93" class="ink-hair" />
          </template>
          <template v-else-if="kind === 'orders'">
            <path d="M54 6 H106 V114 H54 Z" class="paper ink-heavy" />
            <path d="M72 6 V10 H88 V6" class="ink-line" />
            <path d="M60 22 H88" class="ink-heavy" />
            <g v-for="i in 6" :key="i">
              <path v-if="i < 5" :d="`M62.5 ${26.5 + i * 11} h7 v7 h-7 Z`" class="spot" />
              <path :d="`M61 ${25 + i * 11} h7 v7 h-7 Z`" class="ink-line" />
              <path v-if="i < 5" :d="`M62.4 ${28.6 + i * 11} l1.8 1.8 l3.2 -4`" class="ink-line" />
              <path :d="`M73 ${28.5 + i * 11} H${92 + ((i * 7) % 12)}`" class="ink-hair" />
            </g>
          </template>
          <template v-else>
            <path d="M46 32 H114 V54 H46 Z" class="paper ink-heavy" />
            <path d="M54 40 H58 V44 H54 Z M62 40 H66 V44 H62 Z" class="spot" />
            <path d="M54 40 H58 V44 H54 Z M62 40 H66 V44 H62 Z" class="ink-hair" />
            <path d="M60 54 V98 M74 54 V98 M88 54 V98 M102 54 V98" class="ink-line" />
            <path d="M54 76 H66 V83 H54 Z M68 84 H80 V91 H68 Z M82 76 H94 V83 H82 Z M96 84 H108 V91 H96 Z" class="paper ink-hair" />
            <path d="M119.5 23.5 A20 20 0 0 1 147.5 23.5 M124.5 28.5 A13 13 0 0 1 142.5 28.5 M129.5 33.5 A6 6 0 0 1 137.5 33.5" class="spot-line" />
            <path d="M118 22 A20 20 0 0 1 146 22 M123 27 A13 13 0 0 1 141 27 M128 32 A6 6 0 0 1 136 32" class="ink-line" />
          </template>
        </svg>
      </div>
    </div>
    <figcaption class="caps">
      <span>{{ before }}</span>
      <span>{{ after }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.ba {
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.4rem;
}
/* Guidebook ink: one pen in three weights, porphyry as the only spot colour, laid a little
   off the line like a second printing; the before panel stays in the quiet ink. */
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  aspect-ratio: 4 / 3;
}
.panel svg {
  display: block;
  width: 100%;
  height: 100%;
  stroke: var(--ink);
}
.before svg {
  stroke: var(--muted);
}
.arrow-mid {
  color: var(--quiet);
  font-size: 1.1rem;
}
.caps {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.9rem;
  font: 400 0.8rem / 1.4 var(--f-mono);
  color: var(--muted);
}
.paper {
  fill: var(--surface);
}
.dashed {
  stroke-dasharray: 3 3;
}
.spot {
  fill: var(--accent);
  stroke: none;
}
.spot-line {
  fill: none;
  stroke: var(--accent);
  stroke-width: calc(var(--w-heavy) + 1px);
  vector-effect: non-scaling-stroke;
  stroke-linejoin: miter;
}
</style>
