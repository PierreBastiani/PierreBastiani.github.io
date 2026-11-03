<script setup lang="ts">
// The PB mark: two stems and one half-disc used three times, drawn on a 32-unit grid
// (the master SVGs and their rules live outside this repo). The viewBox crops to the letters,
// 28 × 24 units, so at 24 px tall one unit is one pixel and every straight edge is crisp.
// Decorative: the link around it carries the name.
</script>

<template>
  <svg class="brand-mark" viewBox="2 4 28 24" aria-hidden="true">
    <path
      d="M2 4H6V28H2Z M18 4H22V28H18Z M8 4A6 6 0 0 1 8 16Z M24 4A6 6 0 0 1 24 16Z M24 16A6 6 0 0 1 24 28Z"
    />
  </svg>
</template>

<style scoped>
.brand-mark {
  flex: none;
  display: block;
  height: 1.5rem;
  width: auto;
  aspect-ratio: 28 / 24;
  fill: currentColor;
}
</style>
