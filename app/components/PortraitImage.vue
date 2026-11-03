<script setup lang="ts">
// Pierre's portrait at the size it's shown, as AVIF or WebP with a JPEG fallback.
// The files in assets/portrait/ are committed derivatives (96, 208, 312 px, no metadata).
import avif96 from '@/assets/portrait/pierre-bastiani-96.avif'
import avif208 from '@/assets/portrait/pierre-bastiani-208.avif'
import avif312 from '@/assets/portrait/pierre-bastiani-312.avif'
import webp96 from '@/assets/portrait/pierre-bastiani-96.webp'
import webp208 from '@/assets/portrait/pierre-bastiani-208.webp'
import webp312 from '@/assets/portrait/pierre-bastiani-312.webp'
import jpg96 from '@/assets/portrait/pierre-bastiani-96.jpg'
import jpg208 from '@/assets/portrait/pierre-bastiani-208.jpg'
import jpg312 from '@/assets/portrait/pierre-bastiani-312.jpg'

const props = defineProps<{ size: number; alt: string }>()
const set = (a: string, b: string, c: string) => `${a} 96w, ${b} 208w, ${c} 312w`
const sizes = `${props.size}px`
</script>

<template>
  <picture class="portrait-picture">
    <source type="image/avif" :srcset="set(avif96, avif208, avif312)" :sizes="sizes" />
    <source type="image/webp" :srcset="set(webp96, webp208, webp312)" :sizes="sizes" />
    <img
      :src="size > 60 ? jpg208 : jpg96"
      :srcset="set(jpg96, jpg208, jpg312)"
      :sizes="sizes"
      :width="size"
      :height="size"
      :alt="alt"
      loading="lazy"
      decoding="async"
    />
  </picture>
</template>

<style scoped>
.portrait-picture {
  display: block;
}
</style>
