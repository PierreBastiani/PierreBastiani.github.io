<script setup lang="ts">
import { ref } from 'vue'
import { usePressPaper } from '@/composables/usePress'

// The page's own ground, pressed (see composables/usePress.ts): one canvas fixed over the
// viewport, under every section. It shows wherever the page ground does: a section with its
// own ground (the hero, the flood, the footer) covers it and prints its own plate instead.
// Its ink is the ghost wall's, a few percent into the page colour, faint enough that a dot
// under any text on the page keeps that text above 4.5:1. Nothing renders with reduced motion,
// or before the page is hydrated.
const canvas = ref<HTMLCanvasElement | null>(null)
// Its dots swell further than a plate's (0.3 of a tile, 57% of the area inked): the ink is
// capped by the text over it, so the dot's size is what makes the press read by day.
const live = usePressPaper({ canvas, tile: 18, ink: 'var(--press-paper)', depth: 0.3 })
</script>

<template>
  <canvas v-if="live" ref="canvas" class="press-paper" aria-hidden="true" />
</template>

<style>
/* z-index -1 in the page's own stacking context: over the body's colour, under every box */
.press-paper {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  visibility: hidden;
}
.press-paper.on {
  visibility: visible;
}
@media (forced-colors: active) {
  .press-paper {
    display: none;
  }
}
</style>
