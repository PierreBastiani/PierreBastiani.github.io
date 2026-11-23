<script setup lang="ts">
import { ref } from 'vue'
import { usePress, type PressOptions } from '@/composables/usePress'

// One screened plate that the pointer presses (see composables/usePress.ts). Drop it into a
// positioned box: it fills the box, under the box's content when given a negative z-index in an
// isolated box. The plate wakes when the page's press reaches the box, or its closest `host`
// ancestor.
// Nothing renders with reduced motion, or before the page is hydrated.
const props = withDefaults(
  defineProps<{
    tile?: number
    depth?: number
    rest?: number
    ink: string
    paper?: string
    inkPress?: string
    paperPress?: string
    ground?: string
    host?: string
    avoid?: string
    windowed?: boolean
    build?: PressOptions['build']
    clip?: PressOptions['clip']
  }>(),
  { tile: 18, windowed: true },
)

const canvas = ref<HTMLCanvasElement | null>(null)
const live = usePress({
  canvas,
  host: () => {
    const box = canvas.value?.parentElement ?? null
    return props.host ? (box?.closest<HTMLElement>(props.host) ?? box) : box
  },
  tile: props.tile,
  depth: props.depth,
  rest: props.rest,
  inks: {
    ink: props.ink,
    paper: props.paper,
    inkPress: props.inkPress,
    paperPress: props.paperPress,
    ground: props.ground,
  },
  build: props.build,
  clip: props.clip,
  avoid: props.avoid,
  windowed: props.windowed,
})
</script>

<template>
  <canvas v-if="live" ref="canvas" class="press-plate" aria-hidden="true" />
</template>

<style>
/* zero specificity: the box that holds the plate places it */
:where(.press-plate) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  visibility: hidden;
}
:where(.press-plate.on) {
  visibility: visible;
}
@media (forced-colors: active) {
  :where(.press-plate) {
    display: none;
  }
}
</style>
