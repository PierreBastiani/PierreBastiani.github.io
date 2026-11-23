<script setup lang="ts">
import { rng } from '@/lib/scene'

// The sea at the foot of the contact section: a band of sea ink edge to edge in the section's
// bottom padding, its surface an ink line, a few swells in the shore ink, the grain on top.
// The contact cliff runs down to the section's foot, so its foot stands in the water.
// Drawn once in px on a strip wider than any screen; `slice` crops it to the screen's width
// without scaling, so the swells keep their length at every width. Decorative.
const W = 2560
const f = (n: number) => n.toFixed(1)
const r = rng(19)
function band(h: number, rowGap: number) {
  const d: string[] = []
  for (let y = 7; y < h - 4; y += rowGap)
    for (let x = r() * 120; x < W; x += 90 + r() * 160)
      d.push(`M${f(x)} ${y}H${f(x + 10 + r() * 24)}`)
  return { h, swells: d.join(' ') }
}
// 30 px on wide screens, 18 px under 56rem, where the cliff is a thin strip too
const bands = [
  { id: 'wide', ...band(30, 8) },
  { id: 'narrow', ...band(18, 6) },
]
</script>

<template>
  <div class="sea print" aria-hidden="true">
    <svg
      v-for="b in bands"
      :key="b.id"
      :class="b.id"
      :viewBox="`0 0 ${W} ${b.h}`"
      preserveAspectRatio="xMinYMin slice"
      focusable="false"
    >
      <rect :width="W" :height="b.h" class="water" />
      <path :d="b.swells" class="ink-hair swell" />
      <path :d="`M0 0.5H${W}`" class="ink-line shore" />
    </svg>
  </div>
</template>

<style scoped>
.sea {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 30px;
  overflow: hidden;
  pointer-events: none;
}
.sea svg {
  display: block;
  width: 100%;
  height: 100%;
}
.water {
  fill: var(--sea-fill);
}
.swell {
  stroke: var(--sea-shore);
}
.shore {
  stroke: var(--ink);
}
.sea .narrow {
  display: none;
}
/* narrow screens: a thinner band, swells closer together */
@media (max-width: 56rem) {
  .sea {
    height: 18px;
  }
  .sea .wide {
    display: none;
  }
  .sea .narrow {
    display: block;
  }
}
</style>
