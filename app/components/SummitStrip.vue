<script setup lang="ts">
import { ridgeFacets, ridgePath, type RidgeOptions } from '@/lib/ridge'
import SummitSetup from './hero/SummitSetup.vue'

// The closing band of the page: the same view as the hero, lower and wider, at the end of the
// day, with the desk on the summit. Reuses the hero's ridge generator and summit drawing
// (imported, not edited); the ridges here are simpler copies of the hero's three hill planes,
// printed the same way: flat inks, a shadow flat per slope, the grain on top.
const far: RidgeOptions = {
  seed: 5,
  base: 574,
  amp: 8,
  scale: 0.006,
  bumps: [
    { x: 1050, height: 16, width: 150 },
    { x: 1950, height: 50, width: 340 },
  ],
}
const mid: RidgeOptions = {
  seed: 13,
  base: 642,
  amp: 12,
  scale: 0.005,
  bumps: [
    { x: 520, height: 92, width: 115 },
    { x: 1090, height: 84, width: 80 },
    { x: 1300, height: 44, width: 60 },
    { x: 1820, height: 60, width: 260 },
  ],
}
const near: RidgeOptions = {
  seed: 29,
  base: 802,
  amp: 14,
  scale: 0.005,
  bumps: [
    { x: 380, height: 116, width: 120 },
    { x: 600, height: 56, width: 90 },
    { x: 1650, height: 104, width: 170 },
  ],
}
const hills = { far: ridgePath(far), mid: ridgePath(mid), near: ridgePath(near) }
const shade = {
  far: ridgeFacets(far, { minProm: 10, smooth: 60 }),
  mid: ridgeFacets(mid, { minProm: 14, smooth: 40 }),
  near: ridgeFacets(near, { minProm: 16, smooth: 40 }),
}
</script>

<template>
  <div class="strip print" aria-hidden="true">
    <svg viewBox="-400 430 2800 570" preserveAspectRatio="xMidYMax slice" focusable="false">
      <rect x="-400" y="430" width="2800" height="150" fill="var(--sky-mid)" />
      <rect x="-400" y="494" width="2800" height="86" fill="var(--sky-low)" />
      <circle cx="1330" cy="536" r="34" fill="var(--sun)" opacity="0.3" />
      <circle cx="1330" cy="536" r="20" fill="var(--sun)" />
      <rect x="-400" y="520" width="2800" height="60" fill="var(--sea-fill)" />
      <path :d="hills.far" fill="var(--hill-far)" />
      <path :d="shade.far" fill="var(--hill-far-shade)" />
      <path :d="hills.mid" fill="var(--hill-mid)" />
      <path :d="shade.mid" fill="var(--hill-mid-shade)" />
      <path :d="hills.near" fill="var(--hill-near)" />
      <path :d="shade.near" fill="var(--hill-near-shade)" />
      <SummitSetup />
    </svg>
  </div>
</template>

<style scoped>
.strip {
  position: relative;
  height: clamp(10rem, 22vw, 19rem);
  overflow: hidden;
  /* the sky fades into the page, so the band reads as a horizon, not a picture frame */
  mask-image: linear-gradient(to bottom, transparent, #000 22%);
}
svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
