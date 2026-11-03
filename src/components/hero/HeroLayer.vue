<script setup lang="ts">
import { computed } from 'vue'
import { VIEW } from '@/lib/scene'

// One depth plane of the hero. It only covers the band of the scene it draws in (y0 to y0 + h,
// in scene units out of 1000), so a phone composites small layers instead of ten full-screen ones.
// depth: 0 = at the horizon (barely moves), 1 = at the viewer (moves with the page).
// still: no parallax at all (the ground edge that meets the band below must never lift).
const props = defineProps<{ y0: number; h: number; depth: number; still?: boolean }>()

const viewBox = computed(() => `${VIEW.x0} ${props.y0} ${VIEW.x1 - VIEW.x0} ${props.h}`)
const style = computed(() => ({
  top: `${props.y0 / 10}%`,
  height: `${props.h / 10}%`,
  '--depth': props.depth,
}))
</script>

<template>
  <svg class="plane" :class="{ still }" :viewBox="viewBox" :style="style" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <slot />
  </svg>
</template>

<style scoped>
.plane {
  position: absolute;
  left: 0;
  width: 100%;
  display: block;
  /* the drawing runs far past the box; let it show when the parallax shifts the box, so no
     edge of the layer behind is ever exposed (the scene clips everything) */
  overflow: visible;
  /* Far planes lag behind the scroll, near ones keep up; pointer shifts near planes the most. */
  transform: translate3d(
    calc(var(--px) * var(--depth) * -18px),
    calc(var(--scroll) * (1 - var(--depth)) * 150px + var(--py) * var(--depth) * -6px),
    0
  );
  will-change: transform;
}
.plane.still {
  transform: none;
  will-change: auto;
}
@media (prefers-reduced-motion: reduce) {
  .plane {
    transform: none;
    will-change: auto;
  }
}
</style>
