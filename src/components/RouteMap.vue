<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { routes, sections } from '@/content'
import {
  DZ,
  SUMMITS,
  heightAt,
  pathOf,
  project,
  ringLevel,
  ringPlan,
  routePlan,
  type Camera,
  type Pt,
  type Vec3,
} from '@/lib/topo'

// The five routes in flat-map units (1000 × 640, foot of the crag at the bottom).
const lines: Record<string, Pt[]> = {
  ship: [[600, 640], [612, 520], [590, 400], [628, 300], [640, 205]],
  build: [[760, 640], [742, 520], [770, 420], [748, 330]],
  ai: [[220, 640], [236, 560], [214, 500], [246, 438]],
  home: [[470, 640], [486, 560], [508, 480], [530, 410], [548, 352]],
  data: [[330, 640], [318, 590], [296, 540]],
}

// Plan geometry, computed once: every ring with its level, and the routes draped on the ground.
const rings = SUMMITS.flatMap((s) => Array.from({ length: s.rings }, (_, i) => ({ level: ringLevel(s, i + 1), plan: ringPlan(s, i + 1) })))
const top = Math.max(...rings.map((r) => r.level))
const byLevel = Array.from({ length: top }, (_, i) => rings.filter((r) => r.level === i + 1))

// Each route starts at the foot of the crag: the flat approach in front of it is dropped.
function drape(pts: Pt[]): Vec3[] {
  const ground = routePlan(pts).map(([x, z]) => [x, heightAt(x, z), z] as Vec3)
  const foot = Math.max(0, ground.findIndex(([, h]) => h > DZ * 0.5))
  return ground.slice(foot).map(([x, h, z]) => [x, h + 2, z])
}
const draped = Object.fromEntries(Object.entries(lines).map(([id, pts]) => [id, drape(pts)]))

const deg = (d: number) => (d * Math.PI) / 180
const clamp = (v: number, a: number) => Math.max(-a, Math.min(a, v))

// Overview: the whole crag from the south-east, a little above.
const OVERVIEW: Camera = { theta: deg(-10), phi: deg(36), distance: 2600, zoom: 1, target: [500, 0, 470], offset: [0, 0] }

function render(c: Camera) {
  return {
    levels: byLevel.map((ring, i) => {
      const level = i + 1
      return {
        t: (level / top).toFixed(3),
        index: level % 4 === 0,
        // the slab's lower outline shows as its side, the upper one as its top
        sides: ring.map((r) => pathOf(r.plan.map(([x, z]) => project([x, (level - 1) * DZ, z], c)), true)),
        tops: ring.map((r) => pathOf(r.plan.map(([x, z]) => project([x, level * DZ, z], c)), true)),
      }
    }),
    routes: Object.fromEntries(
      Object.entries(draped).map(([id, pts]) => {
        const p = pts.map((v) => project(v, c))
        return [id, { d: pathOf(p), end: p[p.length - 1]! }]
      }),
    ),
  }
}

// The viewBox is the overview's frame at every angle the camera can reach in that layout.
// Close-ups are clipped to it, so the figure never changes size.
function frameBox(turn: number, tilt: number, margin: number, top: number) {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const theta of [OVERVIEW.theta - turn, OVERVIEW.theta + turn]) {
    for (const phi of [OVERVIEW.phi - tilt, OVERVIEW.phi + tilt]) {
      for (const r of rings) {
        for (const h of [(r.level - 1) * DZ, r.level * DZ]) {
          for (const [x, z] of r.plan) {
            const [sx, sy] = project([x, h, z], { ...OVERVIEW, theta, phi })
            x0 = Math.min(x0, sx)
            x1 = Math.max(x1, sx)
            y0 = Math.min(y0, sy)
            y1 = Math.max(y1, sy)
          }
        }
      }
    }
  }
  return {
    x: Math.floor(x0 - margin),
    y: Math.floor(y0 - margin - top),
    w: Math.ceil(x1 - x0 + 2 * margin),
    h: Math.ceil(y1 - y0 + 2 * margin + top),
  }
}
// Beside the list (desktop): room for the pointer to turn the crag. Pinned above the list
// (phones): only the scroll turns it, so the box hugs the model and leaves no empty band.
// The extra room at the top keeps the summit's tag inside the frame.
const WIDE = frameBox(deg(14), deg(5), 16, 24)
const TIGHT = frameBox(deg(5), 0, 6, 90)
const box = ref(WIDE)
let narrow = false // set on mount: the map is pinned above the list
const viewBox = computed(() => `${box.value.x} ${box.value.y} ${box.value.w} ${box.value.h}`)

// Close-up on one route: look at the middle of the climb, turn so it faces the viewer,
// come down a little to show the height, zoom in, and put it in the middle of the frame.
function shotOf(id: string): Camera {
  const pts = draped[id]!
  const [fx, fh, fz] = pts[0]!
  const [tx, th, tz] = pts[pts.length - 1]!
  const theta = clamp(Math.atan2(tx - fx, fz - tz), deg(28))
  return {
    theta,
    phi: deg(28),
    distance: OVERVIEW.distance,
    zoom: narrow ? 1.15 : 1.45, // pinned on a phone the crag isn't clipped, so it zooms less
    target: [(fx + tx) / 2, (fh + th) / 2, (fz + tz) / 2],
    offset: [box.value.x + box.value.w / 2, box.value.y + box.value.h / 2],
  }
}

const cam: Camera = { ...OVERVIEW, target: [...OVERVIEW.target], offset: [...OVERVIEW.offset] }
let aim: Camera = { ...cam }
const frame = shallowRef(render(cam))

// Three sources of highlight, in order: the list (mouse hover, keyboard focus), the map
// (mouse on a route), and reading (on touch or when the map is pinned above the list, the
// item crossing a line just under the map). A map highlight holds until the pointer leaves
// the whole map or settles on another route, so the camera moving the route away from the
// pointer can't toggle it.
const fromList = ref<string | null>(null)
const fromMap = ref<string | null>(null)
const fromScroll = ref<string | null>(null)
const active = computed(() => fromList.value ?? fromMap.value ?? fromScroll.value)
const map = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const pinned = ref(false) // phones: the map is stuck under the header with the list below
const drawn = ref(true)

// Grades sit in HTML pills over the figure, so they keep a readable size on a phone.
// The active one also carries the skill's name.
const pills = computed(() =>
  routes.map((r) => {
    const [x, y] = frame.value.routes[r.id]!.end
    const b = box.value
    return { id: r.id, name: r.name, grade: r.grade, left: `${((x - b.x) / b.w) * 100}%`, top: `${((y - b.y) / b.h) * 100}%` }
  }),
)

// The camera eases toward its aim and stops once it gets there: nothing runs while idle.
let raf = 0
let reduce = false
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
function step() {
  raf = 0
  const k = 0.085 // about 700 ms to settle at 60 fps
  cam.theta = lerp(cam.theta, aim.theta, k)
  cam.phi = lerp(cam.phi, aim.phi, k)
  cam.zoom = lerp(cam.zoom, aim.zoom, k)
  cam.target = cam.target.map((v, i) => lerp(v, aim.target[i]!, k)) as Vec3
  cam.offset = cam.offset.map((v, i) => lerp(v, aim.offset[i]!, k)) as Pt
  frame.value = render(cam)
  const far =
    Math.abs(aim.theta - cam.theta) > 1e-4 ||
    Math.abs(aim.phi - cam.phi) > 1e-4 ||
    Math.abs(aim.zoom - cam.zoom) > 1e-4 ||
    cam.target.some((v, i) => Math.abs(v - aim.target[i]!) > 0.05) ||
    cam.offset.some((v, i) => Math.abs(v - aim.offset[i]!) > 0.05)
  if (far) raf = requestAnimationFrame(step)
}

let pointer = { x: 0, y: 0 }
let scrollTurn = 0
function retarget() {
  const base = active.value ? shotOf(active.value) : OVERVIEW
  const sway = active.value ? 0.35 : 1 // a close-up only sways a little with the pointer
  aim = {
    ...base,
    theta: base.theta + clamp(scrollTurn + pointer.x * deg(14), deg(14)) * sway,
    phi: base.phi - pointer.y * deg(5) * sway,
  }
  if (reduce) {
    Object.assign(cam, { ...aim, target: [...aim.target], offset: [...aim.offset] })
    frame.value = render(cam)
    return
  }
  if (!raf) raf = requestAnimationFrame(step)
}
watch(active, retarget)

// Map highlight. Only real pointer movement counts (Chrome also fires pointer events when the
// scene moves under a still pointer), only after the pointer has stayed on a route for a
// moment, and never while the camera is still easing.
let candidate: string | null = null
let dwell = 0
function routeUnder(e: PointerEvent) {
  return (e.target as Element | null)?.closest<HTMLElement | SVGElement>('[data-route]')?.dataset.route ?? null
}
function onPointer(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  if (!reduce) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    pointer = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 }
    retarget()
  }
  if (!e.movementX && !e.movementY) return
  const id = routeUnder(e)
  if (!id || id === fromMap.value || raf) {
    candidate = null
    clearTimeout(dwell)
    return
  }
  if (id === candidate) return
  candidate = id
  clearTimeout(dwell)
  dwell = window.setTimeout(() => {
    if (candidate === id && !raf) fromMap.value = id
    candidate = null
  }, 150)
}
function onLeave() {
  clearTimeout(dwell)
  candidate = null
  fromMap.value = null
  if (reduce) return
  pointer = { x: 0, y: 0 }
  retarget()
}

// Scrolling draws the routes on once the map is in view, and turns the crag a few degrees
// while it is on screen.
function onScroll() {
  if (!map.value) return
  const r = map.value.getBoundingClientRect()
  const h = window.innerHeight
  pinned.value = narrow && Math.abs(r.top - (parseFloat(getComputedStyle(map.value).top) || 0)) < 1
  if (reduce || r.bottom < 0 || r.top > h) return
  if (!drawn.value && r.top < h * 0.85) drawn.value = true
  scrollTurn = -((r.top + r.height / 2) / h - 0.5) * deg(10)
  retarget()
}

// List events. Mouse hover only on a hover-capable fine pointer (touch fires compatibility
// mouse events on tap), focus only from the keyboard, and a tap goes to reading directly.
let fine = true
function onItemEnter(id: string) {
  if (fine) fromList.value = id
}
function onItemLeave() {
  if (fine) fromList.value = null
}
function onItemFocus(id: string, e: FocusEvent) {
  if ((e.target as Element).matches(':focus-visible')) fromList.value = id
}
function onItemTap(id: string) {
  if (reading) fromScroll.value = id
}

// Reading: a 2 px line a little below the pinned map, where the eye lands on the list, so the
// active item's heading is still in view. The item crossing it becomes active and
// stays active through the gap to the next item, so boundaries never flicker. Above the first
// item the crag goes back to the overview; after the last one it keeps the last route.
let reading: IntersectionObserver | null = null
let resizeTimer = 0
function watchReading() {
  reading?.disconnect()
  reading = null
  const on = window.matchMedia('(max-width: 52rem), (hover: none), (pointer: coarse)').matches
  if (!on || !map.value || !list.value) {
    fromScroll.value = null
    return
  }
  const pinnedTop = parseFloat(getComputedStyle(map.value).top) || 0
  const below = pinnedTop + map.value.offsetHeight
  const line = Math.round(below + Math.min(120, 0.25 * (window.innerHeight - below)))
  const items = [...list.value.children] as HTMLElement[]
  reading = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.route!
        if (e.isIntersecting) fromScroll.value = id
        else if (e.target === items[0] && id === fromScroll.value && e.boundingClientRect.top >= line) fromScroll.value = null
      }
    },
    { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 2)}px 0px` },
  )
  items.forEach((el) => reading!.observe(el))
}
// Pick the frame for the layout, then place the reading line under the map's new height.
async function layout() {
  narrow = window.matchMedia('(max-width: 52rem)').matches
  box.value = narrow ? TIGHT : WIDE
  await nextTick()
  watchReading()
  retarget()
  onScroll()
}
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(layout, 150)
}

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!reduce && map.value) drawn.value = map.value.getBoundingClientRect().top < window.innerHeight * 0.85
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  layout()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  reading?.disconnect()
  cancelAnimationFrame(raf)
  clearTimeout(dwell)
  clearTimeout(resizeTimer)
})
</script>

<template>
  <section id="competences" class="routes" aria-labelledby="routes-title">
    <div class="wrap grid">
      <header class="head section-head">
        <p class="eyebrow">{{ sections.skills.label }}</p>
        <h2 id="routes-title">
          {{ sections.skills.title }}
          <span class="quiet">{{ sections.skills.quiet }}</span>
        </h2>
        <p class="sub">{{ sections.skills.sub }}</p>
      </header>

      <figure ref="map" class="map" :class="{ drawn, pinned, focused: !!active }" @pointermove="onPointer" @pointerleave="onLeave">
        <div class="stage">
          <svg :viewBox="viewBox" role="img" aria-labelledby="map-title">
            <title id="map-title">Falaise en relief à deux sommets, avec cinq voies, une par compétence</title>
            <g v-for="(lv, i) in frame.levels" :key="i" class="level" :class="{ index: lv.index }" :style="{ '--t': lv.t }">
              <path v-for="(d, j) in lv.sides" :key="'s' + j" class="side" :d="d" />
              <path v-for="(d, j) in lv.tops" :key="'e' + j" class="edge" :d="d" />
              <path v-for="(d, j) in lv.tops" :key="'t' + j" class="top" :d="d" />
            </g>
            <g
              v-for="r in routes"
              :key="r.id"
              class="route"
              :class="{ on: active === r.id, dim: active && active !== r.id }"
              :data-route="r.id"
            >
              <path class="hit" :d="frame.routes[r.id]!.d" />
              <path class="casing" :d="frame.routes[r.id]!.d" pathLength="1" />
              <path class="line" :d="frame.routes[r.id]!.d" pathLength="1" />
              <circle class="end" :cx="frame.routes[r.id]!.end[0]" :cy="frame.routes[r.id]!.end[1]" r="11" />
            </g>
          </svg>
          <span
            v-for="p in pills"
            :key="p.id"
            class="pill"
            :class="{ on: active === p.id, dim: active && active !== p.id }"
            :style="{ left: p.left, top: p.top }"
            :data-route="p.id"
            aria-hidden="true"
            ><span v-if="active === p.id" class="name">{{ p.name }} · </span><span class="grade">{{ p.grade }}</span></span
          >
        </div>
      </figure>

      <ol ref="list" class="list">
        <li
          v-for="r in routes"
          :key="r.id"
          :class="{ on: active === r.id }"
          :data-route="r.id"
          @mouseenter="onItemEnter(r.id)"
          @mouseleave="onItemLeave"
          @focusin="onItemFocus(r.id, $event)"
          @focusout="fromList = null"
          @click="onItemTap(r.id)"
        >
          <h3>{{ r.name }} <span class="g" translate="no">{{ r.grade }}</span></h3>
          <p class="stack">{{ r.stack }}</p>
          <p class="proj">
            <a v-if="r.project.href" :href="r.project.href">{{ r.project.label }}<span aria-hidden="true">&nbsp;↗</span></a>
            <template v-else>{{ r.project.label }}</template>
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.routes {
  padding-block: var(--space-section);
}
.grid {
  display: grid;
  gap: 0 clamp(3rem, 6vw, 6rem);
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  grid-template-areas: 'head head' 'map list';
  align-items: start;
}
.head {
  grid-area: head;
}
.map {
  grid-area: map;
  margin: 0;
  position: sticky;
  top: calc(var(--header-h) + 2rem);
}
.stage {
  position: relative;
  overflow: hidden;
}
.map svg {
  display: block;
  width: 100%;
  height: auto;
  /* close-ups run past the frame: fade its edges instead of cutting the crag with a straight line */
  --fade: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent),
    linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent);
  -webkit-mask-image: var(--fade);
  -webkit-mask-composite: source-in;
  mask-image: var(--fade);
  mask-composite: intersect;
}
/* the crag: each contour level is a slab, its side in shadow, its top lighter as it climbs */
.side {
  fill: var(--topo-side);
}
.edge {
  fill: none;
  stroke: var(--topo-edge);
  stroke-width: 2px;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.level.index .edge {
  stroke-width: 3.2px;
}
.top {
  fill: var(--topo-low);
}
@supports (fill: color-mix(in srgb, red 50%, blue)) {
  .top {
    fill: color-mix(in srgb, var(--topo-high) calc(var(--t) * 100%), var(--topo-low));
  }
}
/* routes: a solid line on a casing of the surface colour, so it reads over every contour */
.route .hit {
  fill: none;
  stroke: transparent;
  stroke-width: 28px;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  pointer-events: stroke;
}
.route .casing,
.route .line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition:
    stroke-dashoffset 1.6s cubic-bezier(0.3, 0.7, 0.2, 1),
    stroke 0.2s;
}
.route .casing {
  stroke: var(--route-casing);
  stroke-width: 8px;
}
.route .line {
  stroke: var(--route);
  stroke-width: 4px;
}
.map.drawn .route .casing,
.map.drawn .route .line {
  stroke-dashoffset: 0;
}
.route .end {
  fill: var(--route);
  stroke: var(--route-casing);
  stroke-width: 3px;
  vector-effect: non-scaling-stroke;
  transition: fill 0.2s;
}
.route {
  transition: opacity 0.3s;
}
.route.on .line {
  stroke: var(--accent);
}
.route.on .end {
  fill: var(--accent);
}
.route.dim,
.pill.dim {
  opacity: 0.22;
}
/* grade tags: page-colour text on the route colour, on-accent text on the accent when active */
.pill {
  position: absolute;
  transform: translate(0.75rem, -50%);
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: var(--route);
  color: var(--bg);
  font: 600 0.78rem / 1.2 var(--f-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: default;
  transition:
    opacity 0.3s,
    background-color 0.2s,
    color 0.2s;
}
.pill.on {
  z-index: 1;
  transform: translate(-50%, calc(-100% - 0.6rem));
  padding: 0.2rem 0.6rem;
  background: var(--accent);
  color: var(--on-accent);
}
.pill .name {
  font: 600 0.8rem / 1.2 var(--f-body);
}
.list {
  grid-area: list;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(2rem, 3.5vw, 2.75rem);
}
.list li {
  display: grid;
  gap: 0.35rem;
}
.list h3 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  transition: color 0.2s;
}
.g {
  font: 500 0.8em var(--f-mono);
  color: var(--muted);
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s;
}
.list li.on .g {
  color: var(--accent-text);
}
.stack {
  color: var(--muted);
}
.proj {
  margin-top: 0.15rem;
  font-weight: 500;
}
@media (max-width: 52rem) {
  .grid {
    grid-template-columns: 1fr;
    grid-template-areas: 'head' 'map' 'list';
    gap: 3rem;
  }
  /* Pinned under the header with no background: the list shows through the empty parts and
     passes behind the crag, which keeps a soft halo of the page colour around it. */
  .map {
    position: sticky;
    top: var(--header-h);
    z-index: 1;
  }
  .map.pinned {
    pointer-events: none; /* taps reach the list links behind; the map needs none on a phone */
  }
  .map.pinned .stage {
    overflow: visible;
  }
  .map.pinned svg {
    overflow: visible;
    -webkit-mask-image: none;
    mask-image: none;
    filter: drop-shadow(0 0 1px var(--bg)) drop-shadow(0 0 10px var(--bg));
  }
  /* Behind the model, in the page colour: a cover from the top of the screen down to the map
     (nothing shows through the translucent header), then a wash over the map that is solid
     behind the crag's mass and fades out toward its foot. List text scrolling up dissolves as
     it passes behind the model and is crisp again below it. CSS only, nothing runs per frame. */
  .map.pinned::before,
  .map.pinned::after {
    content: '';
    position: absolute;
    left: calc(-1 * var(--gutter));
    right: calc(-1 * var(--gutter-r));
    z-index: -1;
    pointer-events: none;
  }
  .map.pinned::before {
    bottom: 100%;
    height: calc(var(--header-h) + 1px);
    background: var(--bg);
  }
  .map.pinned::after {
    top: 0;
    bottom: -1.5rem;
    background: linear-gradient(var(--bg) 55%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .route .casing,
  .route .line {
    transition: none;
    stroke-dashoffset: 0;
  }
  .route,
  .pill {
    transition: none;
  }
}
</style>
