<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { routes } from '@/content'
import { POSES, SIT, SEAT_LOCAL, type Head, type Pose, type PoseId } from '@/lib/figure'
import { journey, type Box, type Cam, type Course } from '@/lib/journey'
import { ROUTE_LINES, SCENE, smooth, type Pt } from '@/lib/crag'
import { FRONT_RIDGE, ridgeY } from '@/lib/ridge'
import { floodEdgePath } from '@/lib/edge'
import { VIEW } from '@/lib/scene'

// The man at the summit desk travels down the page as it scrolls: he drops onto the Malt
// button, climbs the five routes of the topo, abseils the career rope, stands in the empty
// portrait plate while it prints, hops down the project cards and sits down at the desk on the
// contact cliff. One figure in one fixed layer, placed from the scroll position
// between anchors measured on the page (again on resize, font load and when a section
// hydrates), so scrolling back plays him backwards. Under reduced motion none of this runs:
// each section keeps its own figure (see html.journey in the sections).
//
// Scale: on the page he is one size everywhere (Geo.k: a standing figure 59 px tall on wide
// screens, 44 px on phones), on the Malt button, the rope, in the plate and on the cards, so he
// reads as one person moving through the page. He only changes size where he enters or leaves a
// drawing at its own scale (the summit desk, the topo under its camera, the contact desk), and
// then gradually, in the air. He is never out of sight for more than a jump: each jump picks, once
// per layout, the arc that keeps him clear of the header and from behind type.
//
// Ink: the figure is printed in the ink of what he stands over, the scene's figure ink on a
// drawing, the page's ink on paper, the band's light ink on the ground bands, the flood's ink on
// the porphyry projects (with the beanie in the sun's ochre there, as in the small posters). The
// same figure is drawn once per ink, each copy clipped to its ground, so where he crosses an
// edge the ink changes on the edge, as an overprint would.

type Ink = 'scene' | 'page' | 'ground' | 'flood'
const INKS: Ink[] = ['scene', 'page', 'ground', 'flood']
type Id = PoseId
const IDS: Id[] = ['sit', ...(Object.keys(POSES) as Exclude<PoseId, 'sit'>[])]

interface State {
  x: number // screen px of the pose's origin
  y: number
  k: number // px per figure unit (a standing figure is 100 units)
  pose: Id
  flip?: boolean
  map?: boolean // on the topo: only inside its plate
  desk?: boolean // sat at a desk with a keyboard: he types
}
type At = (s: number) => State
interface Seg {
  s0: number
  s1: number
  at: (s: number, t: number) => State
  route?: number // the topo route this part of the journey is on
}

// another page's route after the hero (lib/journey.ts); the main page passes none
const props = defineProps<{ course?: Course }>()
const root = ref<HTMLElement | null>(null)
const grain = ref('')

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (t: number) => t * t * (3 - 2 * t)

// ---- Geometry, measured once per layout ---------------------------------------------------
interface Rect {
  l: number
  t: number // document coordinates
  w: number
  h: number
}
const docRect = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { l: r.left, t: r.top + window.scrollY, w: r.width, h: r.height }
}
interface Geo {
  vw: number
  vh: number
  k: number // px per figure unit on the page, the same at every stop that isn't a drawing
  head: number // the sticky header's foot, viewport px: nothing of him should be under it
  hero: Rect // the scene
  band: Rect // the intro band under it
  footer: Rect | null
  malt: State & { docY: number }
  map: {
    natTop: number
    l: number
    h: number
    stick: number
    limit: number // the lowest the map's foot can go (its grid's bottom, minus its margin)
    dx: number // the plate inside the map
    dy: number
    pw: number
    ph: number
    box: Box
    narrow: boolean
    fig: number // wall units per figure unit
  } | null
  heads: number[] // the route sheet's headings, doc top (phones read the route from them)
  rope: { top: number; left: number; xs: { x: number; y: number }[]; anchors: number[] } | null
  plate: Rect | null
  ledges: { x: number; docY: number; pose: Id }[] // the project cards' top edges, page order
  flood: (Rect & { edge: number }) | null // edge: the ridge's depth on its top, 0 if cut straight
  seat: { x: number; y: number; k: number; desk: Rect | null } | null
  text: { r: Rect; ink: Ink }[] // every block of text in the page, which prints over him
}
let G: Geo | null = null
let segs: Seg[] = []

// the topo's routes, sampled in wall units, with their length so far at each point
const LINES = routes.map((r) => {
  const pts = smooth(ROUTE_LINES[r.id]!)
  const len = [0]
  for (let i = 1; i < pts.length; i++)
    len.push(len[i - 1]! + Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]))
  return { id: r.id, pts, len, total: len[len.length - 1]! }
})
function along(i: number, d: number): Pt {
  const L = LINES[i]!
  d = clamp(d, 0, L.total)
  let j = 1
  while (j < L.len.length - 1 && L.len[j]! < d) j++
  const t = (d - L.len[j - 1]!) / Math.max(1e-6, L.len[j]! - L.len[j - 1]!)
  const a = L.pts[j - 1]!
  const b = L.pts[j]!
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
}
const OVERVIEW: Cam = { x: SCENE.w / 2, y: SCENE.h / 2, zoom: 1 }

// how deep the flood's ridge cuts into its top (lib/edge.ts), in px; 0 where the browser keeps
// the straight cut
function edgeDepth(el: HTMLElement) {
  if (!CSS.supports('clip-path', 'shape(from 0 0, line to 1px 1px)')) return 0
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--edge-a)'
  el.appendChild(probe)
  const a = probe.offsetHeight
  probe.remove()
  return a
}

function measure() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const q = (s: string) => document.querySelector<HTMLElement>(s)
  const scene = q('#top .scene')
  const intro = q('#top .intro')
  const btn = q('#top .btn-primary')
  if (!scene || !intro || !btn) return
  const hero = docRect(scene)
  const band = docRect(intro)
  const footerEl = q('.site-footer')

  const narrow = window.matchMedia('(max-width: 52rem)').matches
  // one size on the page: 59 px standing on wide screens, 44 px on phones
  const k = narrow ? 0.42 : 0.56
  const headEl = q('.site-header')
  const head = headEl ? headEl.getBoundingClientRect().height : 64

  // Text prints over him: each line of text knocks the figure out where they meet, so he
  // passes behind type and never covers a word. The lines of one run of text are joined
  // across their leading, so he doesn't show through it in stripes.
  const text: Geo['text'] = []
  const main = q('main')
  if (main) {
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!el || !n.textContent?.trim() || el.closest('#top .scene, .map, svg, .visually-hidden'))
        continue
      range.selectNodeContents(n)
      const lines = [...range.getClientRects()]
        .filter((c) => c.width > 0.5 && c.height > 0.5)
        .sort((x, y) => x.top - y.top)
      const ink: Ink =
        props.course?.ink?.(el) ??
        (el.closest('#top .intro') ? 'ground' : el.closest('#projets') ? 'flood' : 'page')
      lines.forEach((c, i) => {
        const next = lines[i + 1]
        const bottom =
          next && next.top - c.bottom < 14 && next.top > c.top + 2 ? next.top : c.bottom + 1
        text.push({
          r: {
            l: c.left - 2,
            t: c.top + window.scrollY - 1,
            w: c.width + 4,
            h: bottom - c.top + 1,
          },
          ink,
        })
      })
    }
  }

  // A ledge (the top edge of a box): he stands on its rightmost spot where no text above it
  // would print over him; he crouches where only a crouch fits. The size stays the page's.
  const ledge = (b: Rect) => {
    const freeAt = (x: number) => {
      let top = -Infinity
      for (const { r } of text)
        if (r.t + r.h <= b.t + 2 && r.l < x + 15 * k + 3 && r.l + r.w > x - 12 * k - 3)
          top = Math.max(top, r.t + r.h)
      return b.t - top
    }
    let best = { x: b.l + b.w - 16 * k, room: -1 }
    for (let x = b.l + b.w - 16 * k; x > b.l + 12 * k; x -= 3) {
      const room = freeAt(x)
      if (room >= 104 * k) {
        best = { x, room }
        break
      }
      if (room > best.room) best = { x, room }
    }
    return { x: best.x, docY: b.t, pose: (best.room >= 104 * k ? 'stand' : 'crouch') as Id }
  }

  // The Malt button: he lands on its top edge.
  const malt = { ...ledge(docRect(btn)), y: 0, k }

  // The topo, measured unstuck: its natural place in the page, where it pins, where it stops.
  let map: Geo['map'] = null
  const heads: number[] = []
  const mapEl = q('#competences .map')
  const plateEl = q('#competences .plate svg')
  if (mapEl && plateEl) {
    const sticky = getComputedStyle(mapEl)
    const stick = parseFloat(sticky.top) || 0
    const mb = parseFloat(sticky.marginBottom) || 0
    const prev = mapEl.style.position
    mapEl.style.position = 'static'
    const m = docRect(mapEl)
    const p = docRect(plateEl)
    mapEl.style.position = prev
    const grid = mapEl.parentElement!
    const gr = docRect(grid)
    map = {
      natTop: m.t,
      l: m.l,
      h: m.h,
      stick,
      limit: gr.t + gr.h - mb,
      dx: p.l - m.l,
      dy: p.t - m.t,
      pw: p.w,
      ph: p.h,
      box: journey.box ?? (narrow ? { x: 40, y: 60, w: 920, h: 560 } : { ...SCENE, x: 0, y: 0 }),
      narrow,
      fig: narrow ? 0.8 : 0.66,
    }
    for (const h of document.querySelectorAll('#competences .list h3')) heads.push(docRect(h).t)
  }

  // The career rope: its belays from the page, its line from the timeline once it has drawn it.
  let rope: Geo['rope'] = null
  const routeEl = q('#parcours .route')
  if (routeEl) {
    const rr = docRect(routeEl)
    const anchorEls = [...routeEl.querySelectorAll('.anchor')]
    if (anchorEls.length) {
      const a0 = docRect(anchorEls[0]!)
      const anchors = anchorEls.map((a) => {
        const r = docRect(a)
        return r.t - rr.t + r.h / 2
      })
      const R = journey.rope
      const xs = R?.samples.length
        ? R.samples.map((p) => ({ x: R.left + p.x, y: p.y }))
        : anchors.map((y) => ({ x: a0.l - rr.l + a0.w / 2, y }))
      rope = { top: rr.t, left: rr.l, xs, anchors: R?.anchors ?? anchors }
    }
  }

  const plateArt = q('#projets .plate-box')
  const floodEl = q('#projets')
  // the project cards' frames, in page order: he hops down them after the plate and sits on each
  const ledges = [...document.querySelectorAll<HTMLElement>('#projets .card .art')]
    .map((el) => ({ ...ledge(docRect(el)), pose: 'sit' as Id }))
    .sort((a, b) => a.docY - b.docY)

  // The end: the desk on the contact cliff (wide screens), or the logbook's top edge.
  let seat: Geo['seat'] = null
  const deskEl = document.querySelector<SVGSVGElement>('#contact .desk-svg')
  const book = q('#contact .logbook')
  if (deskEl?.ownerSVGElement) {
    // the nested drawing runs past its own box, so its box comes from its attributes, in the
    // px of the cliff's SVG
    const o = docRect(deskEl.ownerSVGElement)
    const d = {
      l: o.l + deskEl.x.baseVal.value,
      t: o.t + deskEl.y.baseVal.value,
      w: deskEl.width.baseVal.value,
      h: deskEl.height.baseVal.value,
    }
    const u = d.w / 420
    seat = {
      x: d.l + (SEAT_LOCAL[0] - 40 - 760) * u,
      y: d.t + (SEAT_LOCAL[1] + 30 - 620) * u,
      k: 2.5 * u,
      desk: d,
    }
  } else if (book) {
    const r = docRect(book)
    seat = { x: r.l + r.w - 46, y: r.t + 1, k, desk: null }
  }

  G = {
    vw,
    vh,
    k,
    head,
    hero,
    band,
    footer: footerEl ? docRect(footerEl) : null,
    malt,
    map,
    heads,
    rope,
    plate: plateArt ? docRect(plateArt) : null,
    ledges,
    flood: floodEl ? { ...docRect(floodEl), edge: edgeDepth(floodEl) } : null,
    seat,
    text,
  }
  last.route = undefined // a section that just hydrated hears the route again
  props.course?.measure()
  plan()
  paint()
}

// ---- Where he is at a given scroll position, piece by piece ----------------------------------

// the desk in the hero, with the summit layer's parallax (depth 0.85, see HeroLayer)
const heroSeat: At = (s) => {
  const H = G!.hero
  const u = Math.max(H.w / (VIEW.x1 - VIEW.x0), H.h / 1000)
  const sc = clamp((s - H.t) / H.h)
  const tx = journey.px * 0.85 * -18
  const ty = sc * 0.15 * 150 + journey.py * 0.85 * -6
  return {
    x: H.l + H.w / 2 + (SEAT_LOCAL[0] - 40 - 800) * u + tx,
    y: H.t - s + H.h - (1000 - SEAT_LOCAL[1] - 30) * u + ty,
    k: 2.5 * u,
    pose: 'sit',
    desk: true,
  }
}
const onMalt: At = (s) => ({ ...G!.malt, y: G!.malt.docY - s })

// the topo's plate on screen: it is sticky, so it stops under the header, then leaves with its
// section
function plateAt(s: number) {
  const M = G!.map!
  let top = M.natTop - s
  if (top < M.stick) top = Math.min(M.stick, M.limit - M.h - s)
  return { l: M.l + M.dx, t: top + M.dy, w: M.pw, h: M.ph }
}
function onWall(s: number, [wx, wy]: Pt, cam: Cam = journey.cam ?? OVERVIEW) {
  const M = G!.map!
  const box = journey.box ?? M.box
  const p = plateAt(s)
  const vx = (wx - cam.x) * cam.zoom + SCENE.w / 2
  const vy = (wy - cam.y) * cam.zoom + SCENE.h / 2
  return {
    x: p.l + ((vx - box.x) / box.w) * p.w,
    y: p.t + ((vy - box.y) / box.h) * p.h,
    k: (p.w / box.w) * cam.zoom * M.fig,
  }
}

// One go at a route: stand at its foot, climb it, sit on the top anchor, lower off, walk on.
function routeSlot(i: number, s0: number, s1: number): Seg {
  const L = LINES[i]!
  const reach = 46 * G!.map!.fig // feet to harness, in wall units
  return {
    s0,
    s1,
    route: i,
    at: (s, t) => {
      const foot = L.pts[0]!
      const st = (p: Pt, pose: Id, flip = false): State => ({
        ...onWall(s, p),
        pose,
        flip,
        map: true,
      })
      if (t < 0.08) return st(foot, 'front')
      if (t < 0.6) {
        const d = lerp(reach, L.total, smoothstep((t - 0.08) / 0.52))
        // one move for every 34 units of rock: hand and foot swap sides
        return st(along(i, d), 'climb', Math.floor(d / 34) % 2 === 1)
      }
      if (t < 0.66) return st(along(i, L.total), 'lower')
      if (t < 0.88) {
        const d = lerp(L.total, reach, smoothstep((t - 0.66) / 0.22))
        return st(along(i, d), 'lower')
      }
      const next = LINES[i + 1]
      if (!next) return st(foot, 'front')
      const w = (t - 0.88) / 0.12
      const p: Pt = [lerp(foot[0], next.pts[0]![0], w), lerp(foot[1], next.pts[0]![1], w)]
      return st(p, Math.floor(w * 5) % 2 ? 'stand' : 'stride')
    },
  }
}

// the career rope: the timeline's own rule, the belay of the job in the middle of the window,
// moving between belays over the middle 40 % of the way
function ropeY(center: number, anchors: number[]) {
  const top = anchors[0]!
  const foot = anchors[anchors.length - 1]!
  if (center <= top) return top
  if (center >= foot) return foot
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!
    const b = anchors[i + 1]!
    if (center >= a && center <= b) {
      const e = clamp(((center - a) / (b - a) - 0.3) / 0.4)
      return a + (b - a) * smoothstep(e)
    }
  }
  return top
}
let ropeDir: Id = 'ropeDown'
const onRope: At = (s) => {
  const R = G!.rope!
  const y = ropeY(G!.vh / 2 + s - R.top, R.anchors)
  let best = R.xs[0]!
  for (const p of R.xs) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p
  const atFoot = Math.abs(y - R.anchors[R.anchors.length - 1]!) < 1
  return {
    x: R.left + best.x,
    y: R.top + y - s + (atFoot ? 12 : 0),
    k: G!.k,
    pose: atFoot ? 'front' : ropeDir,
  }
}

// standing inside the portrait plate's frame, on its foot rule
const inPlate: At = (s) => {
  const P = G!.plate!
  return { x: P.l + P.w / 2, y: P.t + P.h - 1 - s, k: G!.k, pose: 'front' }
}
const atSeat: At = (s) => {
  const S = G!.seat!
  return { x: S.x, y: S.y - s, k: S.k, pose: 'sit', desk: !!S.desk }
}

// How much of him is out of sight in a state: under the header, off the screen, or behind a
// line of text (which knocks him out). A 3 × 5 grid of points over a standing figure's box.
function hiddenIn(st: State, s: number, text: Rect[]) {
  const g = G!
  let n = 0
  let out = 0
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 5; j++) {
      const x = st.x + (i - 1) * 12 * st.k
      const y = st.y - (10 + 22 * j) * st.k
      n++
      // the screen's edge counts from 16 px in: a jump along it reads as being cut off
      if (y < g.head || y > g.vh || x < 16 || x > g.vw - 16) {
        out++
        continue
      }
      const dy = y + s
      for (const r of text)
        if (x > r.l && x < r.l + r.w && dy > r.t && dy < r.t + r.h) {
          out++
          break
        }
    }
  return out / n
}

// A jump between two anchors, both followed as the page moves: a spring, an arc, a landing.
// The arc is chosen once per layout: of a few bows to either side and a few heights, the one
// that keeps him in sight the longest (a jump straight through a heading would hide him behind
// it for a hundred px of scroll), the plainest one when they tie. The arcs differ in their bow,
// their height and whether he gets across before or after he drops (`lead`). Take-off and
// landing last 10 % of the jump, 30 px of scroll at most, so a long jump doesn't leave him
// crouching on a ledge that runs under the header.
function leap(s0: number, s1: number, A: At, B: At, apex: number, land?: Id): Seg {
  const c = Math.min(0.1, 30 / Math.max(1, s1 - s0))
  const path = (s: number, t: number, bow: number, up: number, lead = 1): State => {
    const a = A(s)
    const b = B(s)
    const flip = b.x < a.x - 2
    if (t < c) return { ...a, pose: 'crouch', flip }
    if (t > 1 - c) return { ...b, pose: land ?? 'crouch', flip }
    const u = (t - c) / (1 - 2 * c)
    const h = up * 4 * u * (1 - u)
    const rising = b.y - a.y - up * 4 * (1 - 2 * u) < 0
    return {
      x: lerp(a.x, b.x, u ** lead) + bow * Math.sin(Math.PI * u),
      y: lerp(a.y, b.y, u) - h,
      // the size changes along the flight, eased, only when one end is a drawing
      k: lerp(a.k, b.k, smoothstep(u)),
      pose: rising ? 'jump' : 'fall',
      flip,
    }
  }
  let bow = 0
  let up = apex
  let lead = 1
  if (G && s1 > s0 + 1) {
    const n = 16
    const at = (i: number) => s0 + ((s1 - s0) * (i + 0.5)) / n
    // the lines of text this jump could pass behind
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i < n; i++) {
      const st = path(at(i), (i + 0.5) / n, 0, apex)
      lo = Math.min(lo, st.y + at(i) - apex * 2 - 120 * st.k)
      hi = Math.max(hi, st.y + at(i) + 10)
    }
    const text = G.text.map((x) => x.r).filter((r) => r.t + r.h > lo && r.t < hi)
    const step = Math.min(G.vw * 0.07, 90)
    let best = Infinity
    for (const b of [0, -1, 1, -2, 2, -3, 3])
      for (const k of [1, 0.5, 1.8])
        for (const e of [1, 0.4, 2.5]) {
          let cost = Math.abs(b) * 0.015 + (k === 1 ? 0 : 0.01) + (e === 1 ? 0 : 0.01)
          for (let i = 0; i < n && cost < best; i++)
            cost += hiddenIn(path(at(i), (i + 0.5) / n, b * step, apex * k, e), at(i), text) / n
          if (cost < best - 1e-6) {
            best = cost
            bow = b * step
            up = apex * k
            lead = e
          }
        }
  }
  return { s0, s1, at: (s, t) => path(s, t, bow, up, lead) }
}
const hold = (s0: number, s1: number, A: At): Seg => ({ s0, s1, at: (s) => A(s) })

// The plan: the scroll ranges of each move, from the anchors' places in the page.
let print = { from: 0, to: 0 }
function plan() {
  const g = G!
  const vh = g.vh
  const out: Seg[] = []
  let s = 0
  const push = (seg: Seg) => {
    seg.s1 = Math.max(seg.s1, seg.s0 + 1)
    out.push(seg)
    s = seg.s1
  }

  // 1. leaves the desk and lands on the Malt button
  const land = Math.max(vh * 0.2, g.malt.docY - vh * 0.62)
  const depart = Math.max(vh * 0.04, land - vh * 0.36)
  push(hold(0, depart, heroSeat))
  push(leap(depart, land, heroSeat, onMalt, 80 * g.k, g.malt.pose))

  // 2. drops into the topo, at the foot of route 1, then each route in turn
  if (g.map) {
    const M = g.map
    const foot0 = (sc: number) => onWall(sc, LINES[0]!.pts[0]!, OVERVIEW)
    const footDoc = foot0(0).y // the plate is in its natural place at the top of the page
    const slots: [number, number][] = []
    // he leaves the button before his head reaches the header, and lands once route 1's foot
    // is in view
    const leaveMalt = Math.max(s + 20, g.malt.docY - g.head - 104 * g.k - 16)
    const mapIn = Math.max(leaveMalt + vh * 0.36, footDoc - vh * 0.88)
    if (M.narrow && g.heads.length === LINES.length) {
      // phones: the route of the sheet's row under the pinned map (see RouteMap's reading line)
      const line = M.stick + M.h + 13
      const B = g.heads.map((t) => t - line)
      const unpin = M.limit - M.h - M.stick
      for (let i = 0; i < LINES.length; i++)
        slots.push([
          i ? B[i - 1]! : mapIn,
          i < LINES.length - 1 ? B[i]! : Math.min(B[i]! + vh * 0.2, unpin - 30),
        ])
    } else {
      let end = mapIn
      while (end < mapIn + 4 * vh && onWall(end, LINES[4]!.pts[0]!, OVERVIEW).y > vh * 0.2) end += 8
      // done before the plate, leaving with its section, takes a route's top under the header
      end = Math.max(mapIn + 400, Math.min(end, M.limit - M.h - (g.head - 24 - M.dy)))
      const n = LINES.length
      for (let i = 0; i < n; i++)
        slots.push([lerp(mapIn, end, i / n), lerp(mapIn, end, (i + 1) / n)])
    }
    push(hold(s, leaveMalt, onMalt))
    const toFoot: At = (sc) => ({ ...onWall(sc, LINES[0]!.pts[0]!), pose: 'front', map: true })
    push(leap(s, Math.max(s + 40, mapIn), onMalt, toFoot, 28))
    for (let i = 0; i < slots.length; i++) {
      const [a, b] = slots[i]!
      push(routeSlot(i, Math.max(s, a), b))
    }
  }

  // 3. onto the career rope, then down it with the timeline
  const lastFoot: At = g.map
    ? (sc) => ({ ...onWall(sc, LINES[4]!.pts[0]!), pose: 'front' })
    : onMalt
  if (g.rope) {
    const R = g.rope
    const top = R.top + R.anchors[0]!
    const foot = R.top + R.anchors[R.anchors.length - 1]!
    const on = Math.max(s + vh * 0.25, top - vh * 0.78)
    push(leap(s, on, lastFoot, onRope, 50))
    push(hold(s, Math.max(s + 1, foot - vh / 2), onRope))
  }

  // 4. into the portrait plate; it prints while he stands in it
  // where he must have left an anchor whose ledge is at docY, so his head stays clear of the header
  const clear = (docY: number) => docY - g.head - 104 * g.k - 12
  let from: At = g.rope ? onRope : lastFoot
  let limit = Infinity
  if (g.plate) {
    const P = g.plate
    const inAt = Math.max(s + vh * 0.2, P.t + P.h - vh * 0.84)
    const leaveRope = Math.max(s, inAt - vh * 0.42)
    push(hold(s, leaveRope, from))
    push(leap(s, inAt, from, inPlate, 90 * g.k))
    const full = Math.max(inAt + vh * 0.2, Math.min(inAt + vh * 0.42, P.t - 64 - 24))
    print = { from: inAt + vh * 0.03, to: full }
    push(hold(s, full + vh * 0.04, inPlate))
    from = inPlate
    limit = clear(P.t + P.h)
  }

  // 5. down the project cards, a hop from frame to frame, then onto the contact cliff, where he
  // sits down at the desk. He lands on the next stop once it is well in view, and leaves the one
  // he is on a little before, or earlier if his head would reach the header.
  const hop = (to: At, toDoc: number, pose: Id) => {
    const landAt = Math.max(s + vh * 0.22, toDoc - vh * 0.6)
    const leave = Math.max(s, Math.min(landAt - vh * 0.3, limit))
    push(hold(s, leave, from))
    push(leap(s, Math.max(landAt, s + vh * 0.2), from, to, 60 * g.k, pose))
    from = to
    limit = clear(toDoc)
  }
  if (props.course) {
    // another page's own stops, from the hero's button
    props.course.plan({
      vw: g.vw,
      vh,
      now: () => s,
      push,
      leap,
      hold,
      button: onMalt,
      narrow: window.matchMedia('(max-width: 52rem)').matches,
    })
  } else {
    for (const L of g.ledges)
      hop((sc) => ({ x: L.x, y: L.docY - sc, k: g.k, pose: L.pose }), L.docY, L.pose)
    if (g.seat) {
      hop(atSeat, g.seat.y, 'sit')
      push(hold(s, s + 1e7, atSeat))
    } else push(hold(s, s + 1e7, from))
  }
  segs = out
}

// ---- Painting ---------------------------------------------------------------------------
let layers: Record<
  Ink,
  {
    el: SVGSVGElement
    mover: SVGGElement
    poses: Record<string, SVGGElement>
    heads: Record<string, SVGGElement>
    hands: [SVGGElement, SVGGElement] // near, far
    pat: SVGPatternElement | null
  }
> | null = null
const last = {
  pose: '' as string,
  clips: {} as Record<string, string>,
  route: undefined as number | null | undefined,
  roll: '',
  k: 0,
}
let lastS = 0

function stateAt(s: number): { st: State; route: number | null } {
  let seg = segs[0]
  if (!seg) return { st: { x: -999, y: -999, k: 0, pose: 'stand' }, route: null }
  for (const g of segs) {
    if (s >= g.s0) seg = g
    else break
  }
  const t = clamp((s - seg!.s0) / Math.max(1, seg!.s1 - seg!.s0))
  return { st: seg!.at(s, t), route: seg!.route ?? null }
}

// the grounds under him, in screen px at this scroll position
// inner: the part that is surely this ground (the flood under its ridge), when it differs from box
type Ground = {
  ink: Ink
  d: string
  box: [number, number, number, number]
  inner?: [number, number, number, number]
}
const rectPath = (l: number, t: number, w: number, h: number) =>
  `M${l.toFixed(1)} ${t.toFixed(1)}H${(l + w).toFixed(1)}V${(t + h).toFixed(1)}H${l.toFixed(1)}Z`
function grounds(s: number): Ground[] {
  const g = G!
  const out: Ground[] = []
  const vw = g.vw
  // the hero: the scene down to its foreground ridge, then the band
  const H = g.hero
  const u = Math.max(H.w / (VIEW.x1 - VIEW.x0), H.h / 1000)
  const bottom = H.t + H.h - s
  if (bottom > -40 && H.t - s < g.vh) {
    const pts: string[] = []
    let ridgeTop = Infinity
    for (let x = -8; x <= vw + 8; x += 16) {
      const sx = 800 + (x - H.l - H.w / 2) / u
      const y = bottom - (1000 - ridgeY(FRONT_RIDGE, sx)) * u
      ridgeTop = Math.min(ridgeTop, y)
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    const top = H.t - s
    const bandBottom = g.band.t + g.band.h - s
    out.push({
      ink: 'scene',
      d: `M-8 ${top}L${pts.join('L')}L${vw + 8} ${top}Z`,
      box: [0, top, vw, bottom],
    })
    out.push({
      ink: 'ground',
      d: `M-8 ${bandBottom}L${pts.join('L')}L${vw + 8} ${bandBottom}Z`,
      box: [0, ridgeTop, vw, bandBottom],
    })
  }
  if (g.map) {
    const p = plateAt(s)
    out.push({
      ink: 'scene',
      d: rectPath(p.l, p.t, p.w, p.h),
      box: [p.l, p.t, p.l + p.w, p.t + p.h],
    })
  }
  if (g.flood) {
    const f = g.flood
    out.push({
      ink: 'flood',
      d: f.edge ? floodEdgePath(0, vw, f.t - s, f.h, f.edge) : rectPath(-8, f.t - s, vw + 16, f.h),
      box: [0, f.t - s, vw, f.t + f.h - s],
      inner: [0, f.t - s + f.edge, vw, f.t + f.h - s],
    })
  }
  if (g.seat?.desk) {
    const d = g.seat.desk
    out.push({
      ink: 'scene',
      d: rectPath(d.l, d.t - s, d.w, d.h),
      box: [d.l, d.t - s, d.l + d.w, d.t + d.h - s],
    })
  }
  if (g.footer) {
    const f = g.footer
    out.push({
      ink: 'ground',
      d: rectPath(-8, f.t - s, vw + 16, f.h),
      box: [0, f.t - s, vw, f.t + f.h - s],
    })
  }
  if (props.course?.grounds) out.push(...props.course.grounds(s, vw))
  return out
}

function setClip(ink: Ink, v: string) {
  if (last.clips[ink] === v) return
  last.clips[ink] = v
  const el = layers![ink].el
  el.style.clipPath = v === 'all' ? '' : v
  el.style.visibility = v === 'none' ? 'hidden' : ''
}

function paint() {
  frame = 0
  if (!G || !layers) return
  const s = window.scrollY
  if (s !== lastS) ropeDir = s > lastS ? 'ropeDown' : 'ropeUp'
  lastS = s
  const { st, route } = stateAt(s)

  // the topo follows his route; it only changes when he moves to another one
  if (route !== last.route) {
    last.route = route
    journey.setRoute?.(route === null ? null : LINES[route]!.id)
  }

  // the plate prints row by row as the roller goes down it
  if (G.plate) {
    const P = G.plate
    const t = clamp((s - print.from) / Math.max(1, print.to - print.from))
    const row = (52 / Math.SQRT2 / 3120) * P.h
    const off = (15.9 / 3120) * P.h
    const roll =
      t >= 1
        ? P.h
        : t <= 0
          ? 0
          : Math.min(P.h, off + row * (Math.floor((t * P.h - off) / row) + 0.5))
    const v = `${roll.toFixed(1)}px${t > 0 && t < 1 ? ' on' : ''}`
    if (v !== last.roll) {
      last.roll = v
      const box = document.querySelector<HTMLElement>('#projets .plate-box')
      box?.style.setProperty('--roll', `${roll.toFixed(1)}px`)
      box?.classList.toggle('rolling', t > 0 && t < 1)
    }
  }

  props.course?.paint?.(s)

  // pose and place, the same in every ink
  if (st.pose !== last.pose) {
    for (const ink of INKS) {
      const L = layers[ink]
      if (last.pose) L.poses[last.pose]!.style.display = 'none'
      L.poses[st.pose]!.style.display = 'inline'
    }
    last.pose = st.pose
    paintHead()
  }
  now = st
  atDesk = !!st.desk
  if (atDesk) startTyping() // a no-op while a burst runs; it stops itself out of sight or idle
  const tf = `translate(${st.x.toFixed(1)} ${st.y.toFixed(1)}) scale(${((st.flip ? -1 : 1) * st.k).toFixed(4)} ${st.k.toFixed(4)})`
  const regrain = Math.abs(st.k - last.k) > last.k * 0.05
  for (const ink of INKS) {
    layers[ink].mover.setAttribute('transform', tf)
    if (regrain)
      layers[ink].pat?.setAttribute('patternTransform', `scale(${(1 / st.k).toFixed(3)})`)
  }
  if (regrain) last.k = st.k

  // which grounds he is over: one ink if one ground holds all of him, else each copy clipped
  const fb: [number, number, number, number] = [
    st.x - 26 * st.k,
    st.y - 112 * st.k,
    st.x + 26 * st.k,
    st.y + 50 * st.k,
  ]
  const hit = (b: [number, number, number, number]) =>
    b[0] < fb[2] && b[2] > fb[0] && b[1] < fb[3] && b[3] > fb[1]
  const inside = (b: [number, number, number, number]) =>
    b[0] <= fb[0] && b[2] >= fb[2] && b[1] <= fb[1] && b[3] >= fb[3]
  const near = grounds(s).filter((g) => hit(g.box))
  // the text boxes he meets, merged where they overlap (even-odd would print a double hole)
  const holes = G.text
    .filter(({ r }) => hit([r.l, r.t - s, r.l + r.w, r.t - s + r.h]))
    .map((h) => ({ ink: h.ink, r: { ...h.r } }))
  for (let i = 0; i < holes.length; i++)
    for (let j = i + 1; j < holes.length; j++) {
      const A = holes[i]!.r
      const B = holes[j]!.r
      if (A.l < B.l + B.w && B.l < A.l + A.w && A.t < B.t + B.h && B.t < A.t + A.h) {
        const l = Math.min(A.l, B.l)
        const t = Math.min(A.t, B.t)
        holes[i]!.r = {
          l,
          t,
          w: Math.max(A.l + A.w, B.l + B.w) - l,
          h: Math.max(A.t + A.h, B.t + B.h) - t,
        }
        holes.splice(j, 1)
        j = i
      }
    }
  const hole = (h: Geo['text'][number]) => rectPath(h.r.l, h.r.t - s, h.r.w, h.r.h)
  const full = `M-10 -10H${G.vw + 10}V${G.vh + 10}H-10Z`
  if (st.map) {
    const p = plateAt(s)
    for (const ink of INKS)
      setClip(ink, ink === 'scene' ? `path('${rectPath(p.l, p.t, p.w, p.h)}')` : 'none')
    return
  }
  const whole =
    near.length === 1 && inside(near[0]!.inner ?? near[0]!.box)
      ? near[0]!.ink
      : near.length
        ? null
        : 'page'
  if (whole) {
    const cut = holes.map(hole).join(' ')
    for (const ink of INKS)
      setClip(ink, ink !== whole ? 'none' : cut ? `path(evenodd, '${full} ${cut}')` : 'all')
    return
  }
  const others = near.map((g) => g.d).join(' ')
  for (const ink of INKS) {
    const cut = holes
      .filter((h) => h.ink === ink)
      .map(hole)
      .join(' ')
    if (ink === 'page') {
      setClip(ink, `path(evenodd, '${full} ${others} ${cut}')`)
      continue
    }
    const mine = near.filter((g) => g.ink === ink).map((g) => g.d)
    setClip(ink, mine.length ? `path(evenodd, '${mine.join(' ')} ${cut}')` : 'none')
  }
}

// ---- Alive: he types at a desk, and looks at what is being read -----------------------------
// Both answer the visitor and stop on their own (IX3: nothing loops at rest). While the visitor
// scrolls, points or types, he types if he is at a desk. Once they have been still for IDLE ms
// he stops and turns his head, in two strip frames, towards what they are most likely reading:
// the block under a mouse that moved lately, else the block on the reading line. The next input
// turns him back at once. Head frames only, in every pose: ahead, up, down, turned round.
const IDLE = 1800
const TILT = 22 // degrees per frame of looking up or down
let now: State | null = null // where he is, from the last paint
let atDesk = false
let lastInput = 0
let idleTimer = 0
let lookTimer = 0
let typeTimer = 0
let keysLeft = 0
const handsUp = [false, false]
let hand = 0 // the hand that struck last
let look: { back: boolean; tilt: number } | null = null
const pointer = { x: 0, y: 0, at: 0 }

// in sight: nobody watches him type or turn when he is off the screen or under the header
const inSight = (st: State | null): st is State =>
  !!st &&
  st.x > 0 &&
  st.x < window.innerWidth &&
  st.y > (G?.head ?? 0) &&
  st.y < window.innerHeight + 40 * st.k

// the head frames a pose draws: from the back (d), and side on (t) when that is another drawing
const headSides = (p: Pose): Record<string, Head> =>
  p.turn === p.head ? { d: p.head } : { d: p.head, t: p.turn }

function paintHead() {
  if (!layers || !now) return
  const id = now.pose
  const sit = id === 'sit'
  const [nx, ny] = sit ? SIT.neck : POSES[id as Exclude<PoseId, 'sit'>].neck
  let tf = ''
  if (look) {
    // in the pose's own frame he faces +x; turned round, the head is mirrored about the neck
    const a = (look.back ? -1 : 1) * look.tilt * TILT
    tf = `rotate(${a} ${nx} ${ny})${look.back ? ` translate(${2 * nx} 0) scale(-1 1)` : ''}`
  }
  const turned =
    !!look &&
    !sit &&
    POSES[id as Exclude<PoseId, 'sit'>].turn !== POSES[id as Exclude<PoseId, 'sit'>].head
  for (const ink of INKS) {
    const h = layers[ink].heads[id]!
    if (tf) h.setAttribute('transform', tf)
    else h.removeAttribute('transform')
    h.classList.toggle('turned', turned)
  }
}

function setHand(hand: number, up: boolean) {
  if (!layers || up === handsUp[hand]) return
  handsUp[hand] = up
  const [ex, ey] = hand ? SIT.farElbow : SIT.elbow
  for (const ink of INKS) {
    const g = layers[ink].hands[hand ? 1 : 0]
    if (up) g.setAttribute('transform', `rotate(-8 ${ex} ${ey})`)
    else g.removeAttribute('transform')
  }
}
const handsDown = () => {
  setHand(0, false)
  setHand(1, false)
}

// bursts of 3 to 7 keys, the hands in turn (now and then the same one twice), about 4 a
// second, a pause between words
function typeStep() {
  typeTimer = 0
  if (!atDesk || look || document.hidden || !inSight(now) || performance.now() - lastInput > IDLE) {
    handsDown()
    return
  }
  const up = handsUp.indexOf(true)
  if (up >= 0) {
    // the key is struck: the hand comes back down
    setHand(up, false)
    keysLeft--
    typeTimer = window.setTimeout(
      typeStep,
      keysLeft > 0 ? 110 + Math.random() * 120 : 450 + Math.random() * 800,
    )
    return
  }
  if (keysLeft <= 0) keysLeft = 3 + Math.floor(Math.random() * 5)
  hand = Math.random() < 0.75 ? 1 - hand : hand
  setHand(hand, true)
  typeTimer = window.setTimeout(typeStep, 90)
}
function startTyping() {
  if (!typeTimer && atDesk && !look) typeStep()
}

// what the visitor is most likely reading, as a point on screen
function readingPoint(): { x: number; y: number } | null {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const top = G?.head ?? 64
  const blocks = [
    ...document.querySelectorAll<HTMLElement>(
      'main h1, main h2, main h3, main p, main li, main dd, main blockquote, main figure',
    ),
  ]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 4 && r.height > 4 && r.bottom > top && r.top < vh)
  if (!blocks.length) return null
  const dist = (r: DOMRect, x: number, y: number) =>
    Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom))
  // a mouse that moved in the last few seconds points at what is read
  if (performance.now() - pointer.at < 5000) {
    let best: DOMRect | null = null
    for (const r of blocks)
      if (dist(r, pointer.x, pointer.y) < (best ? dist(best, pointer.x, pointer.y) : 160)) best = r
    if (best)
      return {
        x: clamp(pointer.x, best.left, best.right),
        y: clamp(pointer.y, best.top, best.bottom),
      }
  }
  // else the block on the reading line, a little above the middle of the screen
  const line = top + (vh - top) * 0.38
  let best = blocks[0]!
  const score = (r: DOMRect) =>
    dist(r, r.left, line) + 0.15 * Math.abs(r.left + r.width / 2 - vw / 2)
  for (const r of blocks) if (score(r) < score(best)) best = r
  return { x: best.left + Math.min(best.width, 320) / 2, y: clamp(line, best.top, best.bottom) }
}

function startLook() {
  if (!inSight(now) || !layers) return
  const target = readingPoint()
  if (!target) return
  const sgn = now.flip ? -1 : 1
  const sit = now.pose === 'sit'
  // the neck on screen: the sit pose is drawn in the hero's scene units (SIT.transform)
  const [nx, ny] = sit
    ? [0.4 * (SIT.neck[0] - 828), 0.4 * (SIT.neck[1] - 776)]
    : POSES[now.pose as Exclude<PoseId, 'sit'>].neck
  const dx = (target.x - (now.x + sgn * nx * now.k)) * sgn
  const dy = target.y - (now.y + ny * now.k)
  const deg = (Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI
  const tilt = deg < -10 ? -1 : deg > 10 ? 1 : 0
  const back = dx < 0
  handsDown()
  // two frames, like a strip: turn, then raise or lower the eyes
  look = { back, tilt: 0 }
  paintHead()
  if (tilt)
    lookTimer = window.setTimeout(() => {
      if (look) {
        look.tilt = tilt
        paintHead()
      }
    }, 140)
}

function checkIdle() {
  idleTimer = 0
  const quiet = performance.now() - lastInput
  if (quiet < IDLE) idleTimer = window.setTimeout(checkIdle, IDLE - quiet)
  else if (!document.hidden) startLook()
}

function onInput(e: Event) {
  lastInput = performance.now()
  if (e instanceof PointerEvent && e.pointerType === 'mouse')
    Object.assign(pointer, { x: e.clientX, y: e.clientY, at: lastInput })
  if (look) {
    look = null
    clearTimeout(lookTimer)
    paintHead()
  }
  startTyping()
  if (!idleTimer) idleTimer = window.setTimeout(checkIdle, IDLE)
}
const INPUTS = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const

let frame = 0
const request = () => {
  if (!frame) frame = requestAnimationFrame(paint)
}
let remeasureFrame = 0
const remeasure = () => {
  cancelAnimationFrame(remeasureFrame)
  remeasureFrame = requestAnimationFrame(measure)
}
let resizeTimer = 0
const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(measure, 150)
}
let ro: ResizeObserver | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.value) return
  const g = getComputedStyle(document.documentElement).getPropertyValue('--grain').trim()
  grain.value = g.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
  layers = Object.fromEntries(
    INKS.map((ink) => {
      const el = root.value!.querySelector<SVGSVGElement>(`.layer.${ink}`)!
      const poses: Record<string, SVGGElement> = {}
      const heads: Record<string, SVGGElement> = {}
      for (const id of IDS) {
        poses[id] = el.querySelector<SVGGElement>(`.p-${id}`)!
        heads[id] = poses[id].querySelector<SVGGElement>('.hd')!
      }
      return [
        ink,
        {
          el,
          mover: el.querySelector<SVGGElement>('.mover')!,
          poses,
          heads,
          hands: [
            el.querySelector<SVGGElement>('.p-sit .fa.near')!,
            el.querySelector<SVGGElement>('.p-sit .fa.far')!,
          ],
          pat: el.querySelector('pattern'),
        },
      ]
    }),
  ) as typeof layers
  journey.on = true
  journey.paint = paint
  journey.request = request
  journey.remeasure = remeasure
  document.documentElement.classList.add('journey')
  root.value.classList.add('on')
  window.addEventListener('scroll', request, { passive: true })
  for (const ev of INPUTS) window.addEventListener(ev, onInput, { passive: true })
  document.addEventListener('visibilitychange', onInput)
  window.addEventListener('resize', onResize, { passive: true })
  ro = new ResizeObserver(remeasure)
  const main = document.querySelector('main')
  if (main) ro.observe(main)
  document.fonts?.ready.then(remeasure)
  measure()
  // he is at work when the page opens, and looks up once the visitor settles
  onInput(new Event('load'))
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', request)
  for (const ev of INPUTS) window.removeEventListener(ev, onInput)
  document.removeEventListener('visibilitychange', onInput)
  clearTimeout(idleTimer)
  clearTimeout(lookTimer)
  clearTimeout(typeTimer)
  window.removeEventListener('resize', onResize)
  ro?.disconnect()
  cancelAnimationFrame(frame)
  cancelAnimationFrame(remeasureFrame)
  clearTimeout(resizeTimer)
  journey.on = false
  journey.paint = journey.request = journey.remeasure = () => {}
  document.documentElement.classList.remove('journey')
})
</script>

<template>
  <div ref="root" class="travel" aria-hidden="true">
    <svg v-for="ink in INKS" :key="ink" class="layer" :class="ink" focusable="false">
      <defs>
        <pattern
          v-if="grain"
          :id="`travel-grain-${ink}`"
          width="220"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          <image :href="grain" width="220" height="220" />
        </pattern>
      </defs>
      <g class="mover">
        <g class="p p-sit">
          <g :transform="SIT.transform">
            <g class="fa far">
              <path :d="SIT.farArm" class="b" />
            </g>
            <path :d="SIT.body" class="b" />
            <g class="fa near">
              <path :d="SIT.forearm" class="b" />
            </g>
            <g class="hd">
              <path :d="SIT.head.body" class="b" />
              <path :d="SIT.head.hat" class="h" />
              <path :d="SIT.head.band" class="hb" />
              <path :d="SIT.phones" class="ink-heavy phones" />
              <path :d="SIT.head.gear" class="g" />
              <path
                v-if="grain"
                :d="`${SIT.head.body} ${SIT.head.hat}`"
                class="grain"
                :fill="`url(#travel-grain-${ink})`"
              />
            </g>
            <path
              v-if="grain"
              :d="`${SIT.body} ${SIT.forearm}`"
              class="grain"
              :fill="`url(#travel-grain-${ink})`"
            />
          </g>
        </g>
        <g v-for="(p, id) in POSES" :key="id" class="p" :class="`p-${id}`">
          <path :d="p.body" class="b" />
          <path v-if="p.gear" :d="p.gear" class="g" />
          <path v-if="grain" :d="p.body" class="grain" :fill="`url(#travel-grain-${ink})`" />
          <g class="hd">
            <g v-for="(h, side) in headSides(p)" :key="side" :class="side">
              <path :d="h.body" class="b" />
              <path :d="h.hat" class="h" />
              <path :d="h.band" class="hb" />
              <path :d="h.gear" class="g" />
              <path
                v-if="grain"
                :d="`${h.body} ${h.hat}`"
                class="grain"
                :fill="`url(#travel-grain-${ink})`"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.travel {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 15; /* over the sections, under the sticky header (20) */
  pointer-events: none;
  overflow: hidden;
}
.travel.on {
  display: block;
}
.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.p {
  display: none;
}
/* the head as drawn, or turned side on while he looks at something (see look) */
.hd .t,
.hd.turned .d {
  display: none;
}
.hd.turned .t {
  display: inline;
}
/* the inks of each ground */
.scene {
  --fb: var(--figure);
  --fh: var(--accent);
  --fg: var(--gear);
}
.page {
  --fb: color-mix(in srgb, var(--ink) 88%, var(--bg));
  --fh: var(--accent);
  --fg: color-mix(in srgb, var(--ink) 55%, var(--bg));
}
.ground {
  --fb: var(--on-ground);
  --fh: var(--accent);
  --fg: var(--on-ground-rule);
}
.flood {
  --fb: var(--flood-plate);
  --fh: var(--ink-ochre);
  --fg: color-mix(in srgb, var(--flood-plate) 55%, var(--flood));
}
.b {
  fill: var(--fb);
  /* a hairline of the same ink closes the seams where two flats meet */
  stroke: var(--fb);
  stroke-width: var(--w-hair);
  stroke-linejoin: miter;
  vector-effect: non-scaling-stroke;
}
.h {
  fill: var(--fh);
}
/* the far arm, behind him: a step lighter, as a poster prints the far limb */
.far .b {
  fill: color-mix(in srgb, var(--fb) 72%, var(--fg));
  stroke: none;
}
.hb {
  fill: color-mix(in srgb, var(--fb) 25%, var(--fh));
}
.g {
  fill: var(--fg);
}
.phones {
  stroke: var(--fg);
}
.grain {
  mix-blend-mode: soft-light;
  opacity: var(--grain-opacity);
}
@media (prefers-reduced-motion: reduce) {
  .travel.on {
    display: none;
  }
}
@media (forced-colors: active) {
  .travel.on {
    display: none;
  }
}
</style>
