<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The descent, as an altitude scale in the left margin. The hero is the Baou's summit (802 m);
// scrolling climbs down to the sea at the contact section's foot (0 m). Two pieces, drawn from
// the page's own layout once it is measured:
// - the scale: a hairline spine a fixed distance left of the content column, a tick every
//   10 m, longer every 50 m, a number every 100 m, and at each section a leader to its label
//   with the section's name and altitude set up the margin, right of the spine;
// - the readout: a small fixed cartouche left of the spine giving the altitude you are at, its
//   index bar (the one accent) sitting on the spine.
// Altitude is linear in page position: 802 m at the hero's foot, 0 m at the sea's surface.
// The readout's index slides down the window as the page scrolls (top of the window at the top
// of the page, bottom at the bottom), so the scale under it always reads what the chip says.
// Below the sea the scale goes on as a depth gauge, through the sea band and the footer, on
// the same scale (a tick every 5 m, a number every 10 m, in the ground band's rule ink), and
// the readout turns into a depth reading on a chip of sea ink. A small sand bank runs in from
// the page edge to the spine's foot and slopes into the water.
// Numbers and readout sit left of the spine, section names right of it, so the chip never
// crosses a name. Shown only where the margin can hold numbers (at least 80 px, about 1264 px
// wide and up); narrower screens get no rail. Decorative for assistive tech (aria-hidden: the
// page's own scrollbar and keyboard scrolling stay the accessible way), but it works as a
// scrollbar for a pointer: the readout is the thumb (drag it), and a 28 px strip on the spine
// is the track (press anywhere on it to go there, keep the button down to drag on).
const SUMMIT = 802
const MIN_MARGIN = 80
// spine from the page edge: 40% into the margin, at least 72 px so the numbers and the readout
// fit left of it, and never closer than 36 px to the content column
const spineFor = (m: number) => Math.min(m - 36, Math.max(72, Math.round(m * 0.4)))
const T10 = 4
const T50 = 7
const T100 = 10

type Mark = { y: number; alt: number; label: string; reach: number }
type Layout = {
  H: number
  top: number // the summit line: the hero's foot
  sea: number // the sea's surface, 0 m
  m: number // where the content column starts
  spine: number
  marks: Mark[]
  floods: [number, number][] // the flood sections' tops and feet, where numbers take its ink
}

const root = ref<HTMLElement | null>(null)
const lay = ref<Layout | null>(null)
const grainHref = ref('')

// cached for the scroll handler
let rootTop = 0
let headerH = 64
let maxScroll = 1

function measure() {
  const el = root.value
  const hero = document.querySelector('#top')
  const sea = document.querySelector('#contact .sea') ?? document.querySelector('.site-footer')
  const wrap = document.querySelector('main > section[id]:not(#top) .wrap')
  if (!el || !hero || !sea || !wrap) return
  const origin = el.getBoundingClientRect().top
  rootTop = origin + window.scrollY
  headerH = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4
  maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const m = Math.round(
    wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft),
  )
  if (m < MIN_MARGIN) {
    lay.value = null
    return
  }
  const top = Math.round(hero.getBoundingClientRect().bottom - origin)
  const seaY = Math.round(sea.getBoundingClientRect().top - origin)
  if (seaY - top < 400) {
    lay.value = null
    return
  }
  const altAt = (py: number) => Math.round(SUMMIT * (1 - (py - top) / (seaY - top)))
  const marks: Mark[] = []
  for (const s of document.querySelectorAll('main > section[id]:not(#top)')) {
    const eb = s.querySelector('.eyebrow')
    if (!eb) continue
    const r = eb.getBoundingClientRect()
    const my = Math.round((r.top + r.bottom) / 2 - origin)
    marks.push({
      y: my,
      alt: altAt(my),
      label: eb.textContent?.trim() ?? '',
      reach: Math.round(r.bottom - origin),
    })
  }
  const floods = [...document.querySelectorAll('main .section.flood')].map((s) => {
    const r = s.getBoundingClientRect()
    return [Math.round(r.top - origin), Math.round(r.bottom - origin)] as [number, number]
  })
  lay.value = { H: el.clientHeight, top, sea: seaY, m, spine: spineFor(m) + 0.5, marks, floods }
  readScroll()
}

const f = (n: number) => n.toFixed(1)

const geo = computed(() => {
  const L = lay.value
  if (!L) return null
  const x = L.spine
  const span = L.sea - L.top
  const yOf = (alt: number) => L.top + (1 - alt / SUMMIT) * span
  const hair: string[] = []
  const line: string[] = []
  const nums: { y: number; n: number; end?: 'top' | 'foot'; flood?: boolean }[] = []
  // a number over a flood prints in the flood's ink (the rail's grey doesn't read on porphyry)
  const onFlood = (y: number) => L.floods.some(([t, b]) => y > t && y < b)
  for (let a = 800; a > 0; a -= 10) {
    const ty = Math.round(yOf(a)) + 0.5
    const len = a % 100 === 0 ? T100 : a % 50 === 0 ? T50 : T10
    ;(a % 50 === 0 ? line : hair).push(`M${f(x)} ${f(ty)}H${f(x - len)}`)
    // 800 sits a few px under the 802 cap: the cap carries the number
    if (a % 100 === 0 && ty - L.top > 24) nums.push({ y: ty, n: a, flood: onFlood(ty) })
  }
  // the two ends: the summit and the sea, capped across the spine
  line.push(`M${f(x - T100)} ${f(L.top + 0.5)}H${f(x + 4)}`)
  line.push(`M${f(x - T100)} ${f(L.sea - 0.5)}H${f(x + 4)}`)
  nums.push({ y: L.top + 0.5, n: SUMMIT, end: 'top' }, { y: L.sea - 0.5, n: 0, end: 'foot' })
  // leaders: from the spine to just short of each section's label
  for (const k of L.marks) line.push(`M${f(x)} ${f(k.y + 0.5)}H${f(L.m - 10)}`)
  // under the sea: the same scale on to the page's foot
  const perM = span / SUMMIT
  const deepHair: string[] = []
  const deepLine: string[] = []
  const deepNums: { y: number; n: number }[] = []
  for (let d = 5; L.sea + d * perM < L.H - 4; d += 5) {
    const ty = Math.round(L.sea + d * perM) + 0.5
    if (d % 10 === 0) {
      deepLine.push(`M${f(x)} ${f(ty)}H${f(x - T100)}`)
      deepNums.push({ y: ty, n: -d })
    } else deepHair.push(`M${f(x)} ${f(ty)}H${f(x - T10)}`)
  }
  // the sand bank: flat from the page edge, sloping into the water past the spine's foot,
  // a shade band along the slope
  const D = 20
  const xa = x - 30
  const xb = x + 12
  const bank = `M-2 ${f(L.sea - D)}H${f(xa)}L${f(xb)} ${f(L.sea)}H-2Z`
  const bankShade = `M${f(xa)} ${f(L.sea - D)}L${f(xb)} ${f(L.sea)}H${f(xb - 7)}L${f(xa - 5)} ${f(L.sea - D)}Z`
  return {
    spine: `M${f(x)} ${f(L.top)}V${f(L.sea)}`,
    hair: hair.join(' '),
    line: line.join(' '),
    nums,
    deepSpine: `M${f(x)} ${f(L.sea)}V${f(L.H)}`,
    deepHair: deepHair.join(' '),
    deepLine: deepLine.join(' '),
    deepNums,
    bank,
    bankShade,
    w: Math.ceil(L.m),
  }
})

// The readout: where the index sits in the window, and the altitude under it.
const readY = ref(0)
const alt = ref(SUMMIT)
const onSummit = ref(true)
const under = computed(() => alt.value < 0)
// a true minus sign for depths
const altText = computed(() => (alt.value < 0 ? `\u2212${-alt.value}` : `${alt.value}`))
let frame = 0
function readScroll() {
  frame = 0
  const L = lay.value
  if (!L) return
  const vh = window.innerHeight
  const p = Math.min(1, Math.max(0, window.scrollY / maxScroll))
  const iy = headerH + 14 + p * (vh - headerH - 28)
  const docY = iy + window.scrollY - rootTop
  readY.value = Math.round(iy)
  onSummit.value = docY < L.top
  const a = SUMMIT * (1 - (docY - L.top) / Math.max(1, L.sea - L.top))
  // no "-0": the reading turns negative once a full metre under
  alt.value = a > -0.5 ? Math.round(Math.min(SUMMIT, a)) : Math.round(a)
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(readScroll)
}

// The rail as a scrollbar. The index sits at headerH + 14 + p * (vh - headerH - 28) for a page
// scrolled to fraction p (readScroll): dragging inverts that. `grab` keeps the thumb under the
// pointer where it was taken; a press on the track takes it by its middle.
const dragging = ref(false)
let grab = 0
function scrollToIndex(cy: number) {
  const span = Math.max(1, window.innerHeight - headerH - 28)
  const p = Math.min(1, Math.max(0, (cy - headerH - 14) / span))
  // instant: the page's smooth scrolling would lag behind the pointer
  window.scrollTo({ top: p * maxScroll, behavior: 'instant' })
}
function onDown(e: PointerEvent, thumb: boolean) {
  if (e.button !== 0) return
  e.preventDefault() // no text selection while dragging
  grab = thumb ? e.clientY - readY.value : 0
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  if (!thumb) scrollToIndex(e.clientY)
}
function onMove(e: PointerEvent) {
  if (dragging.value) scrollToIndex(e.clientY - grab)
}
function onUp(e: PointerEvent) {
  dragging.value = false
  const el = e.currentTarget as HTMLElement
  if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  const g = getComputedStyle(document.documentElement).getPropertyValue('--grain').trim()
  grainHref.value = g.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
  measure()
  ro = new ResizeObserver(() => measure())
  ro.observe(document.body)
  const main = document.querySelector('main')
  if (main) ro.observe(main)
  document.fonts?.ready.then(measure)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measure)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="rail" :class="{ dragging }" aria-hidden="true">
    <template v-if="geo && lay">
      <svg
        class="scale"
        :width="geo.w"
        :height="lay.H"
        :viewBox="`0 0 ${geo.w} ${lay.H}`"
        focusable="false"
      >
        <defs>
          <pattern
            v-if="grainHref"
            id="rail-grain"
            width="220"
            height="220"
            patternUnits="userSpaceOnUse"
          >
            <image :href="grainHref" width="220" height="220" />
          </pattern>
        </defs>
        <path :d="geo.bank" class="bank" />
        <path :d="geo.bankShade" class="bank-shade" />
        <path v-if="grainHref" :d="geo.bank" fill="url(#rail-grain)" class="grain" />
        <g class="dry">
          <path :d="geo.spine" class="ink-hair" />
          <path :d="geo.hair" class="ink-hair" />
          <path :d="geo.line" class="ink-line" />
        </g>
        <g class="deep">
          <path :d="geo.deepSpine" class="ink-hair" />
          <path :d="geo.deepHair" class="ink-hair" />
          <path :d="geo.deepLine" class="ink-line" />
        </g>
      </svg>
      <span
        v-for="n in geo.nums"
        :key="n.n"
        class="num"
        :class="[n.end, { flood: n.flood }]"
        :style="{ top: `${n.y}px`, left: `${lay.spine - T100 - 6}px` }"
        >{{ n.n }}</span
      >
      <span
        v-for="n in geo.deepNums"
        :key="n.n"
        class="num deep"
        :style="{ top: `${n.y}px`, left: `${lay.spine - T100 - 6}px` }"
        >&minus;{{ -n.n }}</span
      >
      <span
        v-for="k in lay.marks"
        :key="k.label"
        class="mark"
        :style="{ top: `${k.reach + 12}px`, left: `${lay.spine + 8}px` }"
        >{{ k.label }} · {{ k.alt }} m</span
      >
      <div
        class="track"
        :style="{ left: `${lay.spine - 14}px` }"
        @pointerdown="onDown($event, false)"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      />
      <p
        class="readout"
        :class="{ off: onSummit, under }"
        :style="{ transform: `translate(${lay.spine + 1.5}px, ${readY}px)` }"
        @pointerdown="onDown($event, true)"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        {{ altText }} m
      </p>
    </template>
  </div>
</template>

<style scoped>
.rail {
  position: absolute;
  inset: 0;
  z-index: 1; /* under the header (20) */
  overflow: hidden;
  pointer-events: none;
}
.scale {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}
.dry path {
  stroke: var(--muted);
}
/* under water the scale switches to the ground band's rule ink, which reads on the sea band
   and on the footer */
.deep path {
  stroke: var(--on-ground-rule);
}
.bank {
  fill: var(--coast);
}
.bank-shade {
  fill: color-mix(in srgb, var(--coast) 65%, var(--ink-lilac));
}
.grain {
  mix-blend-mode: soft-light;
  opacity: var(--grain-opacity);
}

.num,
.mark {
  position: absolute;
  color: var(--muted);
  font: 500 0.6rem / 1 var(--f-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* numbers right-aligned on their tick, centred on it; the end caps' numbers sit inside the
   scale, under the summit line and above the sea */
.num {
  translate: -100% -50%;
}
.num.deep {
  color: var(--on-ground-muted);
}
/* over the projects' flood the numbers print in its ink, as its own words do */
.num.flood {
  color: var(--on-flood);
}
.num.top {
  translate: -100% 30%;
}
/* the sea's 0 stands on the sand bank, where the rail's grey reads too faint at dusk */
.num.foot {
  translate: -100% -130%;
  color: var(--ink);
}
/* section names run down the margin under their leader, read as the page scrolls */
.mark {
  writing-mode: vertical-rl;
  letter-spacing: 0.12em;
  color: var(--ink);
}

/* the scrollbar's track: an unseen strip on the spine, under the header, the window's height */
.track {
  position: fixed;
  top: 4rem;
  bottom: 0;
  width: 28px;
  pointer-events: auto;
  cursor: pointer;
  touch-action: none;
}
/* the readout: a cartouche left of the spine, its index bar on the spine, the one accent;
   also the scrollbar's thumb */
.readout {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  translate: -100% -50%;
  padding: 0.24rem 0.4rem 0.2rem;
  border: 1px solid var(--ink);
  border-right: 3px solid var(--accent);
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.6rem / 1 var(--f-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: opacity var(--dur-fade) var(--ease);
}
.readout.off {
  opacity: 0;
  pointer-events: none;
}
.rail.dragging .readout,
.rail.dragging .track {
  cursor: grabbing;
}
/* under the sea: a depth reading on sea ink, shell type, no accent */
.readout.under {
  border-color: var(--ink-shell);
  background: var(--sea-fill);
  color: var(--ink-shell);
}
@media (prefers-reduced-motion: reduce) {
  .readout {
    transition: none;
  }
}
@media (forced-colors: active) {
  .grain {
    display: none;
  }
}
</style>
