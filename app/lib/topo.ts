// The crag behind the skills map, drawn like a Swiss topographic map turned into a relief
// model: two summits as a height field, contour lines traced from it every 20 m (an index
// line every 100 m), the rock band hachured along the fall line, spot heights on the tops.
// Each contour level is a slab at its own height; the camera sits on the south side, above,
// and turns a little with the pointer or the scroll.
//
// Plan coordinates: x 0 to 1000 (west to east as drawn), z 0 to 940 (north to south, toward
// the viewer). The original flat map squashed z by 0.68 to fit 1000 × 640; MAP_SQUASH undoes it.

export type Pt = [number, number]
export type Vec3 = [number, number, number]

export interface Summit {
  x: number
  y: number // in flat-map units (squashed)
  r: number // radius of the mountain's foot
  top: number // height of the top, in contour intervals
  cliff: number // how much steeper the south face (toward the viewer) is than the north
  seed: number
}

export const MAP_SQUASH = 0.68
// The big one tops out at 802 m like the Baou de Saint-Jeannet: 500 m + 15.1 × 20 m.
export const SUMMITS: Summit[] = [
  { x: 640, y: 230, r: 330, top: 15.1, cliff: 2.8, seed: 0 },
  { x: 250, y: 430, r: 210, top: 9.4, cliff: 1.3, seed: 1.7 },
]
export const DZ = 18 // height of one contour interval in the model, exaggerated
export const INTERVAL_M = 20 // metres per contour interval
export const BASE_M = 500 // altitude of level 0
export const INDEX_EVERY = 5 // an index contour every 100 m

function wobble(s: Summit, a: number, t: number) {
  return (
    1 +
    0.13 * Math.sin(3 * a + s.seed) +
    0.07 * Math.sin(5 * a + 1.3 + s.seed * 2) +
    0.03 * Math.sin(9 * a + 0.7) +
    0.05 * Math.sin(2 * a + 5 * t + s.seed)
  )
}

// One summit's height at a plan point, in contour intervals. The profile is 1 - t^q: with a
// small q the slope is even, with a large one the top stays broad and the flank drops in a
// wall near the foot. q grows on the south side, so that's where the rock band is.
function summitHeight(s: Summit, x: number, z: number) {
  const dx = x - s.x
  const dz = z - s.y / MAP_SQUASH
  const a = Math.atan2(dz, dx)
  const south = Math.max(0, Math.sin(a))
  const q = 1.7 + s.cliff * south ** 1.5
  let t = Math.hypot(dx, dz) / s.r
  t /= wobble(s, a, t)
  return t >= 1 ? 0 : s.top * (1 - t ** q)
}

// The field: the higher of the two summits at each point, in contour intervals.
export function field(x: number, z: number) {
  let h = 0
  for (const s of SUMMITS) h = Math.max(h, summitHeight(s, x, z))
  return h
}

// Ground height for draping the routes, in model units.
export const heightAt = (x: number, z: number) => field(x, z) * DZ

// Contour lines by marching squares on a grid over the plan, joined into closed rings and
// smoothed once. Every ring knows its level (1 = the lowest).
const GRID = { x0: -40, x1: 1040, z0: -40, z1: 1000, step: 10 }
export function contourRings(): { level: number; plan: Pt[] }[] {
  const { x0, z0, step } = GRID
  const nx = Math.round((GRID.x1 - x0) / step)
  const nz = Math.round((GRID.z1 - z0) / step)
  const H: number[][] = []
  for (let j = 0; j <= nz; j++) {
    const row: number[] = []
    for (let i = 0; i <= nx; i++) row.push(field(x0 + i * step, z0 + j * step))
    H.push(row)
  }
  const top = Math.floor(Math.max(...H.flat()))
  const out: { level: number; plan: Pt[] }[] = []
  for (let level = 1; level <= top; level++) {
    // points on cell edges, keyed by edge; each cell crossing links two edges
    const pts = new Map<string, Pt>()
    const links = new Map<string, string[]>()
    const at = (i: number, j: number) => H[j]![i]!
    const edge = (kind: 'h' | 'v', i: number, j: number) => {
      const key = `${kind}${i},${j}`
      if (!pts.has(key)) {
        const [a, b] = kind === 'h' ? [at(i, j), at(i + 1, j)] : [at(i, j), at(i, j + 1)]
        const f = (level - a) / (b - a)
        pts.set(key, kind === 'h' ? [x0 + (i + f) * step, z0 + j * step] : [x0 + i * step, z0 + (j + f) * step])
      }
      return key
    }
    const link = (a: string, b: string) => {
      links.set(a, [...(links.get(a) ?? []), b])
      links.set(b, [...(links.get(b) ?? []), a])
    }
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)].map((v) => (v >= level ? 1 : 0))
        const code = c[0]! | (c[1]! << 1) | (c[2]! << 2) | (c[3]! << 3)
        if (code === 0 || code === 15) continue
        const T = () => edge('h', i, j)
        const R = () => edge('v', i + 1, j)
        const B = () => edge('h', i, j + 1)
        const L = () => edge('v', i, j)
        const centre = (at(i, j) + at(i + 1, j) + at(i + 1, j + 1) + at(i, j + 1)) / 4 >= level
        switch (code) {
          case 1: case 14: link(L(), T()); break
          case 2: case 13: link(T(), R()); break
          case 3: case 12: link(L(), R()); break
          case 4: case 11: link(R(), B()); break
          case 6: case 9: link(T(), B()); break
          case 7: case 8: link(L(), B()); break
          case 5: if (centre) { link(L(), B()); link(T(), R()) } else { link(L(), T()); link(R(), B()) } break
          case 10: if (centre) { link(L(), T()); link(R(), B()) } else { link(L(), B()); link(T(), R()) } break
        }
      }
    }
    const seen = new Set<string>()
    for (const startKey of links.keys()) {
      if (seen.has(startKey)) continue
      const ring: Pt[] = []
      let prev = ''
      let cur = startKey
      while (cur && !seen.has(cur)) {
        seen.add(cur)
        ring.push(pts.get(cur)!)
        const next = links.get(cur)!.find((k) => k !== prev && !seen.has(k))
        prev = cur
        cur = next ?? ''
      }
      if (ring.length > 8) out.push({ level, plan: chaikin(ring) })
    }
  }
  return out
}

// One round of corner cutting on every third point: takes the grid's facets off the lines
// and keeps the rings light enough to reproject on every frame of a camera move.
function chaikin(ring: Pt[]): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < ring.length; i += 3) {
    const a = ring[i]!
    const b = ring[(i + 3) % ring.length]!
    out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75])
  }
  return out
}

// Rock hachures, the Swiss way, on the cliff band only. In the relief model a contour
// interval on a wall is the riser between two slabs, so each riser gets one row of strokes:
// evenly spaced along the contour, running straight down the fall line from the upper contour
// to the lower one, drawn as tapered wedges (wide at the top, a point at the bottom). Steeper
// ground gets wider, closer wedges. Only risers that are steep and face the viewer (south)
// get them, so nothing is drawn where the riser is hidden or where the slope is gentle.
export function hachures(rings: { level: number; plan: Pt[] }[], steep = 0.09) {
  const out: { level: number; a: Vec3; b: Vec3; c: Vec3 }[] = []
  for (const r of rings) {
    const top = r.level * DZ
    const low = (r.level - 1) * DZ
    const n = r.plan.length
    let carry = 0
    for (let i = 0; i < n; i++) {
      const p = r.plan[i]!
      const q = r.plan[(i + 1) % n]!
      const seg = Math.hypot(q[0] - p[0], q[1] - p[1])
      if (!seg) continue
      const tx = (q[0] - p[0]) / seg
      const tz = (q[1] - p[1]) / seg
      let d = carry
      while (d < seg) {
        const x = p[0] + tx * d
        const z = p[1] + tz * d
        const e = 2
        const gx = (field(x + e, z) - field(x - e, z)) / (2 * e)
        const gz = (field(x, z + e) - field(x, z - e)) / (2 * e)
        const g = Math.hypot(gx, gz)
        const k = Math.min(1, Math.max(0, (g - steep) / steep)) // 0 at the threshold, 1 twice as steep
        const facing = -gz / (g || 1) // the downhill direction's share toward the viewer
        let gap = 9
        if (g >= steep && facing > 0.55) {
          const w = 1.4 + 2 * k
          out.push({
            level: r.level,
            a: [x - (tx * w) / 2, top, z - (tz * w) / 2],
            b: [x + (tx * w) / 2, top, z + (tz * w) / 2],
            c: [x, low, z],
          })
          gap = 8 - 3.5 * k
        }
        d += gap
      }
      carry = d - seg
    }
  }
  return out
}

// The highest point of each summit, for its spot height (altitude in metres).
export function spotHeights() {
  return SUMMITS.map((s) => {
    const cz = s.y / MAP_SQUASH
    let best: { x: number; z: number; h: number } = { x: s.x, z: cz, h: 0 }
    for (let dz = -60; dz <= 60; dz += 3) {
      for (let dx = -60; dx <= 60; dx += 3) {
        const h = field(s.x + dx, cz + dz)
        if (h > best.h) best = { x: s.x + dx, z: cz + dz, h }
      }
    }
    return { at: [best.x, best.h * DZ, best.z] as Vec3, metres: Math.round(BASE_M + best.h * INTERVAL_M) }
  })
}

// A smooth curve through flat-map points (Catmull-Rom), sampled into plan points.
export function routePlan(pts: Pt[], perSegment = 14): Pt[] {
  const plan = pts.map(([x, y]) => [x, y / MAP_SQUASH] as Pt)
  const out: Pt[] = []
  for (let i = 0; i < plan.length - 1; i++) {
    const p0 = plan[i - 1] ?? plan[i]!
    const p1 = plan[i]!
    const p2 = plan[i + 1]!
    const p3 = plan[i + 2] ?? p2
    for (let j = 0; j < perSegment; j++) {
      const t = j / perSegment
      const t2 = t * t
      const t3 = t2 * t
      const c = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(plan[plan.length - 1]!)
  return out
}

export interface Camera {
  theta: number // turn around the vertical axis, radians
  phi: number // elevation above the horizon, radians
  distance: number
  zoom: number
  target: Vec3 // the point the camera looks at
  offset: Pt // where that point lands on screen
}

// Perspective projection of a world point [x, height, z] to screen [x, y].
export function project([x, h, z]: Vec3, cam: Camera): Pt {
  const [tx, th, tz] = cam.target
  const X = x - tx
  const H = h - th
  const Z = z - tz
  const c = Math.cos(cam.theta)
  const s = Math.sin(cam.theta)
  const xr = X * c - Z * s
  const zr = X * s + Z * c
  const cp = Math.cos(cam.phi)
  const sp = Math.sin(cam.phi)
  const depth = cam.distance - H * sp - zr * cp
  const sy = H * cp - zr * sp
  const f = (cam.distance / depth) * cam.zoom
  return [xr * f + cam.offset[0], -sy * f + cam.offset[1]]
}

export function pathOf(pts: Pt[], close = false): string {
  const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`
  return close ? `${d} Z` : d
}
