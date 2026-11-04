<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { logbook, routes, sections } from '@/content'
import {
  DEPTH,
  FAR_HILLS,
  GROUND,
  PINES,
  PLATEAU,
  ROUTE_LINES,
  SCENE,
  SCREE,
  SCREE_SHADE,
  WALL,
  WALL_FLATS,
  bolts,
  pathOf,
  smooth,
  type Pt,
} from '@/lib/crag'

// The five routes on the Baou's south face, drawn once in wall coordinates: the line, its
// bolts, its foot and its top anchor. Only the camera's transforms change afterwards.
const lines = Object.fromEntries(
  Object.entries(ROUTE_LINES).map(([id, pts]) => {
    const line = smooth(pts)
    return [id, { d: pathOf(line), ticks: bolts(line), start: line[0]!, end: line[line.length - 1]! }]
  }),
)

// The legend's grade span, easiest to hardest (French grades sort as strings).
const grades = routes.map((r) => r.grade).sort()
const span = `${grades[0]}–${grades[grades.length - 1]}`

// The camera: the point of the wall at the centre of the frame, a zoom, and a sway (pointer,
// scroll) that only shifts the sky and the foreground against the wall: that's the depth.
interface Camera {
  x: number
  y: number
  zoom: number
  sx: number
  sy: number
}
const C = { x: SCENE.w / 2, y: SCENE.h / 2 }
const OVERVIEW: Camera = { x: C.x, y: C.y, zoom: 1, sx: 0, sy: 0 }
const box = ref({ x: 0, y: 0, w: SCENE.w, h: SCENE.h })
const viewBox = computed(() => `${box.value.x} ${box.value.y} ${box.value.w} ${box.value.h}`)
let narrow = false // set on mount: the map is pinned above the list

function plane(c: Camera, depth: number) {
  const ox = C.x + (c.x - C.x) * depth + c.sx * (depth - 1)
  const oy = C.y + (c.y - C.y) * depth + c.sy * (depth - 1)
  return `translate(${C.x} ${C.y}) scale(${c.zoom.toFixed(4)}) translate(${(-ox).toFixed(2)} ${(-oy).toFixed(2)})`
}
const onWall = (c: Camera, [x, y]: Pt): Pt => [(x - c.x) * c.zoom + C.x, (y - c.y) * c.zoom + C.y]
function render(c: Camera) {
  return {
    far: plane(c, DEPTH.far),
    wall: plane(c, DEPTH.wall),
    near: plane(c, DEPTH.near),
    ends: Object.fromEntries(Object.entries(lines).map(([id, l]) => [id, { start: onWall(c, l.start), end: onWall(c, l.end) }])),
  }
}

// Keep the frame on the drawing: the camera can't pan past the wall's edges at its zoom.
function inFrame(c: Camera): Camera {
  const hw = C.x / c.zoom
  const hh = C.y / c.zoom
  return { ...c, x: Math.min(SCENE.w - hw, Math.max(hw, c.x)), y: Math.min(SCENE.h - hh, Math.max(hh, c.y)) }
}

// Close-up on one route: centre it, zoom in, and keep its top anchor low enough that its
// tag stays in the frame.
function shotOf(id: string): Camera {
  const pts = ROUTE_LINES[id]!
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const top = Math.min(...ys)
  const foot = Math.max(...ys)
  // close enough to read the route, never so close its foot or its tag leaves the frame
  const zoom = Math.min(narrow ? 1.2 : 1.3, (SCENE.h - 150) / (foot - top))
  let y = (top + foot) / 2
  // room above the anchor for the open tag, counted from the top of the visible crop (a phone
  // crops the plate's top, and its tag is bigger against a smaller plate)
  y = Math.min(y, top + (C.y - box.value.y - (narrow ? 100 : 70)) / zoom)
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y, zoom, sx: 0, sy: 0 }
}

const cam: Camera = { ...OVERVIEW }
let aim: Camera = { ...cam }
const frame = shallowRef(render(cam))

// Three sources of highlight, in order: the list (mouse hover, keyboard focus), the map
// (mouse on a route), and reading (on touch or when the map is pinned above the list, the
// item crossing a line just under the map). A map highlight holds until the pointer leaves
// the whole map or settles on another route, so the camera moving the route away from the
// pointer can't toggle it.
const fromList = ref<string | null>(null)
const fromMap = ref<string | null>(null)
const firstReadable = ref<string | null>(null) // reading: first heading fully in view below the map
const tapped = ref<string | null>(null) // a tap wins until reading moves on
const readingOn = ref(false)
const fromScroll = computed(() => {
  if (!readingOn.value) return null
  if (narrow && !pinned.value) return null // before the map pins, the reader is on the intro
  return tapped.value ?? firstReadable.value
})
const active = computed(() => fromList.value ?? fromMap.value ?? fromScroll.value)
const map = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
// Phones: the map is stuck under the header with the list below (or past that, leaving with
// the end of the section). While the section is under the header, a cover fixed to the top of
// the screen keeps anything from showing through the translucent header.
const pinned = ref(false)
const coverOn = ref(false)
const section = ref<HTMLElement | null>(null)
const drawn = ref(true)

// Grades sit in HTML tags over the figure, so they keep a readable size on a phone: the
// grade at the top anchor (with the skill's name when active), the route number at the foot.
const pct = ([x, y]: Pt) => ({ left: `${((x - box.value.x) / box.value.w) * 100}%`, top: `${((y - box.value.y) / box.value.h) * 100}%` })
// --f: where the anchor sits across the plate (0 left, 1 right); the open tag slides by as
// much of its own width, so near an edge it opens inward instead of being cut by the frame.
const pills = computed(() =>
  routes.map((r) => {
    const end = frame.value.ends[r.id]!.end
    const f = Math.min(1, Math.max(0, (end[0] - box.value.x) / box.value.w))
    return { id: r.id, name: r.name, grade: r.grade, f: f.toFixed(3), ...pct(end) }
  }),
)
const feet = computed(() => routes.map((r, i) => ({ id: r.id, n: i + 1, ...pct(frame.value.ends[r.id]!.start) })))

// The camera eases toward its aim and stops once it gets there: nothing runs while idle.
let raf = 0
let reduce = false
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
function step() {
  raf = 0
  const k = 0.085 // about 700 ms to settle at 60 fps
  for (const key of ['x', 'y', 'zoom', 'sx', 'sy'] as const) cam[key] = lerp(cam[key], aim[key], k)
  frame.value = render(cam)
  const far = (['x', 'y', 'sx', 'sy'] as const).some((key) => Math.abs(aim[key] - cam[key]) > 0.05) || Math.abs(aim.zoom - cam.zoom) > 1e-4
  if (far) raf = requestAnimationFrame(step)
}

// The camera is re-framing (a highlight changed), as opposed to only swaying with the pointer.
const reframing = () =>
  Math.abs(aim.zoom - cam.zoom) > 0.002 || Math.abs(aim.x - cam.x) > 1.5 || Math.abs(aim.y - cam.y) > 1.5

let pointer = { x: 0, y: 0 }
let scrollShift = 0
function retarget() {
  const base = active.value ? shotOf(active.value) : OVERVIEW
  const sway = active.value ? 0.35 : 1 // a close-up only sways a little with the pointer
  aim = inFrame({ ...base, sx: pointer.x * 22 * sway, sy: (pointer.y * 10 + scrollShift) * sway })
  if (reduce) {
    Object.assign(cam, aim)
    frame.value = render(cam)
    return
  }
  if (!raf) raf = requestAnimationFrame(step)
}
watch(active, retarget)

// Map highlight. Only real pointer movement counts (Chrome also fires pointer events when the
// scene moves under a still pointer), only after the pointer has stayed on a route for a
// moment, and never while the camera is still re-framing (the sway alone doesn't count: it
// follows every pointer move, so it would block the highlight for good).
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
  if (!id || id === fromMap.value || reframing()) {
    candidate = null
    clearTimeout(dwell)
    return
  }
  if (id === candidate) return
  candidate = id
  clearTimeout(dwell)
  dwell = window.setTimeout(() => {
    if (candidate === id && !reframing()) fromMap.value = id
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
  const stickyTop = parseFloat(getComputedStyle(map.value).top) || 0
  pinned.value = narrow && r.top <= stickyTop + 0.5
  const sr = section.value?.getBoundingClientRect()
  coverOn.value = narrow && !!sr && sr.top < stickyTop && sr.bottom > 0
  if (reduce || r.bottom < 0 || r.top > h) return
  if (!drawn.value && r.top < h * 0.85) drawn.value = true
  scrollShift = -((r.top + r.height / 2) / h - 0.5) * 40
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
  if (readingOn.value) tapped.value = id
}

// Reading: the active item is the first one whose heading is fully visible below the pinned
// map and its band. The observer's root starts at the rule under that band; every heading that
// becomes or stops being fully visible reports, and the answer is recomputed from all of them,
// so a fast fling can't skip an item. Above the first item the crag shows the overview (the
// map isn't pinned yet); after the last one it keeps the last route.
const FADE = 13 // px of opaque band and its rule below the map (--band-foot, .map.pinned::after)
let reading: IntersectionObserver | null = null
let resizeTimer = 0
const readable = new Set<number>()
function watchReading() {
  reading?.disconnect()
  reading = null
  readable.clear()
  readingOn.value = window.matchMedia('(max-width: 52rem), (hover: none), (pointer: coarse)').matches
  if (!readingOn.value || !map.value || !list.value) return
  const pinnedTop = parseFloat(getComputedStyle(map.value).top) || 0
  const line = Math.round(pinnedTop + map.value.offsetHeight + FADE)
  const heads = [...list.value.querySelectorAll('h3')]
  reading = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const i = heads.indexOf(e.target as HTMLHeadingElement)
        if (e.isIntersecting && e.intersectionRatio > 0.99) readable.add(i)
        else readable.delete(i)
      }
      if (!readable.size) return
      const id = routes[Math.min(...readable)]!.id
      if (id !== firstReadable.value) {
        firstReadable.value = id
        tapped.value = null
      }
    },
    { rootMargin: `-${line}px 0px 0px 0px`, threshold: [0, 1] },
  )
  heads.forEach((el) => reading!.observe(el))
}
// Pick the frame for the layout, then place the reading line under the map's new height.
async function layout() {
  narrow = window.matchMedia('(max-width: 52rem)').matches
  // pinned on a phone the plate is cropped to the wall, so the list keeps most of the screen
  box.value = narrow ? { x: 40, y: 60, w: 920, h: 560 } : { x: 0, y: 0, w: SCENE.w, h: SCENE.h }
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
  <section id="competences" ref="section" class="routes" aria-labelledby="routes-title">
    <div class="header-cover" :class="{ on: coverOn }" aria-hidden="true"></div>
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
        <!-- the topo, printed: ink frame with an inner rule, a lettering band, the plate with
             the grain of the hero, and a legend line under it -->
        <div class="stage">
          <p class="band" aria-hidden="true">
            <span>{{ logbook.place }}</span><span>Face sud · {{ routes.length }} voies</span>
          </p>
          <div class="plate print">
          <svg :viewBox="viewBox" role="img" aria-labelledby="map-title">
            <title id="map-title">La face sud du Baou, avec cinq voies, une par compétence</title>
            <!-- sky and far hills -->
            <g :transform="frame.far">
              <rect x="-400" y="-400" width="1800" height="1400" class="sky" />
              <path :d="FAR_HILLS" class="far-hills" />
            </g>
            <!-- the wall: plateau, the face and its flats, the scree -->
            <g :transform="frame.wall">
              <path :d="PLATEAU" class="plateau" />
              <path :d="WALL" class="wall" />
              <path v-for="([d, role], i) in WALL_FLATS" :key="i" :d="d" :class="role" />
              <path :d="SCREE" class="scree" />
              <path v-for="(d, i) in SCREE_SHADE" :key="'s' + i" :d="d" class="shade" />
            </g>
            <!-- the foreground: garrigue and two pines -->
            <g :transform="frame.near">
              <path :d="GROUND" class="ground" />
              <template v-for="(t, i) in PINES" :key="'p' + i">
                <path :d="t.trunk" class="trunk" />
                <path :d="t.crown" class="crown" />
                <path :d="t.lit" class="crown-lit" />
              </template>
            </g>
            <!-- the routes, on the wall's plane -->
            <g :transform="frame.wall">
              <g
                v-for="r in routes"
                :key="r.id"
                class="route"
                :class="{ on: active === r.id, dim: active && active !== r.id }"
                :data-route="r.id"
              >
                <path class="hit" :d="lines[r.id]!.d" />
                <path class="casing" :d="lines[r.id]!.d" pathLength="1" />
                <path class="line" :d="lines[r.id]!.d" pathLength="1" />
                <path class="bolts" :d="lines[r.id]!.ticks" />
                <circle class="end" :cx="lines[r.id]!.end[0]" :cy="lines[r.id]!.end[1]" r="8" />
                <circle class="end-dot" :cx="lines[r.id]!.end[0]" :cy="lines[r.id]!.end[1]" r="3.2" />
              </g>
            </g>
          </svg>
          <span
            v-for="f in feet"
            :key="'n' + f.id"
            class="num"
            :class="{ on: active === f.id, dim: active && active !== f.id }"
            :style="{ left: f.left, top: f.top }"
            aria-hidden="true"
            >{{ f.n }}</span
          >
          <span
            v-for="p in pills"
            :key="p.id"
            class="pill"
            :class="{ on: active === p.id, dim: active && active !== p.id }"
            :style="{ left: p.left, top: p.top, '--f': p.f }"
            :data-route="p.id"
            aria-hidden="true"
            ><span v-if="active === p.id" class="name">{{ p.name }} · </span><span class="grade">{{ p.grade }}</span></span
          >
          </div>
          <p class="legend" aria-hidden="true">
            <span><i class="key-num">1</i>Départ</span>
            <span
              ><svg class="key-ring" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.4" /><circle cx="8" cy="8" r="2.6" class="dot" /></svg
              >Relais</span
            >
            <span><i class="key-grade">{{ span }}</i>Cotations</span>
          </p>
        </div>
      </figure>

      <!-- the route sheet: the guidebook's table under the topo, one ruled row per route -->
      <div class="sheet">
        <p class="band cols" aria-hidden="true"><span>N°</span><span>Voie</span><span>Cot.</span></p>
        <ol ref="list" class="list">
          <li
            v-for="(r, i) in routes"
            :key="r.id"
            :class="{ on: active === r.id }"
            :data-route="r.id"
            @mouseenter="onItemEnter(r.id)"
            @mouseleave="onItemLeave"
            @focusin="onItemFocus(r.id, $event)"
            @focusout="fromList = null"
            @click="onItemTap(r.id)"
          >
            <span class="n" aria-hidden="true">{{ i + 1 }}</span>
            <div class="what">
              <h3>{{ r.name }}</h3>
              <p class="stack">{{ r.stack }}</p>
              <p class="proj">
                <a v-if="r.project.href" :href="r.project.href">{{ r.project.label }}<span aria-hidden="true">&nbsp;↗</span></a>
                <template v-else>{{ r.project.label }}</template>
              </p>
            </div>
            <span class="g" translate="no"><span class="visually-hidden">Cotation </span>{{ r.grade }}</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.routes {
  padding-top: var(--space-section);
}
.grid {
  display: grid;
  gap: 0 clamp(2rem, 4vw, 3.5rem);
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
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
/* The printed object: ink frame, a paper margin, an inner rule round the plate. Close-ups
   run past the plate's edge and are cut straight, as on a print. */
.stage {
  position: relative;
  padding: 4px;
  border: 1.5px solid var(--ink);
  background: var(--surface);
}
.plate {
  overflow: hidden;
  outline: 1px solid var(--ink);
}
/* the lettering band shared by the plate and the sheet: the poster's band, in mono caps */
.band {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  padding: 0.45rem 0.9rem;
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.stage .band {
  flex-wrap: wrap;
  gap: 0.1rem 1rem;
  margin-bottom: 4px;
}
.stage .band span {
  white-space: nowrap;
}
/* the legend under the plate: the same symbols as on it */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.5rem;
  margin: 0;
  padding: 0.55rem 0.5rem 0.3rem;
  font: 500 0.7rem / 1.3 var(--f-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.legend i {
  font-style: normal;
}
.key-num {
  min-width: 1.15rem;
  padding: 0.05rem 0.25rem;
  border: 1.5px solid var(--route);
  background: var(--route-casing);
  color: var(--route);
  font-weight: 600;
  text-align: center;
  letter-spacing: 0;
}
.key-ring {
  width: 1rem;
  height: 1rem;
  fill: var(--route-casing);
  stroke: var(--route);
  stroke-width: var(--w-line);
}
.key-ring .dot {
  fill: var(--route);
  stroke: none;
}
.key-grade {
  padding: 0.05rem 0.35rem;
  text-transform: none;
  background: var(--route);
  color: var(--bg);
  font-weight: 600;
  letter-spacing: 0;
}
.header-cover {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  z-index: 19;
  background: var(--bg);
  pointer-events: none;
}
.plate > svg {
  display: block;
  width: 100%;
  height: auto;
}
/* the plate: the hero's inks, flat, the low sun from the right */
.sky {
  fill: var(--sky-top);
}
.far-hills {
  fill: var(--hill-far);
}
.plateau {
  fill: var(--hill-mid);
}
.wall {
  fill: var(--rock);
}
.shade {
  fill: var(--rock-shade);
}
.lit {
  fill: var(--rock-lit);
}
.glow {
  fill: color-mix(in srgb, var(--rock-lit) 60%, var(--rock));
}
.deep {
  fill: var(--rock-crack);
}
.streak {
  fill: var(--rock-shade);
  opacity: 0.35;
}
.scree {
  fill: color-mix(in srgb, var(--rock) 70%, var(--rock-shade));
}
.ground {
  fill: var(--hill-near);
}
.trunk {
  fill: var(--trunk);
}
.crown {
  fill: var(--pine);
}
.crown-lit {
  fill: var(--pine-lit);
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
  stroke-linecap: butt;
  stroke-linejoin: miter;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition:
    stroke-dashoffset var(--dur-draw) var(--ease-draw),
    stroke var(--dur-hover);
}
.route .casing {
  stroke: var(--route-casing);
  stroke-width: calc(var(--w-heavy) + 4px);
}
.route .line {
  stroke: var(--route);
  stroke-width: var(--w-heavy);
}
.map.drawn .route .casing,
.map.drawn .route .line {
  stroke-dashoffset: 0;
}
.route .bolts {
  fill: none;
  stroke: var(--route);
  stroke-width: var(--w-line);
  vector-effect: non-scaling-stroke;
}
/* the top anchor: a double ring, as on a guidebook topo */
.route .end {
  fill: var(--route-casing);
  stroke: var(--route);
  stroke-width: var(--w-line);
  vector-effect: non-scaling-stroke;
  transition: stroke var(--dur-hover);
}
.route .end-dot {
  fill: var(--route);
  transition: fill var(--dur-hover);
}
.route {
  transition: opacity var(--dur-hover);
}
.route.on .line {
  stroke: var(--accent);
}
.route.on .end {
  stroke: var(--accent);
}
.route.on .end-dot,
.route.on .bolts {
  fill: var(--accent);
  stroke: var(--accent);
}
.route.dim,
.pill.dim,
.num.dim {
  opacity: 0.22;
}
/* route numbers at the foot, like a guidebook's */
.num {
  position: absolute;
  transform: translate(-50%, 0.45rem);
  min-width: 1.15rem;
  padding: 0.1rem 0.25rem;
  background: var(--route-casing);
  border: 1.5px solid var(--route);
  color: var(--route);
  font: 600 0.72rem / 1.1 var(--f-mono);
  text-align: center;
  pointer-events: none;
  z-index: 2; /* labels sit above the grain */
  transition:
    opacity var(--dur-hover),
    background-color var(--dur-hover),
    color var(--dur-hover);
}
/* the active route's number, printed solid in the accent, the same in the sheet */
.num.on {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}
/* grade tags: page-colour text on the route colour, on-accent text on the accent when active */
.pill {
  position: absolute;
  transform: translate(0.75rem, -50%);
  padding: 0.12rem 0.45rem;
  background: var(--route);
  color: var(--bg);
  font: 600 0.78rem / 1.2 var(--f-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: default;
  z-index: 2;
  transition:
    opacity var(--dur-hover),
    background-color var(--dur-hover),
    color var(--dur-hover);
}
.pill.on {
  z-index: 3;
  transform: translate(calc(-100% * var(--f, 0.5)), calc(-100% - 0.6rem));
  padding: 0.2rem 0.6rem;
  background: var(--accent);
  color: var(--on-accent);
}
.pill .name {
  font: 600 0.8rem / 1.2 var(--f-body);
}
/* The route sheet: an ink-ruled card, the band as column heads, hairline rules between rows.
   Number in the map's square, the route in the middle, the grade in a mono column. */
.sheet {
  grid-area: list;
  border: 1.5px solid var(--ink);
  background: var(--bg);
}
.cols,
.list li {
  display: grid;
  grid-template-columns: 1.6rem minmax(0, 1fr) 3rem;
  column-gap: 1rem;
}
.cols {
  padding-inline: 0.9rem;
}
.cols span:last-child {
  text-align: right;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  align-items: start;
  padding: 0.95rem 0.9rem 1rem;
  border-top: 1px solid var(--line);
  transition: background-color var(--dur-hover);
}
.list li:first-child {
  border-top: 0;
}
.list li.on {
  background: var(--wash);
}
.list .n {
  display: grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  margin-top: 0.1rem;
  border: 1.5px solid var(--route);
  background: var(--route-casing);
  color: var(--route);
  font: 600 0.8rem / 1.1 var(--f-mono);
  text-align: center;
  transition:
    background-color var(--dur-hover),
    border-color var(--dur-hover),
    color var(--dur-hover);
}
.list li.on .n {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}
.what {
  display: grid;
  gap: 0.25rem;
}
.list h3 {
  transition: color var(--dur-hover);
}
.g {
  padding-top: 0.1rem;
  text-align: right;
  font: 600 var(--step-0) / 1.35 var(--f-mono);
  color: var(--muted);
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  transition: color var(--dur-hover);
}
.list li.on .g {
  color: var(--accent-text);
}
.stack {
  color: var(--muted);
  font-size: var(--step--1);
  line-height: 1.45;
}
.proj {
  margin-top: 0.2rem;
  font-size: var(--step--1);
  line-height: 1.45;
  font-weight: 500;
}
@media (max-width: 52rem) {
  .grid {
    grid-template-columns: 1fr;
    grid-template-areas: 'head' 'map' 'list';
    /* the head already carries --space-head below it; the map sits closer to its list */
    gap: 0;
  }
  .map {
    margin-bottom: 1.5rem;
  }
  /* Pinned under the header; the list passes behind it. */
  .map {
    --band-foot: 12px;
    position: sticky;
    top: var(--header-h);
    z-index: 1;
  }
  .map.pinned {
    pointer-events: none; /* taps reach the list links behind; the map needs none on a phone */
  }
  /* on a phone the legend gives its height back to the list */
  .band {
    padding-inline: 0.7rem;
    font-size: 0.66rem;
    letter-spacing: 0.08em;
  }
  .legend {
    display: none;
  }
  /* Behind the pinned print, an opaque band of page colour, edge to edge, cut by an ink rule
     a little under the frame: list text scrolling up slides under the rule and is gone, so it
     never shows round the print. It moves with the map, so when the section ends the print,
     its band and its tags leave together. CSS only. */
  .map.pinned::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: calc(-1 * var(--band-foot));
    left: calc(-1 * var(--gutter));
    right: calc(-1 * var(--gutter-r));
    z-index: -1;
    pointer-events: none;
    background: var(--bg);
    border-bottom: 1px solid var(--ink);
  }
  /* fixed to the screen under the header (z-index 20): opaque page colour while the skills
     section is under the header, so nothing scrolls through the header's translucency */
  .header-cover.on {
    display: block;
  }
}
@media (prefers-reduced-motion: reduce) {
  .route .casing,
  .route .line {
    transition: none;
    stroke-dashoffset: 0;
  }
  .route,
  .pill,
  .num,
  .list li,
  .list .n,
  .g {
    transition: none;
  }
}
</style>
