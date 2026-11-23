import type { Course, CourseAt, CourseGround, CourseInk, CourseKit, CourseSeg } from '@/lib/journey'
import type { PoseId } from '@/lib/figure'

// The figure's route on the shop page (TravelFigure, see Course in lib/journey.ts). The hero
// part is the main page's: he leaves the desk and lands on the call button. Then he visits each
// before/after plate and crouches on it while its "after" vignette prints (OfferVisual's
// --fix), walks the line of the three steps on the flood from stop to stop (hops down from one
// to the next on phones, where the stops are stacked), stands on the trial card by the portrait,
// and ends sitting on the call band's top edge, over the phone number. Every move is tied to
// the scroll, so scrolling back plays him backwards. In the browser only.

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
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rectPath = (l: number, t: number, w: number, h: number) =>
  `M${l.toFixed(1)} ${t.toFixed(1)}H${(l + w).toFixed(1)}V${(t + h).toFixed(1)}H${l.toFixed(1)}Z`

interface Geo {
  k: number // the figure's scale off the drawings: px per figure unit
  plates: { el: HTMLElement; r: Rect; x: number }[] // x: where he works, over the "after" panel
  stops: { x: number; y: number }[] // on the line, right of each station
  flood: Rect | null
  trial: { x: number; y: number } | null
  call: Rect | null
  seat: { x: number; y: number } | null
}
let G: Geo | null = null
// each plate's print, as scroll positions: from, to
let fixes: { from: number; to: number }[] = []
const lastFix: string[] = []

function measure() {
  const q = (s: string) => document.querySelector<HTMLElement>(s)
  const narrow = window.matchMedia('(max-width: 52rem)').matches
  const k = narrow ? 0.44 : 0.56
  const plates = [...document.querySelectorAll<HTMLElement>('#commerces .ba')].map((el) => {
    const r = docRect(el)
    const after = el.querySelector('.after')
    const a = after ? docRect(after) : r
    return { el, r, x: a.l + a.w * 0.62 }
  })
  const stops = [...document.querySelectorAll<HTMLElement>('#etapes .stop')].map((el) => {
    const r = docRect(el)
    const st = el.querySelector('.station')
    const s = st ? docRect(st) : r
    return { x: s.l + s.w + 18 * k + 6, y: r.t }
  })
  const floodEl = q('#etapes')
  const trialEl = q('.rest .trial')
  const callEl = q('#contact')
  let trial: Geo['trial'] = null
  if (trialEl) {
    const r = docRect(trialEl)
    trial = { x: r.l + r.w - 34 * k - 14, y: r.t }
  }
  let seat: Geo['seat'] = null
  const call = callEl ? docRect(callEl) : null
  if (call) {
    // over the number, near the band's right end, legs over the edge
    const phone = callEl!.querySelector('.phone')
    const p = phone ? docRect(phone) : call
    seat = { x: Math.min(call.l + call.w - 44, p.l + p.w * 0.72), y: call.t + 1 }
  }
  G = { k, plates, stops, flood: floodEl ? docRect(floodEl) : null, trial, call, seat }
}

// standing places, followed as the page scrolls
const on =
  (x: number, y: number, k: number, pose: PoseId, flip = false): CourseAt =>
  (s) => ({ x, y: y - s, k, pose, flip })

function plan(kit: CourseKit) {
  const g = G
  fixes = []
  if (!g) return
  const { vh, push, leap, hold } = kit
  const k = g.k
  let from: CourseAt = kit.button
  const step = (seg: CourseSeg) => push(seg)

  // 1. the plates: each one's slot is while its top is between 80% and 24% of the window. Slots
  // that overlap (plates side by side, the zigzag's) share their span in reading order.
  const nominal = g.plates.map((p) => [p.r.t - vh * 0.8, p.r.t - vh * 0.24] as [number, number])
  const slots: [number, number][] = []
  for (let i = 0; i < nominal.length;) {
    let j = i + 1
    let end = nominal[i]![1]
    while (j < nominal.length && nominal[j]![0] < end - (end - nominal[i]![0]) * 0.5) {
      end = Math.max(end, nominal[j]![1])
      j++
    }
    const a = nominal[i]![0]
    for (let m = i; m < j; m++)
      slots.push([lerp(a, end, (m - i) / (j - i)), lerp(a, end, (m - i + 1) / (j - i))])
    i = j
  }
  g.plates.forEach((p, i) => {
    let [a, b] = slots[i]!
    a = Math.max(a, kit.now())
    b = Math.max(b, a + vh * 0.2)
    const w = b - a
    const stand = on(p.x, p.r.t, k, 'front')
    const work = on(p.x, p.r.t, k, 'crouch')
    step(hold(kit.now(), a, from))
    step(leap(a, a + w * 0.3, from, stand, 60 * k, 'front'))
    step(hold(kit.now(), a + w * 0.36, stand))
    step(hold(kit.now(), a + w * 0.9, work))
    fixes.push({ from: a + w * 0.38, to: a + w * 0.86 })
    from = on(p.x, p.r.t, k, 'stand')
  })

  // 2. the line: the first stop once the line is well in view, then along it (walking where
  // the stops share the line, hopping down where they're stacked)
  if (g.stops.length) {
    const k2 = k * 1.15
    const first = g.stops[0]!
    const lastStop = g.stops[g.stops.length - 1]!
    const flat = Math.abs(lastStop.y - first.y) < 4
    const arrive = Math.max(kit.now() + vh * 0.25, first.y - vh * 0.62)
    const at = (i: number, pose: PoseId) => on(g.stops[i]!.x, g.stops[i]!.y, k2, pose)
    step(hold(kit.now(), arrive - vh * 0.22, from))
    step(leap(kit.now(), arrive, from, at(0, 'front'), 70 * k, 'front'))
    if (flat) {
      // one line: he walks it while it crosses the window's upper half (from 62% to 20% of the
      // window), a short stop at each station, a walk between them
      const n = g.stops.length
      const unit = Math.max(vh * 0.05, (first.y - vh * 0.2 - kit.now()) / (n * 0.5 + (n - 1)))
      for (let i = 1; i < n; i++) {
        const a = g.stops[i - 1]!
        const b = g.stops[i]!
        step(hold(kit.now(), kit.now() + unit * 0.5, at(i - 1, 'front')))
        const s0 = kit.now()
        step({
          s0,
          s1: s0 + unit,
          at: (s, t) => ({
            x: lerp(a.x, b.x, t),
            y: a.y - s,
            k: k2,
            pose: t >= 1 ? 'front' : Math.floor(t * 9) % 2 ? 'stand' : 'stride',
          }),
        })
      }
      from = at(n - 1, 'front')
      step(hold(kit.now(), kit.now() + unit * 0.5, from))
    } else {
      // stacked: each stop while its rule is in the upper middle of the window
      for (let i = 1; i < g.stops.length; i++) {
        const t = Math.max(kit.now() + vh * 0.2, g.stops[i]!.y - vh * 0.55)
        step(hold(kit.now(), t - vh * 0.16, at(i - 1, 'front')))
        step(leap(kit.now(), t, at(i - 1, 'front'), at(i, 'front'), 40 * k, 'front'))
      }
      from = at(g.stops.length - 1, 'front')
    }
  }

  // 3. onto the trial card, beside the portrait
  if (g.trial) {
    const T = g.trial
    const land = Math.max(kit.now() + vh * 0.3, T.y - vh * 0.62)
    const there = on(T.x, T.y, k, 'front')
    step(hold(kit.now(), land - vh * 0.3, from))
    step(leap(kit.now(), land, from, there, 70 * k, 'front'))
    from = there
  }

  // 4. down to the call band, where he sits on its edge for good
  if (g.seat) {
    const S = g.seat
    const sitAt = Math.max(kit.now() + vh * 0.3, S.y - vh * 0.56)
    step(hold(kit.now(), sitAt - vh * 0.3, from))
    step(leap(kit.now(), sitAt, from, on(S.x, S.y, k, 'sit'), 60 * k, 'sit'))
    step(hold(kit.now(), kit.now() + 1e7, on(S.x, S.y, k, 'sit')))
  }
}

function grounds(s: number, vw: number): CourseGround[] {
  const g = G
  if (!g) return []
  const out: CourseGround[] = []
  const band = (r: Rect, ink: CourseInk, full = false) => {
    const l = full ? -8 : r.l
    const w = full ? vw + 16 : r.w
    out.push({
      ink,
      d: rectPath(l, r.t - s, w, r.h),
      box: [full ? 0 : r.l, r.t - s, full ? vw : r.l + r.w, r.t + r.h - s],
    })
  }
  for (const p of g.plates) band(p.r, 'scene')
  if (g.flood) band(g.flood, 'flood', true)
  if (g.call) band(g.call, 'ground')
  return out
}

const ink = (el: Element): CourseInk | null =>
  el.closest('#etapes') ? 'flood' : el.closest('#contact') ? 'ground' : null

// each plate's "after" prints as he works on it, a row of the roller at a time
function paint(s: number) {
  const g = G
  if (!g) return
  g.plates.forEach((p, i) => {
    const f = fixes[i]
    if (!f) return
    const t = clamp((s - f.from) / Math.max(1, f.to - f.from))
    const v = `${(t * 100).toFixed(1)}${t > 0 && t < 1 ? ' on' : ''}`
    if (v === lastFix[i]) return
    lastFix[i] = v
    p.el.style.setProperty('--fix', `${(t * 100).toFixed(1)}%`)
    p.el.classList.toggle('rolling', t > 0 && t < 1)
  })
}

export const shopCourse: Course = { measure, plan, grounds, ink, paint }
