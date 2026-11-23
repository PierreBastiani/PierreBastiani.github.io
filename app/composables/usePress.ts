import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// The site's signature: the pointer presses a screened plate like a finger on a printer's
// screen. Around it the dots swell toward one mid size in a few stepped rings, and they relax
// back once it leaves. Dot radius only: a tint is a dot size, never a gradient.
//
// One screen runs under the whole page. The paper (PressPaper.vue) prints it in a faint ink on
// the page's own tile grid, wherever the page ground shows: between sections, round cards, in
// the margins. The surfaces that carry a picture (the hero's sky, the topo's sky, the
// projects' flood, the footer band) print the same screen in their own inks, set on the same
// grid where they are flat, so a press that crosses a section's edge carries on into the plate:
// same reach, same rings, same ease, driven by the one pointer and the one frame loop below.
//
// Cost: nothing at rest. A surface's canvas is laid out but invisible and has no bitmap until
// the press first reaches its host; it is shown, and drawn, only while some dot is off its rest
// size. One rAF loop runs while the pointer moves or the dots relax, and stops when they settle.
// The paper keeps no bitmap once its dots settle; of the plates, only the last one pressed keeps
// one, and a plate that scrolls out of view gives it back. Scrolling never presses: a scroll
// lifts the press, and a pointer event with no movement (Chrome sends one when the page moves
// under a still pointer) is ignored. Fine pointers press; on touch a real tap (never a scroll)
// sends one soft ring through the screen. With reduced motion no canvas is ever rendered.

export const PRESS = {
  steps: 4, // stepped like the ramps: a tint is a dot size
  reach: 162, // px: the press's radius, the same on every surface (9 tiles of the hero's 18)
  depth: 0.22, // the radius, in tiles, pressed dots swell toward (30% of a tile's area inked)
  rise: 70, // ms: the ink spreads fast under the pointer…
  relax: 360, // …and lifts slowly behind it
  ripple: { ms: 1100, reach: 3, width: 2.2, depth: 0.7 }, // a tap's one ring (reach in reaches, width in tiles)
}

// A plate's lattice: position, rest radius and kind of each dot. kind 0 is an ink dot on the
// paper, 1 a paper dot on the ink, 2 a tile that takes no dot (a picture sits on it).
export type Lattice = { xs: Float32Array; ys: Float32Array; r0: Float32Array; kind: Uint8Array }
// Colours as canvas strings, read from the CSS when a plate is shown (the theme may change).
export type Inks = {
  ground: string
  ink: string
  paper: string
  inkPress: string
  paperPress: string
}
export type Frame = { w: number; h: number; top: number }
export type Built = {
  lattice: Lattice
  under?: (ctx: CanvasRenderingContext2D, inks: Inks) => void // the rest picture under the dots
}

export type PressOptions = {
  canvas: Ref<HTMLCanvasElement | null>
  host: () => HTMLElement | null // the box the press must reach for the plate to wake
  tile: number // px
  depth?: number // tiles; PRESS.depth by default
  rest?: number // tiles: the rest radius of a flat plate's dots (0: invisible at rest)
  // CSS colours; ink is required, the others fall back (pressed dots keep their rest ink)
  inks: { ink: string; paper?: string; inkPress?: string; paperPress?: string; ground?: string }
  // a plate with its own lattice (the hero's ramp); without it the plate is a flat screen set on
  // the page's own tile grid, the paper's, so the press runs on across its edge
  build?: (f: Frame, canvas: HTMLCanvasElement) => Built | null
  clip?: (ctx: CanvasRenderingContext2D, f: Frame) => void // where the plate is printed
  avoid?: string // selector, inside the host: no dots on these boxes (pictures)
  windowed?: boolean // the canvas covers only the part of its box in view (tall sections)
}

// ---- the one pointer and the one frame loop ---------------------------------------------

// What a surface needs from the loop each frame. Pointer in viewport px; the tap in page px,
// so its ring stays where it was struck when the page scrolls.
type Step = {
  mx: number
  my: number
  hover: boolean
  sx: number
  sy: number
  up: number
  down: number
  tap: { x: number; y: number } | null
  ring: number // px, the tap ring's radius (-1: none)
  ringAmp: number
}
type Surface = {
  host: () => HTMLElement | null
  shown: () => boolean
  show: () => boolean
  step: (s: Step) => boolean // advance and draw; true while some dot still moves
  release: () => void
}

const surfaces = new Set<Surface>()
const pointer = { x: 0, y: 0, hover: false, at: 0 }
let tap: { x: number; y: number; t: number } | null = null
let frame = 0
let last = 0

const step4 = (c: number) => Math.round(c * PRESS.steps) / PRESS.steps
const ease = (c: number) => c * c * (3 - 2 * c)

// How pressed a dot at (x, y) should be, in the same px as the pointer and the ring's centre.
function target(
  s: Step,
  x: number,
  y: number,
  hx: number,
  hy: number,
  tx: number,
  ty: number,
  p: number,
) {
  let t = 0
  const reach = PRESS.reach
  if (s.hover) {
    const dx = x - hx
    const dy = y - hy
    if (dx < reach && dx > -reach && dy < reach && dy > -reach) {
      const c = 1 - Math.hypot(dx, dy) / reach
      if (c > 0) t = step4(ease(c))
    }
  }
  if (s.ring >= 0) {
    const d = Math.abs(Math.hypot(x - tx, y - ty) - s.ring) / (PRESS.ripple.width * p)
    if (d < 1) t = Math.max(t, step4(s.ringAmp * ease(1 - d)))
  }
  return t
}

// Does the press reach this box (viewport px)?
function reaches(s: Step, r: DOMRect) {
  const R = PRESS.reach
  if (s.hover && s.mx > r.left - R && s.mx < r.right + R && s.my > r.top - R && s.my < r.bottom + R)
    return true
  if (s.tap) {
    const R2 = PRESS.ripple.reach * R + PRESS.ripple.width * 18
    const x = s.tap.x - s.sx
    const y = s.tap.y - s.sy
    if (x > r.left - R2 && x < r.right + R2 && y > r.top - R2 && y < r.bottom + R2) return true
  }
  return false
}

function tick(t: number) {
  frame = 0
  const dt = last ? Math.min(64, t - last) : 16
  last = t
  let ring = -1
  let ringAmp = 0
  if (tap) {
    const age = (t - tap.t) / PRESS.ripple.ms
    if (age >= 1) tap = null
    else {
      ring = ease(age) * PRESS.ripple.reach * PRESS.reach
      ringAmp = PRESS.ripple.depth * (1 - age)
    }
  }
  const s: Step = {
    mx: pointer.x,
    my: pointer.y,
    hover: pointer.hover,
    sx: scrollX,
    sy: scrollY,
    up: 1 - Math.exp(-dt / PRESS.rise),
    down: 1 - Math.exp(-dt / PRESS.relax),
    tap,
    ring,
    ringAmp,
  }
  let busy = false
  for (const surface of surfaces) {
    if (!surface.shown()) {
      // a sleeping surface wakes only when the press reaches its host (nothing in the layout
      // is dirty at the top of a frame, so reading the box costs no reflow)
      const host = surface.host()
      if (!host || !reaches(s, host.getBoundingClientRect()) || !surface.show()) continue
    }
    if (surface.step(s)) busy = true
  }
  if (busy || tap) frame = requestAnimationFrame(tick)
  else last = 0
}
function wake() {
  if (!frame) frame = requestAnimationFrame(tick)
}

function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  // the page scrolling under a still pointer is not a press
  if (!e.movementX && !e.movementY) return
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.hover = true
  pointer.at = e.timeStamp
  wake()
}
function lift() {
  if (!pointer.hover) return
  pointer.hover = false
  wake()
}
// leaving the window
function onOut(e: PointerEvent) {
  if (e.pointerType === 'mouse' && !e.relatedTarget) lift()
}
// a plain scroll lifts the press; a scroll while the pointer moves keeps it
function onScroll() {
  if (pointer.hover && performance.now() - pointer.at > 80) lift()
}
// a click only fires for a tap that stayed put, never for a scroll or a swipe
function onTap(e: MouseEvent) {
  const k = (e as PointerEvent).pointerType
  if (k === 'mouse' || (!k && matchMedia('(hover: hover)').matches)) return
  last = 0
  tap = { x: e.clientX + scrollX, y: e.clientY + scrollY, t: performance.now() }
  wake()
}
function onResize() {
  for (const surface of surfaces) surface.release()
}

function join(surface: Surface) {
  if (!surfaces.size) {
    addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    addEventListener('blur', lift, { passive: true })
    addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('click', onTap, { passive: true })
    addEventListener('resize', onResize, { passive: true })
  }
  surfaces.add(surface)
}
function leave(surface: Surface) {
  surfaces.delete(surface)
  if (surfaces.size) return
  removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerout', onOut)
  removeEventListener('blur', lift)
  removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onTap)
  removeEventListener('resize', onResize)
  cancelAnimationFrame(frame)
  frame = 0
  last = 0
}

// ---- colours and bitmaps ----------------------------------------------------------------

let probe: CanvasRenderingContext2D | null = null
// Canvas takes any CSS colour Chrome computes, but color-mix() computes to color(srgb …),
// which older engines' canvases don't parse: write it as rgba.
function canvasColour(c: string) {
  const m = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/.exec(c)
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((v) => Math.round(Number(v) * 255))
    return `rgba(${r}, ${g}, ${b}, ${m[4] ?? 1})`
  }
  probe ??= document.createElement('canvas').getContext('2d')
  if (!probe) return c
  probe.fillStyle = '#000'
  probe.fillStyle = c
  return String(probe.fillStyle)
}
// A CSS colour expression, resolved where the canvas sits (its custom properties apply).
function readColour(cv: HTMLCanvasElement, expr: string | undefined, fallback: string) {
  if (!expr) return fallback
  cv.style.color = expr
  const c = canvasColour(getComputedStyle(cv).color)
  cv.style.color = ''
  return c
}
// Size a canvas's bitmap to its CSS box, at the screen's density (2 at most).
function bitmap(cv: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  cv.width = Math.round(w * dpr)
  cv.height = Math.round(h * dpr)
  const ctx = cv.getContext('2d')
  ctx?.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0)
  return ctx
}
function drop(cv: HTMLCanvasElement | null) {
  if (cv && cv.width) cv.width = cv.height = 0
}

// Mount a surface: no canvas at all with reduced motion; a new canvas comes with a 300 × 150
// bitmap, so none until the first press.
function mount(
  surface: Surface,
  canvas: Ref<HTMLCanvasElement | null>,
  watch?: () => HTMLElement | null,
) {
  const enabled = ref(false)
  let seen: IntersectionObserver | null = null
  onMounted(async () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    enabled.value = true
    await nextTick()
    drop(canvas.value)
    join(surface)
    const box = watch?.()
    if (!box) return
    seen = new IntersectionObserver((es) => {
      if (es.some((e) => !e.isIntersecting)) surface.release()
    })
    seen.observe(box)
  })
  onBeforeUnmount(() => {
    seen?.disconnect()
    surface.release()
    leave(surface)
  })
  return enabled
}

// ---- the paper: the page-wide screen ----------------------------------------------------

// The page's ground, pressed. One fixed canvas the size of the viewport, under every section
// (see PressPaper.vue); its lattice is the whole page's tile grid, kept sparse: only the dots
// off their rest size (none at rest) are held, by their tile.
export function usePressPaper(o: {
  canvas: Ref<HTMLCanvasElement | null>
  tile: number
  ink: string
  depth?: number
}) {
  const p = o.tile
  const act = new Map<number, number>() // dot key → how pressed it is, 0 → 1
  const W = 1 << 13 // tiles per row in a key
  let ctx: CanvasRenderingContext2D | null = null
  let shown = false
  let ink = ''
  let vw = 0
  let vh = 0
  let dirty: [number, number, number, number] | null = null // viewport box of the last drawing

  // a dot's page position from its key: two dots per tile, at a quarter and three quarters
  const kx = (key: number) => (((key >> 1) % W) + 0.25 + 0.5 * (key & 1)) * p
  const ky = (key: number) => (Math.floor((key >> 1) / W) + 0.25 + 0.5 * (key & 1)) * p

  function show() {
    const cv = o.canvas.value
    if (!cv) return false
    // the canvas's own box: the viewport less any classic scrollbar
    vw = cv.clientWidth
    vh = cv.clientHeight
    if (!vw || !vh) return false
    ctx = bitmap(cv, vw, vh)
    if (!ctx) return false
    ink = readColour(cv, o.ink, '')
    dirty = null
    cv.classList.add('on')
    shown = true
    return true
  }
  function release() {
    const cv = o.canvas.value
    cv?.classList.remove('on')
    drop(cv)
    ctx = null
    shown = false
    act.clear()
  }

  // every tile under a box (page px) whose dots aren't held yet
  function gather(
    s: Step,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    hx: number,
    hy: number,
    tx: number,
    ty: number,
  ) {
    const i0 = Math.max(0, Math.floor(x0 / p))
    const j0 = Math.max(0, Math.floor(y0 / p))
    const i1 = Math.min(W - 1, Math.ceil(x1 / p))
    const j1 = Math.ceil(y1 / p)
    let added = false
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++)
        for (let q = 0; q < 2; q++) {
          const key = ((j * W + i) << 1) | q
          if (act.has(key)) continue
          const t = target(s, (i + 0.25 + 0.5 * q) * p, (j + 0.25 + 0.5 * q) * p, hx, hy, tx, ty, p)
          if (t > 0) {
            act.set(key, t * s.up)
            added = true
          }
        }
    return added
  }

  function step(s: Step) {
    const c = ctx
    if (!c) return false
    // pointer and ring in page px
    const hx = s.mx + s.sx
    const hy = s.my + s.sy
    const tx = s.tap ? s.tap.x : 0
    const ty = s.tap ? s.tap.y : 0
    let busy = false
    for (const [key, v] of act) {
      const t = target(s, kx(key), ky(key), hx, hy, tx, ty, p)
      const d = t - v
      if (d > 0.015 || d < -0.015) {
        act.set(key, v + d * (d > 0 ? s.up : s.down))
        busy = true
      } else if (t > 0) act.set(key, t)
      else act.delete(key)
    }
    const R = PRESS.reach
    if (s.hover && gather(s, hx - R, hy - R, hx + R, hy + R, hx, hy, tx, ty)) busy = true
    if (s.ring >= 0) {
      const R2 = s.ring + PRESS.ripple.width * p
      // only the tiles in view: the ring is lost past the screen's edge anyway
      if (
        gather(
          s,
          Math.max(tx - R2, s.sx),
          Math.max(ty - R2, s.sy),
          Math.min(tx + R2, s.sx + vw),
          Math.min(ty + R2, s.sy + vh),
          hx,
          hy,
          tx,
          ty,
        )
      )
        busy = true
    }

    // draw only the box the dots cover, and clear the one they covered last frame
    const to = (o.depth ?? PRESS.depth) * p
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    c.beginPath()
    for (const [key, v] of act) {
      const r = to * v
      if (r < 0.1) continue
      const x = kx(key) - s.sx
      const y = ky(key) - s.sy
      if (x < -r || y < -r || x > vw + r || y > vh + r) continue
      if (x < x0) x0 = x
      if (y < y0) y0 = y
      if (x > x1) x1 = x
      if (y > y1) y1 = y
      c.moveTo(x + r, y)
      c.arc(x, y, r, 0, 2 * Math.PI)
    }
    const next: typeof dirty =
      x1 >= x0 ? [x0 - to - 1, y0 - to - 1, x1 + to + 1, y1 + to + 1] : null
    if (dirty) c.clearRect(dirty[0], dirty[1], dirty[2] - dirty[0], dirty[3] - dirty[1])
    if (next) {
      c.clearRect(next[0], next[1], next[2] - next[0], next[3] - next[1])
      c.fillStyle = ink
      c.fill()
    }
    dirty = next
    if (!busy && !act.size) release()
    return busy
  }

  const surface: Surface = {
    host: () => document.documentElement,
    shown: () => shown,
    show,
    step,
    release,
  }
  return mount(surface, o.canvas)
}

// ---- a plate: a section's own screen -----------------------------------------------------

// The last plate pressed: the only one that keeps its bitmap once its dots settle.
let kept: Surface | null = null

export function usePress(o: PressOptions) {
  let ctx: CanvasRenderingContext2D | null = null
  let shown = false
  let f: Frame = { w: 0, h: 0, top: 0 }
  let inks: Inks = { ground: '', ink: '', paper: '', inkPress: '', paperPress: '' }
  let under: Built['under']
  let xs: Float32Array = new Float32Array(0)
  let ys: Float32Array = new Float32Array(0)
  let r0: Float32Array = new Float32Array(0)
  let kind: Uint8Array = new Uint8Array(0)
  let v = new Float32Array(0) // how pressed each dot is, 0 → 1
  const p = o.tile

  function readInks(cv: HTMLCanvasElement) {
    const ink = readColour(cv, o.inks.ink, '')
    const paper = readColour(cv, o.inks.paper, 'transparent')
    inks = {
      ground: readColour(cv, o.inks.ground, ''),
      ink,
      paper,
      inkPress: readColour(cv, o.inks.inkPress, ink),
      paperPress: readColour(cv, o.inks.paperPress, paper),
    }
  }

  // A flat screen on the page's tile grid, with the avoided boxes left bare.
  function flat(cv: HTMLCanvasElement): Lattice {
    const cr = cv.getBoundingClientRect()
    const ox = ((-(cr.left + scrollX) % p) + p) % p
    const oy = ((-(cr.top + scrollY) % p) + p) % p
    const cols = Math.ceil(f.w / p) + 1
    const rows = Math.ceil(f.h / p) + 1
    const n = cols * rows * 2
    const L: Lattice = {
      xs: new Float32Array(n),
      ys: new Float32Array(n),
      r0: new Float32Array(n),
      kind: new Uint8Array(n),
    }
    const r = (o.rest ?? 0) * p
    let k = 0
    for (let j = -1; j < rows - 1; j++)
      for (let i = -1; i < cols - 1; i++)
        for (const q of [0.25, 0.75]) {
          L.xs[k] = ox + (i + q) * p
          L.ys[k] = oy + (j + q) * p
          L.r0[k] = r
          k++
        }
    return L
  }

  function avoidBoxes(L: Lattice, cv: HTMLCanvasElement) {
    const host = o.host()
    if (!o.avoid || !host) return
    const cr = cv.getBoundingClientRect()
    const pad = p * 0.5
    const boxes = [...host.querySelectorAll(o.avoid)]
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width && b.height)
      .map((b) => [
        b.left - cr.left - pad,
        b.top - cr.top - pad,
        b.right - cr.left + pad,
        b.bottom - cr.top + pad,
      ])
    if (!boxes.length) return
    for (let k = 0; k < L.xs.length; k++) {
      const x = L.xs[k]!
      const y = L.ys[k]!
      for (const [a, b, c, d] of boxes)
        if (x > a! && x < c! && y > b! && y < d!) {
          L.kind[k] = 2
          break
        }
    }
  }

  function measure(cv: HTMLCanvasElement) {
    if (o.windowed) {
      // only the part of the box in view, and a reach past it, gets a bitmap
      const box = cv.parentElement!.getBoundingClientRect()
      const y0 = Math.max(0, Math.floor(-box.top - PRESS.reach))
      const y1 = Math.min(box.height, Math.ceil(innerHeight - box.top + PRESS.reach))
      if (y1 - y0 < 1) return false
      cv.style.top = `${y0}px`
      cv.style.height = `${y1 - y0}px`
    }
    const cr = cv.getBoundingClientRect()
    if (cr.width < 1 || cr.height < 1) return false
    f = { w: cr.width, h: cr.height, top: parseFloat(cv.style.top) || 0 }
    ctx = bitmap(cv, f.w, f.h)
    readInks(cv)
    const built = o.build?.(f, cv)
    if (o.build && !built) return false
    const L = built?.lattice ?? flat(cv)
    under = built?.under
    avoidBoxes(L, cv)
    xs = L.xs
    ys = L.ys
    r0 = L.r0
    kind = L.kind
    v = new Float32Array(xs.length)
    return true
  }

  function dots(c: CanvasRenderingContext2D, which: 0 | 1, pressed: boolean, to: number) {
    c.beginPath()
    for (let k = 0; k < v.length; k++) {
      if (kind[k] !== which || v[k]! > 0 !== pressed) continue
      const r = r0[k]! + (to - r0[k]!) * v[k]!
      if (r < 0.1) continue
      c.moveTo(xs[k]! + r, ys[k]!)
      c.arc(xs[k]!, ys[k]!, r, 0, 2 * Math.PI)
    }
    c.fill()
  }

  function draw() {
    const c = ctx
    if (!c) return
    const to = (o.depth ?? PRESS.depth) * p
    c.clearRect(0, 0, f.w, f.h)
    if (inks.ground) {
      c.fillStyle = inks.ground
      c.fillRect(0, 0, f.w, f.h)
    }
    under?.(c, inks)
    if (o.clip) {
      c.save()
      o.clip(c, f)
    }
    // paper dots, then ink dots, as the SVG plates print them; pressed dots in the press inks
    c.fillStyle = inks.paper
    dots(c, 1, false, to)
    c.fillStyle = inks.paperPress
    dots(c, 1, true, to)
    c.fillStyle = inks.ink
    dots(c, 0, false, to)
    c.fillStyle = inks.inkPress
    dots(c, 0, true, to)
    if (o.clip) c.restore()
  }

  function step(s: Step) {
    const cv = o.canvas.value
    if (!cv || !ctx) return false
    // the plate may ride a parallax or the page may scroll: read its box each frame
    const cr = cv.getBoundingClientRect()
    const hx = s.mx - cr.left
    const hy = s.my - cr.top
    const tx = s.tap ? s.tap.x - s.sx - cr.left : 0
    const ty = s.tap ? s.tap.y - s.sy - cr.top : 0
    let busy = false
    let pressed = false
    for (let k = 0; k < v.length; k++) {
      const t = target(s, xs[k]!, ys[k]!, hx, hy, tx, ty, p)
      const d = t - v[k]!
      if (d > 0.015 || d < -0.015) {
        v[k] = v[k]! + d * (d > 0 ? s.up : s.down)
        busy = true
      } else v[k] = t
      if (v[k]! > 0) pressed = true
    }
    draw()
    if (!busy && !pressed) hide()
    return busy
  }

  function show() {
    const cv = o.canvas.value
    if (!cv) return false
    // pressing a plate gives the last one's bitmap back, once its dots have settled
    if (kept && kept !== me && !kept.shown()) kept.release()
    kept = me
    // measured afresh each time: the page may have scrolled under a windowed plate
    if (!measure(cv)) return false
    draw() // the rest state, the same picture as the plate under it
    cv.classList.add('on')
    shown = true
    return true
  }
  function hide() {
    o.canvas.value?.classList.remove('on')
    shown = false
    if (kept !== me) release()
  }
  // Give the bitmap back: the plate scrolled away, the window changed, or another plate went live.
  function release() {
    o.canvas.value?.classList.remove('on')
    shown = false
    drop(o.canvas.value)
    ctx = null
    xs = ys = r0 = v = new Float32Array(0)
    kind = new Uint8Array(0)
    if (kept === me) kept = null
  }
  const me: Surface = { host: o.host, shown: () => shown, show, step, release }
  return mount(me, o.canvas, o.host)
}
