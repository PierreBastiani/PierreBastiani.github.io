<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { education, experiences, sections, type OrgLogo } from '@/content'
import LivePepperLogo from '@/assets/logos/LivePepperLogo.vue'
import SquadLogo from '@/assets/logos/SquadLogo.vue'
import EpitechLogo from '@/assets/logos/EpitechLogo.vue'

const logos: Record<OrgLogo, typeof LivePepperLogo> = {
  livepepper: LivePepperLogo,
  squad: SquadLogo,
  epitech: EpitechLogo,
}

// Read like a topo: the newest job is the top pitch (longueur), the first one starts at the foot.
const pitchNo = (i: number) => experiences.length - i

// ---- The lead line -------------------------------------------------------------------
// Each job's anchor (relais) is an invisible box in the rail column. Once laid out, we
// measure them and draw a rope that climbs from the foot, clip to clip through a few
// quickdraws set left and right of the axis, pausing at each anchor.
const route = ref<HTMLElement | null>(null)
interface Geo {
  w: number
  h: number
  left: number
  anchors: number[] // y of each anchor, top to bottom (current job first, foot last)
  narrow: boolean
}
const geo = ref<Geo | null>(null)

function measure() {
  const el = route.value
  if (!el) return
  const box = el.getBoundingClientRect()
  const els = [...el.querySelectorAll<HTMLElement>('.anchor')]
  if (!els.length) return
  const first = els[0]!.getBoundingClientRect()
  geo.value = {
    w: first.width,
    h: box.height,
    left: first.left - box.left,
    anchors: els.map((a) => {
      const r = a.getBoundingClientRect()
      return r.top - box.top + r.height / 2
    }),
    narrow: first.width < 40,
  }
}

// small deterministic wobble so the bolts don't look machine-placed
const jitter = (i: number) => Math.sin(i * 12.9898) * 0.5

interface Draw {
  x: number
  y: number
  r: number
}
const line = computed(() => {
  const g = geo.value
  if (!g) return null
  const cx = g.w / 2
  const swing = g.narrow ? 5 : 11
  const perPitch = g.narrow ? 1 : 3
  const ys = [...g.anchors].reverse() // foot first, climbing up
  const pts: [number, number][] = [[cx, ys[0]!]]
  const draws: Draw[] = []
  const cracks: string[] = []
  let k = 0
  for (let p = 0; p < ys.length - 1; p++) {
    const lo = ys[p]!
    const hi = ys[p + 1]!
    for (let q = 1; q <= perPitch; q++) {
      const y = lo + ((hi - lo) * q) / (perPitch + 1)
      const side = k % 2 === 0 ? -1 : 1
      const x = cx + side * swing * (0.8 + jitter(k) * 0.4)
      draws.push({ x, y, r: side * 8 + jitter(k + 3) * 6 })
      pts.push([x, y + 6]) // the rope runs through the lower carabiner
      k++
    }
    pts.push([cx, hi])
    if (!g.narrow) {
      // a hairline crack beside the pitch, offset to the side the rope isn't on
      const y0 = lo - (lo - hi) * 0.25
      const x0 = cx + (p % 2 ? -1 : 1) * swing * 1.6
      cracks.push(`M${x0},${y0} l${-3 + jitter(p) * 4},-14 l4,-12 l-2,-18 l3,-10`)
    }
  }
  return { d: smooth(pts), draws, cracks, anchors: g.anchors, cx }
})

// Catmull-Rom through the points, as cubic Béziers: a rope, not a polyline.
function smooth(p: [number, number][]) {
  let d = `M${p[0]![0].toFixed(1)},${p[0]![1].toFixed(1)}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!
    const p1 = p[i]!
    const p2 = p[i + 1]!
    const p3 = p[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

// ---- The climber -------------------------------------------------------------------
// A small figure on the rope. Scrolling down he abseils, scrolling up he climbs; he rests
// at the anchor of the job in the middle of the screen. One rAF-throttled scroll handler
// reads the route's position and writes a transform; nothing else moves.
const track = ref<SVGPathElement | null>(null)
const climber = ref<SVGGElement | null>(null)
let samples: { len: number; x: number; y: number }[] = []
let reduce = false
let frame = 0
let lastY: number | null = null

function sample() {
  const p = track.value
  if (!p) return
  const total = p.getTotalLength()
  samples = []
  for (let len = 0; len <= total; len += 3) {
    const pt = p.getPointAtLength(len)
    samples.push({ len, x: pt.x, y: pt.y })
  }
  place()
}
watch(
  () => line.value?.d,
  () => nextTick(sample),
)

// The rope runs from the foot (high y) to the top anchor (low y). Find the point at a given y.
function pointAtY(y: number) {
  let best = samples[0]!
  for (const s of samples) if (Math.abs(s.y - y) < Math.abs(best.y - y)) best = s
  return best
}

// Between two anchors he waits at each end for the first and last 30 % of the way, so he
// reads as stopping at the belay of the job you're looking at.
function targetY(center: number, anchors: number[]) {
  const top = anchors[0]!
  const foot = anchors[anchors.length - 1]!
  if (center <= top) return top
  if (center >= foot) return foot
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!
    const b = anchors[i + 1]!
    if (center >= a && center <= b) {
      const t = (center - a) / (b - a)
      const eased = Math.min(1, Math.max(0, (t - 0.3) / 0.4))
      return a + (b - a) * eased * eased * (3 - 2 * eased)
    }
  }
  return top
}

function place() {
  frame = 0
  const el = route.value
  const g = geo.value
  const fig = climber.value
  if (!el || !g || !fig || !samples.length) return
  const y = reduce ? g.anchors[0]! : targetY(window.innerHeight / 2 - el.getBoundingClientRect().top, g.anchors)
  const pt = pointAtY(y)
  if (!reduce && lastY !== null && Math.abs(y - lastY) > 0.5) {
    fig.classList.toggle('down', y > lastY)
    fig.classList.toggle('up', y < lastY)
  }
  fig.classList.toggle('rest', g.anchors.some((a) => Math.abs(a - y) < 2))
  lastY = y
  fig.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(place)
}

// Draw-on: the rope climbs once when the route scrolls into view. Drawn straight away
// under reduced motion or when the section is already on screen.
const pending = ref(false)
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
onMounted(() => {
  const el = route.value
  if (!el) return
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(el)
  document.fonts?.ready.then(measure)
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  window.addEventListener('scroll', onScroll, { passive: true })
  if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return
  pending.value = true
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        pending.value = false
        io?.disconnect()
      }
    },
    { threshold: 0.15 },
  )
  io.observe(el)
})
onBeforeUnmount(() => {
  io?.disconnect()
  ro?.disconnect()
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section id="parcours" class="section" aria-labelledby="xp-title">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">{{ sections.experience.label }}</p>
        <h2 id="xp-title">{{ sections.experience.title }}</h2>
      </header>

      <div ref="route" class="route" :class="{ pending }">
        <svg
          v-if="line && geo"
          class="lead"
          :style="{ left: `${geo.left}px` }"
          :width="geo.w"
          :height="geo.h"
          :viewBox="`0 0 ${geo.w} ${geo.h}`"
          aria-hidden="true"
        >
          <path v-for="(c, i) in line.cracks" :key="'c' + i" :d="c" class="crack" />
          <path :d="line.d" class="rope" pathLength="1" />
          <path ref="track" :d="line.d" class="track" />

          <g v-for="(q, i) in line.draws" :key="'q' + i" class="draw" :transform="`translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${q.r.toFixed(1)})`">
            <circle cx="0" cy="-11" r="1.6" class="hanger" />
            <ellipse cx="0" cy="-7.5" rx="2.2" ry="3.2" />
            <line x1="0" y1="-4" x2="0" y2="2.5" class="sling" />
            <ellipse cx="0" cy="6" rx="2.2" ry="3.2" />
          </g>
          <g
            v-for="(y, i) in line.anchors"
            :key="'a' + i"
            class="relais"
            :class="{ current: i === 0, foot: i === line.anchors.length - 1 }"
            :transform="`translate(${line.cx} ${y.toFixed(1)})`"
          >
            <template v-if="i === line.anchors.length - 1">
              <line x1="-9" y1="2" x2="9" y2="2" class="ground" />
            </template>
            <template v-else>
              <path d="M-6,-5 L0,3 L6,-5" class="chain" />
              <circle cx="-6" cy="-5" r="2.4" class="bolt" />
              <circle cx="6" cy="-5" r="2.4" class="bolt" />
              <circle cx="0" cy="4.5" r="3" class="ring" />
            </template>
          </g>
          <!-- the climber: origin at his tie-in on the rope; body hangs to the left of it -->
          <g ref="climber" class="climber up">
            <g class="fig" :class="{ small: geo.narrow }">
              <g class="pose climb">
                <path d="M-7,0 l-3,6 l1,5 M-3,0 l2,5 l-1,6" class="limb" />
                <path d="M-8,-10 l-3,-8 M-3,-10 l2,-9" class="limb" />
                <rect x="-9" y="-12" width="7" height="12" rx="2.5" class="body" />
                <rect x="-9.5" y="-2.5" width="8" height="2.4" rx="1" class="harness" />
                <g class="head">
                  <circle cx="-5.5" cy="-15.6" r="3.2" class="body" />
                  <path d="M-8.8,-16.2 a3.3,3.3 0 0 1 6.6,0 z" class="beanie" />
                </g>
                <path d="M-2,-1.2 L0,0" class="tie" />
              </g>
              <g class="pose rappel">
                <path d="M-3,-0.5 l8,0.5 l0.5,-1.5 M-3,1 l7,3.5 l0.8,-1.2" class="limb" />
                <g transform="rotate(-28 -3 0)">
                  <path d="M-1.5,-10 l3.5,-6.5 M-6,-9 l2,7" class="limb" />
                  <rect x="-6.5" y="-12" width="7" height="12" rx="2.5" class="body" />
                  <rect x="-7" y="-2.5" width="8" height="2.4" rx="1" class="harness" />
                  <g class="head">
                    <circle cx="-3" cy="-15.6" r="3.2" class="body" />
                    <path d="M-6.3,-16.2 a3.3,3.3 0 0 1 6.6,0 z" class="beanie" />
                  </g>
                </g>
                <path d="M-1.5,-0.5 L0,0" class="tie" />
              </g>
            </g>
          </g>
        </svg>

        <ol class="pitches">
          <li v-for="(x, i) in experiences" :key="x.period" class="pitch" :class="{ current: i === 0 }">
            <p class="when">
              <span class="len"><span aria-hidden="true">L{{ pitchNo(i) }}</span><span class="visually-hidden">Longueur {{ pitchNo(i) }}</span></span>
              <span class="period">{{ x.period }}</span>
            </p>
            <span class="anchor" aria-hidden="true"></span>
            <div class="body">
              <p class="org">
                <component :is="logos[x.logo]" v-if="x.logo" />
                <span v-else>{{ x.org }}</span>
                <span v-if="x.orgNote" class="note">{{ x.orgNote }}</span>
              </p>
              <h3>{{ x.role }}</h3>
              <p class="text">{{ x.text }}</p>
              <ul class="tags" aria-label="Technologies" translate="no">
                <li v-for="t in x.tags" :key="t">{{ t }}</li>
              </ul>
            </div>
          </li>
          <li class="pitch foot">
            <p class="when">
              <span class="period">{{ education.period }}</span>
            </p>
            <span class="anchor" aria-hidden="true"></span>
            <div class="body">
              <p class="org"><component :is="logos[education.logo]" /></p>
              <h3>{{ education.degree }}</h3>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.route {
  --when: 12.5rem;
  --gap: 1.5rem;
  --rail: 3.5rem;
  position: relative;
}
.lead {
  position: absolute;
  top: 0;
  overflow: visible;
  pointer-events: none;
}
.rope {
  fill: none;
  stroke: var(--sea);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  opacity: 0.7;
  transition: stroke-dashoffset var(--dur-draw) var(--ease-draw);
}
.route.pending .rope {
  stroke-dashoffset: 1;
}
.crack {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.draw ellipse {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.2;
}
.draw .sling {
  stroke: var(--quiet);
  stroke-width: 2.6;
  stroke-linecap: round;
}
.draw .hanger {
  fill: var(--muted);
}
.relais .chain {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.4;
}
.relais .bolt {
  fill: var(--muted);
}
.relais .ring {
  fill: var(--bg);
  stroke: var(--sea);
  stroke-width: 2;
}
.relais.current .chain {
  stroke: var(--accent);
}
.relais.current .bolt,
.relais.current .ring {
  fill: var(--accent);
  stroke: var(--accent);
}
.relais .ground {
  stroke: var(--sea);
  stroke-width: 3;
  stroke-linecap: round;
  opacity: 0.6;
}

.pitches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(3.5rem, 6vw, 5rem);
}
.pitch {
  display: grid;
  grid-template-columns: var(--when) var(--rail) minmax(0, 1fr);
  column-gap: var(--gap);
  align-items: start;
}
.when {
  display: grid;
  justify-items: end;
  gap: 0.2rem;
  text-align: right;
  font: 400 var(--step--1) / 1.5 var(--f-mono);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}
.len {
  color: var(--quiet);
  font-size: 0.75rem;
}
/* invisible box the rope is measured against; sits level with the first line of text */
.anchor {
  display: block;
  height: 1.4rem;
}
.body {
  display: grid;
  gap: 0.6rem;
  max-width: var(--measure);
}
.org {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 1.4rem;
  color: var(--muted);
  font-size: var(--step--1);
}
.org :deep(.logo) {
  height: 1.05rem;
  width: auto;
  display: block;
}
.note {
  color: var(--quiet);
}
.text {
  color: color-mix(in srgb, var(--ink) 82%, var(--bg));
}
.foot h3 {
  font-size: var(--step-0);
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.5;
}
@media (max-width: 44rem) {
  .route {
    --rail: 1.75rem;
    --gap: 0.9rem;
  }
  .pitch {
    grid-template-columns: var(--rail) minmax(0, 1fr);
    grid-template-areas: 'anchor when' '. body';
    row-gap: 0.5rem;
  }
  .when {
    grid-area: when;
    display: flex;
    gap: 0.75rem;
    justify-items: start;
    text-align: left;
  }
  .anchor {
    grid-area: anchor;
  }
  .body {
    grid-area: body;
  }
}
.track {
  fill: none;
  stroke: none;
}
.climber {
  transition: opacity var(--dur-fade);
}
.route.pending .climber {
  opacity: 0;
}
.fig {
  transform: translate(0, 7px) scale(1.4);
}
.fig.small {
  transform: translate(0, 5px) scale(0.95);
}
.climber .pose {
  display: none;
}
.climber.up .climb,
.climber.down .rappel {
  display: inline;
}
.climber .body {
  fill: color-mix(in srgb, var(--ink) 88%, var(--bg));
}
.climber .limb {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 88%, var(--bg));
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.climber .harness {
  fill: var(--sea);
}
.climber .beanie {
  fill: var(--accent);
}
.climber .tie {
  stroke: var(--sea);
  stroke-width: 1.6;
}
/* at an anchor he glances toward the text */
.climber .head {
  transform-box: fill-box;
  transform-origin: center bottom;
  transition: transform var(--dur-fade);
}
.climber.rest .head {
  transform: rotate(12deg);
}
@media (prefers-reduced-motion: reduce) {
  .rope {
    transition: none;
  }
  .climber.rest .head {
    transform: none;
  }
}
</style>
