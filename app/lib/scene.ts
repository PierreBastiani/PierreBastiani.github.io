// Geometry for the hero: the view south from the Baou de Saint-Jeannet, generated once.
//
// Every layer shares one coordinate system: x from -1300 to 2900, y from 0 (top) to 1000
// (bottom of the scene). Layers are scaled by the scene height, so the composition never
// changes vertically; wider screens just see more to the left and right. A phone shows
// roughly x 460 to 1140, so Saint-Jeannet, the summit, Saint-Paul and a piece of coast live
// there. Left is east (the Var, Nice), right is west (Vence, Saint-Paul, Antibes, the Estérel).
// Heights are exaggerated about 2 to 3 times, like a panorama poster.

export const VIEW = { x0: -1300, x1: 2900, horizon: 520 }

export type Rect = { x: number; y: number; w: number; h: number }
export type Dot = { x: number; y: number; r: number }
export type Pt = [number, number]

// mulberry32: tiny and seedable.
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f1 = (n: number) => n.toFixed(1)
const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')} Z`

// A flat-bottomed cloud: the outline of overlapping circles, flattened.
export function cloud(seed: number, base: number, from: number, to: number, rMin: number, rMax: number) {
  const r = rng(seed)
  const puffs: { x: number; r: number }[] = []
  for (let x = from; x < to; x += rMin + r() * (rMax - rMin)) puffs.push({ x, r: rMin + r() * (rMax - rMin) })
  const pts: string[] = []
  for (let x = from - rMax; x <= to + rMax; x += 4) {
    let top = 0
    for (const p of puffs) {
      const d = x - p.x
      if (Math.abs(d) < p.r) top = Math.max(top, Math.sqrt(p.r * p.r - d * d) * 0.5)
    }
    if (top > 0) pts.push(`${f1(x)} ${f1(base - top)}`)
  }
  return `M${pts.join(' L')} Z`
}

// The shoreline, east to west: Nice and the Baie des Anges, the airport spit, the Var mouth,
// Saint-Laurent, Cagnes, Antibes and the cap pointing out to sea, then Juan-les-Pins.
const SHORE: Pt[] = [
  [-1340, 534],
  [-900, 536],
  [-700, 541],
  [-400, 547],
  [-100, 549],
  [120, 546],
  [150, 539], // airport
  [270, 535],
  [292, 540],
  [250, 546],
  [300, 548], // Var mouth
  [450, 549],
  [600, 550],
  [760, 549], // Cagnes
  [950, 546],
  [1150, 542],
  [1300, 538], // Antibes
  [1360, 532],
  [1420, 527],
  [1470, 524], // Cap d'Antibes
  [1478, 527],
  [1440, 534],
  [1420, 540],
  [1520, 540],
  [1700, 534],
  [2000, 528],
  [2400, 524],
  [2940, 522],
]

export function coastPath(bottom: number) {
  return `M${SHORE.map(([x, y]) => `${x} ${y}`).join(' L')} L2940 ${bottom} L-1340 ${bottom} Z`
}

// y of the shore at x along the main line (ignores the spit and the cap folding back).
function shoreAt(x: number) {
  const line = SHORE.filter(([px], i) => i === 0 || px > SHORE[i - 1]![0])
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i]!
    const [bx, by] = line[i + 1]!
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax)
  }
  return 540
}

// Towns along the shore as a thin band of blocks.
const TOWNS: [number, number, number][] = [
  [-820, 110, 0.75], // Nice
  [320, 460, 0.5], // Saint-Laurent-du-Var
  [620, 880, 0.55], // Cagnes-sur-Mer
  [1230, 1400, 0.7], // Antibes
  [1500, 1720, 0.35], // Juan-les-Pins
]

export function cityBlocks(seed: number) {
  const r = rng(seed)
  const blocks: Rect[] = []
  for (const [a, b, density] of TOWNS) {
    for (let x = a; x < b; x += 5 + r() * 6) {
      if (r() > density) continue
      const w = 3 + r() * 5
      const h = 2 + r() * 3
      blocks.push({ x, y: shoreAt(x) + 1 + r() * 7 - h, w, h })
    }
  }
  return blocks
}

// Street lights along the shore for dusk.
export function shoreLights(seed: number) {
  const r = rng(seed)
  const dots: Dot[] = []
  for (const [a, b] of TOWNS) {
    for (let x = a; x < b; x += 9 + r() * 6) dots.push({ x, y: shoreAt(x) + 1.5 + r() * 5, r: 1 + r() * 0.4 })
  }
  return dots
}

// The Var valley floor at its mouth, between the airport and Saint-Laurent. It sits behind the
// far hills, so it only shows through their notch as a small light gap at the coast.
export const VAR_PLAIN = 'M184 549 L316 550 L372 700 L120 700 Z'

// A village: a tight cluster of houses with roofs, stepped up a spur, plus a bell tower.
export function village(seed: number, cx: number, cy: number, radius: number, count: number, size: number) {
  const r = rng(seed)
  const houses: Rect[] = []
  for (let i = 0; i < count; i++) {
    const u = (r() * 2 - 1) * radius
    const w = size * (0.8 + r() * 0.8)
    const h = size * (0.55 + r() * 0.35)
    const y = cy + (Math.abs(u) / radius) * size * 1.2 + r() * size * 0.8
    houses.push({ x: cx + u - w / 2, y, w, h })
  }
  houses.sort((a, b) => a.y - b.y)
  const tower: Rect = { x: cx - size * 0.25, y: cy - size * 1.6, w: size * 0.5, h: size * 1.9 }
  return { houses, tower }
}

// One lit window in every few houses, for dusk.
export function windows(houses: Rect[], every: number, seed: number): Dot[] {
  const r = rng(seed)
  return houses.filter(() => r() < 1 / every).map((h) => ({ x: h.x + h.w * 0.5, y: h.y + h.h * 0.55, r: Math.max(0.9, h.h * 0.22) }))
}

// Lines of code for a screen: indent, length, colour index. Same file every load.
export function codeLines(seed: number, rows: number, maxLen: number) {
  const r = rng(seed)
  const lines: { indent: number; len: number; tone: number }[] = []
  let indent = 0
  for (let i = 0; i < rows; i++) {
    if (r() < 0.12) {
      lines.push({ indent: 0, len: 0, tone: 0 })
      indent = 0
      continue
    }
    if (r() < 0.3) indent = Math.min(3, indent + 1)
    else if (r() < 0.25) indent = Math.max(0, indent - 1)
    const len = Math.max(0.15, Math.min(1, 0.25 + r() * 0.7)) * (maxLen - indent * 4)
    const t = r()
    lines.push({ indent, len, tone: t < 0.6 ? 0 : t < 0.82 ? 1 : 2 })
  }
  return lines
}
