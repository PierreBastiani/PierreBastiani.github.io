<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { rng } from '@/lib/scene'
import SummitSetup from './hero/SummitSetup.vue'

// A ghost of the Baou's wall along one edge of the page: a faint print behind the content,
// in the crag topo's vocabulary (the wall's edge, cracks, ledges, a lilac shade flat, the
// grain). Purely decorative: aria-hidden, no pointer events, painted under the text at a
// strength that keeps every text on top of it above 4.5:1.
//
// The host (a section, or the page) must be positioned and isolate its stacking context:
// the wall sits at z-index -1 inside it. Drawn in CSS pixels once the host is measured, so
// the wall is as tall as its host at any width.
const props = withDefaults(
  defineProps<{
    side?: 'left' | 'right'
    width?: string // CSS width of the strip on wide screens
    summitAt?: string // selector: the summit sits just above this element's top
    summitGap?: number // px between the summit line and that element
    desk?: boolean // the hero's desk and figure on the summit
    fixed?: boolean // pinned to the viewport instead of drawn along the host
    climb?: [string, string] // selectors: a climber goes from the first to the second as the page scrolls
    fadeTop?: boolean // the wall fades out upward instead of ending on a summit
    from?: string // selector: the strip starts at this element's top instead of its host's
    to?: string // selector: the strip ends at this element's bottom instead of its host's
    over?: boolean // painted over pictures too (z-index 1), for a strip that crosses the hero
    seed?: number
  }>(),
  { side: 'right', width: 'clamp(140px, 22vw, 320px)', summitGap: 120, seed: 11 },
)

const el = ref<HTMLElement | null>(null)
const size = ref<{ w: number; h: number; summit: number } | null>(null)
const progress = ref(0)
const grainHref = ref('')
const offset = ref<number | null>(null)
const length = ref<number | null>(null)

function measure() {
  const box = el.value
  if (!box) return
  if (props.from) {
    const start = document.querySelector(props.from)
    const host = box.offsetParent as HTMLElement | null
    if (start && host) offset.value = Math.round(start.getBoundingClientRect().top - host.getBoundingClientRect().top)
  }
  if (props.to) {
    const end = document.querySelector(props.to)
    const host = box.offsetParent as HTMLElement | null
    if (end && host) length.value = Math.round(end.getBoundingClientRect().bottom - host.getBoundingClientRect().top - (offset.value ?? 0))
  }
  const r = box.getBoundingClientRect()
  let summit = 0
  if (props.summitAt) {
    const anchor = document.querySelector(props.summitAt)
    const host = box.offsetParent as HTMLElement | null
    if (anchor && host) {
      const boxTop = host.getBoundingClientRect().top + (offset.value ?? 0)
      summit = Math.max(40, anchor.getBoundingClientRect().top - boxTop - props.summitGap)
    }
  }
  size.value = { w: Math.round(r.width), h: Math.round(r.height), summit }
}

// Climber: progress 0 at the first element's top, 1 at the second's, read on scroll.
let frame = 0
let reduce = false
function readScroll() {
  frame = 0
  if (!props.climb) return
  const [a, b] = props.climb.map((s) => document.querySelector(s))
  if (!a || !b) return
  const mid = window.innerHeight / 2
  const ya = a.getBoundingClientRect().top - mid
  const yb = b.getBoundingClientRect().top - mid
  progress.value = Math.min(1, Math.max(0, -ya / Math.max(1, yb - ya)))
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(readScroll)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const g = getComputedStyle(document.documentElement).getPropertyValue('--grain').trim()
  grainHref.value = g.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
  measure()
  ro = new ResizeObserver(measure)
  if (el.value) ro.observe(el.value)
  if (el.value?.offsetParent) ro.observe(el.value.offsetParent)
  document.fonts?.ready.then(measure)
  if (props.climb) {
    if (reduce) progress.value = 1 // still: he waits on the summit
    else {
      window.addEventListener('scroll', onScroll, { passive: true })
      readScroll()
    }
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})

type P = [number, number]
const path = (pts: P[], close = false) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}${close ? ' Z' : ''}`

// The wall, drawn for the right edge (the left one is its mirror): a blocky limestone edge
// facing the content, stepping in and out, with roofs; cracks running down; ledges with
// their shade; faint bedding lines; a climbing line up the middle.
const geo = computed(() => {
  const s = size.value
  if (!s || s.w < 8) return null
  const r = rng(props.seed)
  const { w: W, h: H, summit: top } = s
  const thin = W < 40
  const base = thin ? W * 0.25 : W * 0.3
  const edge: P[] = []
  let x = base + r() * W * 0.12
  let y = top + (thin ? 0 : 18)
  edge.push([x + W * 0.1, top + 4])
  edge.push([x, y])
  const ledges: { x: number; y: number }[] = []
  const roofs: P[][] = []
  while (y < H) {
    const step = 40 + r() * 80
    y = Math.min(H + 20, y + step)
    edge.push([x, y])
    if (r() < 0.22 && !thin) {
      // a roof: the edge juts toward the content, then drops
      const out = 10 + r() * 16
      roofs.push([[x, y], [x - out, y + 2]])
      x = Math.max(4, x - out)
      edge.push([x, y + 2])
    } else {
      x = Math.min(W * 0.55, Math.max(4, x + (r() - 0.45) * (thin ? 6 : 26)))
      edge.push([x, y])
    }
    if (r() < 0.5 && !thin) ledges.push({ x, y })
  }
  const outline = [[W + 2, top - 2] as P, ...edge, [W + 2, H + 20] as P]
  const wall = path(outline, true)
  // the side turned away from the low sun: a band just inside the edge
  const band = path([...edge, ...edge.map(([ex, ey]) => [ex + (thin ? 3 : 14), ey] as P).reverse()], true)
  // cracks: wandering lines down the wall, broken into lengths
  const cracks: string[] = []
  if (!thin) {
    for (const f of [0.42, 0.63, 0.84]) {
      let cx = base + (W - base) * f
      let cy = top + 30 + r() * 60
      let d = ''
      while (cy < H) {
        const len = 60 + r() * 160
        const pts: P[] = [[cx, cy]]
        for (let k = 0; k < 4; k++) {
          cx += (r() - 0.5) * 8
          cy += len / 4
          pts.push([cx, cy])
        }
        d += path(pts) + ' '
        cy += 20 + r() * 50
      }
      cracks.push(d)
    }
  }
  const ledgeLines = ledges.map(({ x: lx, y: ly }) => path([[lx, ly], [lx + 30 + r() * 50, ly - 1]])).join(' ')
  const ledgeShade = ledges.map(({ x: lx, y: ly }) => path([[lx, ly], [lx + 40, ly - 1], [lx + 36, ly + 6], [lx + 2, ly + 7]], true)).join(' ')
  const roofLines = roofs.map((p) => path(p)).join(' ')
  const bedding = thin
    ? ''
    : Array.from({ length: Math.floor((H - top) / 90) }, (_, i) => {
        const by = top + 60 + i * 90 + r() * 40
        const bx = base + (W - base) * (0.2 + r() * 0.4)
        return path([[bx, by], [bx + (W - base) * (0.15 + r() * 0.25), by + (r() - 0.5) * 3]])
      }).join(' ')
  // the summit: a flat top with the plateau's edge
  const topEdge = top > 0 && !props.fadeTop ? path([[edge[0]![0] - 6, top + 4], [W * 0.62, top - 2], [W + 2, top]]) : ''
  // the foot: the wall stands on a line of scree at the bottom of its host
  const footY = H - 2
  const foot = path([[edge[edge.length - 1]![0] - 18, footY], [W + 2, footY]])
  const scree = thin ? '' : path([[edge[edge.length - 1]![0] - 18, footY], [edge[edge.length - 1]![0] + 30, H - 16], [W + 2, H - 22], [W + 2, footY]], true)
  // a climbing line up the wall, for the climber
  const routeX = base + (W - base) * 0.5
  const route: P[] = []
  for (let ry = H - 30; ry > top + 30; ry -= 50) route.push([routeX + (r() - 0.5) * 18, ry])
  return { W, H, top, wall, band, cracks, ledgeLines, ledgeShade, roofLines, bedding, topEdge, route, foot, scree, topX: edge[0]![0] }
})

const climberAt = computed(() => {
  const g = geo.value
  if (!g || !g.route.length) return null
  const t = progress.value * (g.route.length - 1)
  const i = Math.min(g.route.length - 2, Math.floor(t))
  const a = g.route[i]!
  const b = g.route[i + 1] ?? a
  const f = t - i
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f] as P
})
const climbed = computed(() => {
  const g = geo.value
  if (!g) return ''
  const n = Math.max(1, Math.floor(progress.value * (g.route.length - 1)) + 1)
  const pts = g.route.slice(0, n)
  if (climberAt.value) pts.push(climberAt.value)
  return path(pts)
})
const routeD = computed(() => (geo.value ? path(geo.value.route) : ''))
const deskBox = computed(() => {
  const g = geo.value
  if (!g || !props.desk || g.W < 60) return null
  const w = Math.min(190, g.W * 0.8)
  const h = (w * 240) / 420
  // centred on the wall's top, never past the strip's edge; the desk's rock top (scene
  // y ≈ 736 of the 620–860 view) lands on the summit line
  const x = Math.min(g.W - w - 8, Math.max(0, (g.topX + g.W) / 2 - w / 2))
  return { x, y: g.top - h * 0.48, w, h }
})
const flip = computed(() => (props.side === 'left' && geo.value ? `translate(${geo.value.W} 0) scale(-1 1)` : undefined))
const maskId = `cliff-fade-${props.seed}-${props.side}`
</script>

<template>
  <div ref="el" class="cliff" :class="[side, { fixed, over, fade: fadeTop }]"
    :style="{ '--cliff-w': width, top: offset === null ? undefined : `${offset}px`, height: length === null ? undefined : `${length}px`, bottom: length === null ? undefined : 'auto' }" aria-hidden="true">
    <svg v-if="geo" :viewBox="`0 0 ${geo.W} ${geo.H}`" :width="geo.W" :height="geo.H" focusable="false">
      <defs>
        <pattern v-if="grainHref" :id="`${maskId}-grain`" width="220" height="220" patternUnits="userSpaceOnUse">
          <image :href="grainHref" width="220" height="220" />
        </pattern>
        <linearGradient :id="`${maskId}-g`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" />
          <stop offset="0.55" stop-color="#fff" />
          <stop offset="1" stop-color="#000" />
        </linearGradient>
        <mask v-if="deskBox" :id="maskId" maskUnits="userSpaceOnUse" :x="deskBox.x" :y="deskBox.y" :width="deskBox.w" :height="deskBox.h">
          <rect :x="deskBox.x" :y="deskBox.y" :width="deskBox.w" :height="deskBox.h" :fill="`url(#${maskId}-g)`" />
        </mask>
      </defs>
      <g :transform="flip">
        <path :d="geo.wall" class="wall" />
        <path v-if="grainHref" :d="geo.wall" :fill="`url(#${maskId}-grain)`" class="grain" />
        <path :d="geo.band" class="shade" />
        <path :d="geo.ledgeShade" class="shade" />
        <path :d="geo.bedding" class="ink-hair line faint" />
        <path v-for="(d, i) in geo.cracks" :key="i" :d="d" class="ink-hair line" />
        <path :d="geo.ledgeLines" class="ink-line line" />
        <path :d="geo.roofLines" class="ink-line line" />
        <path v-if="geo.topEdge" :d="geo.topEdge" class="ink-line line" />
        <path v-if="geo.scree" :d="geo.scree" class="shade" />
        <path :d="geo.foot" class="ink-line line" />
        <g v-if="climb">
          <path :d="routeD" class="ink-hair route" />
          <path :d="climbed" class="ink-line route-done" />
          <g v-if="climberAt" :transform="`translate(${climberAt[0].toFixed(1)} ${climberAt[1].toFixed(1)})`" class="climber">
            <path d="M-3 -2 L-6 6 M1 -2 L3 6" class="ink-line limb" />
            <path d="M-5 -14 L-8 -22 M0 -14 L3 -22" class="ink-line limb" />
            <path d="M-6 -15 H1 V-2 H-6 Z" class="body" />
            <path d="M-5.5 -16.5 L-4.9 -20 H-1.1 L-0.5 -16.5 Z" class="body" />
            <path d="M-6 -18.5 L-5 -21.6 L-2.8 -22.4 L-0.6 -21.6 L0.4 -18.5 Z" class="beanie" />
          </g>
        </g>
      </g>
      <g v-if="deskBox" :mask="`url(#${maskId})`">
        <svg :x="deskBox.x" :y="deskBox.y" :width="deskBox.w" :height="deskBox.h" viewBox="760 620 420 240">
          <SummitSetup />
        </svg>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.cliff {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: -1;
  width: var(--cliff-w);
  pointer-events: none;
  overflow: hidden;
}
.cliff.right {
  right: 0;
}
.cliff.left {
  left: 0;
}
.cliff.over {
  z-index: 1;
}
.cliff.fixed {
  position: fixed;
  top: var(--header-h);
}
.cliff.fade {
  mask-image: linear-gradient(to bottom, transparent, #000 18%);
}
.cliff svg {
  display: block;
}
/* Ghost inks: a few percent of the ghost ink, see-through, so the wall reads the same over
   the page colour or over a picture. */
.wall {
  fill: color-mix(in srgb, var(--ghost-ink) 5%, transparent);
}
.grain {
  mix-blend-mode: soft-light;
  opacity: calc(var(--grain-opacity) * 0.45);
}
.shade {
  fill: color-mix(in srgb, var(--ink-lilac) 14%, transparent);
}
.line {
  stroke: color-mix(in srgb, var(--ghost-ink) 24%, transparent);
}
.line.faint {
  stroke: color-mix(in srgb, var(--ghost-ink) 12%, transparent);
}
.route {
  stroke: color-mix(in srgb, var(--ghost-ink) 16%, transparent);
  stroke-dasharray: 3 4;
}
.route-done {
  stroke: color-mix(in srgb, var(--route) 55%, transparent);
}
.climber .body {
  fill: var(--figure);
}
.climber .limb {
  stroke: var(--figure);
}
.climber .beanie {
  fill: var(--accent);
}
/* Phones and narrow windows: only a thin strip of rock along the edge, outside the text. */
@media (max-width: 56rem) {
  .cliff {
    width: 14px;
  }
  .cliff.over {
  z-index: 1;
}
.cliff.fixed {
    display: none;
  }
}
</style>
