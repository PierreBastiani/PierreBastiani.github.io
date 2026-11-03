// Deterministic ridgelines for the layered hero. Same seed, same hills, on every load.

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Smooth 1-D value noise in [0, 1].
function noise(x: number, seed: number): number {
  const i = Math.floor(x)
  const f = x - i
  const t = f * f * (3 - 2 * f)
  return hash(i + seed * 1000) * (1 - t) + hash(i + 1 + seed * 1000) * t
}

export interface Bump {
  x: number
  height: number // positive raises the ridge, negative digs a valley
  width: number
}

export interface RidgeOptions {
  seed: number
  base: number // y of the ridge's average line, in scene units
  amp: number // noise height
  scale?: number // horizontal frequency: smaller = wider hills
  octaves?: number
  bumps?: Bump[] // named summits and valleys
  x0?: number // first x drawn
  x1?: number // last x drawn
  step?: number
}

export function ridgeY(o: RidgeOptions, x: number): number {
  const { seed, base, amp, scale = 0.004, octaves = 3 } = o
  let y = 0
  let a = 1
  let f = scale
  let norm = 0
  for (let k = 0; k < octaves; k++) {
    y += a * noise(x * f, seed + k)
    norm += a
    a *= 0.5
    f *= 2.1
  }
  let h = (y / norm - 0.5) * 2 * amp
  for (const b of o.bumps ?? []) {
    const d = (x - b.x) / b.width
    h += b.height * Math.exp(-d * d)
  }
  return base - h
}

// The ridge as an open line, left to right.
export function ridgeLine(o: RidgeOptions): string {
  const { x0 = -1340, x1 = 2940, step = 12 } = o
  const pts: string[] = []
  for (let x = x0; x <= x1; x += step) pts.push(`${x.toFixed(1)} ${ridgeY(o, x).toFixed(1)}`)
  return `M${pts.join(' L')}`
}

// The ridge filled to a little below the bottom of the scene, so a layer lifted by the
// parallax never shows its lower edge.
export function ridgePath(o: RidgeOptions): string {
  const { x0 = -1340, x1 = 2940 } = o
  return `${ridgeLine(o)} L${x1} 1040 L${x0} 1040 Z`
}

export interface FacetOptions {
  minProm?: number // smallest rise from valley to peak that gets a shadow side
  smooth?: number // half-width of the moving average used to find peaks, scene units
  lean?: number // how far the shadow's spine leans right per unit down
  depth?: number // how far the spine runs down, as a multiple of the slope's rise
  x0?: number
  x1?: number
  step?: number
}

// The shadow sides of a ridge, for a two-flat print: the sun is low and to the right, so
// every slope that climbs from a valley up to a peak (it faces left, away from the sun) is
// in shade. Each shade is a wedge: the slope itself, then a spine from the peak down and a
// little to the right, back to the foot of the valley, so the masses read as faceted rock
// and the shade stops before the next plane. Peaks are found on a smoothed ridge so the
// noise doesn't cut the slope into slivers; the top edge follows the real ridge.
export function ridgeFacets(o: RidgeOptions, f: FacetOptions = {}): string {
  const { x0 = -1340, x1 = 2940, step = 8 } = o
  const { minProm = 14, smooth = 40, lean = 0.3, depth = 2.6 } = f
  const xs: number[] = []
  for (let x = f.x0 ?? x0; x <= (f.x1 ?? x1); x += f.step ?? step) xs.push(x)
  const ys = xs.map((x) => ridgeY(o, x))
  const k = Math.max(1, Math.round(smooth / (f.step ?? step)))
  const sm = ys.map((_, i) => {
    let s = 0
    let n = 0
    for (let j = Math.max(0, i - k); j <= Math.min(ys.length - 1, i + k); j++) {
      s += ys[j]!
      n++
    }
    return s / n
  })
  // alternate valleys (largest y) and peaks (smallest y), starting from a valley
  const ext: { i: number; peak: boolean }[] = [{ i: 0, peak: false }]
  for (let i = 1; i < sm.length - 1; i++) {
    const last = ext[ext.length - 1]!
    const isPeak = sm[i]! <= sm[i - 1]! && sm[i]! < sm[i + 1]!
    const isValley = sm[i]! >= sm[i - 1]! && sm[i]! > sm[i + 1]!
    if (isPeak) {
      if (last.peak) {
        if (sm[i]! < sm[last.i]!) last.i = i
      } else ext.push({ i, peak: true })
    } else if (isValley) {
      if (!last.peak) {
        if (sm[i]! > sm[last.i]!) last.i = i
      } else ext.push({ i, peak: false })
    }
  }
  const parts: string[] = []
  for (let e = 1; e < ext.length; e++) {
    const peak = ext[e]!
    const valley = ext[e - 1]!
    if (!peak.peak || valley.peak) continue
    const rise = sm[valley.i]! - sm[peak.i]!
    if (rise < minProm) continue
    const top: string[] = []
    for (let i = valley.i; i <= peak.i; i++) top.push(`${xs[i]!.toFixed(1)} ${ys[i]!.toFixed(1)}`)
    const px = xs[peak.i]!
    const py = ys[peak.i]!
    const vx = xs[valley.i]!
    const vy = ys[valley.i]!
    const d = rise * depth + 20
    const sx = px + d * lean
    const sy = py + d
    const fx = vx + (sx - vx) * 0.35
    const fy = vy + (sy - vy) * 0.6
    parts.push(`M${top.join(' L')} L${sx.toFixed(1)} ${sy.toFixed(1)} L${fx.toFixed(1)} ${fy.toFixed(1)} Z`)
  }
  return parts.join(' ')
}
