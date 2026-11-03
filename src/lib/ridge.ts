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
