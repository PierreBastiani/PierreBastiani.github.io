// The crag behind the skills map: two summits drawn as contour rings, seen in 3D like a
// cut-layer contour model. Each ring is a slab at its own height; the camera sits on the
// south side, above, and turns a little with the pointer or the scroll.
//
// Plan coordinates: x 0 to 1000 (west to east as drawn), z 0 to 940 (north to south, toward
// the viewer). The original flat map squashed z by 0.68 to fit 1000 × 640; MAP_SQUASH undoes it.

export type Pt = [number, number]
export type Vec3 = [number, number, number]

export interface Summit {
  x: number
  y: number // in flat-map units (squashed)
  r: number // radius of the outermost contour
  rings: number
  seed: number
}

export const MAP_SQUASH = 0.68
export const SUMMITS: Summit[] = [
  { x: 640, y: 230, r: 330, rings: 12, seed: 0 },
  { x: 250, y: 430, r: 210, rings: 8, seed: 1.7 },
]
export const DZ = 22 // height of one contour interval, exaggerated

function wobble(s: Summit, a: number, k: number) {
  return (
    1 +
    0.14 * Math.sin(3 * a + k * 0.45 + s.seed) +
    0.07 * Math.sin(5 * a + 1.3 + k * 0.21 + s.seed * 2) +
    0.03 * Math.sin(9 * a + k)
  )
}

// Ring k (1 = innermost) of a summit, in plan coordinates.
export function ringPlan(s: Summit, k: number, n = 96): Pt[] {
  const cz = s.y / MAP_SQUASH
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = s.r * (k / s.rings) * wobble(s, a, k)
    pts.push([s.x + Math.cos(a) * r, cz + Math.sin(a) * r])
  }
  return pts
}

// Level of ring k: the outermost ring is level 1, the innermost is level `rings`.
export const ringLevel = (s: Summit, k: number) => s.rings - k + 1

// Ground height at a plan point: the highest of the two summits there, in contour levels × DZ.
export function heightAt(x: number, z: number): number {
  let best = 0
  for (const s of SUMMITS) {
    const dx = x - s.x
    const dz = z - s.y / MAP_SQUASH
    const a = Math.atan2(dz, dx)
    const d = Math.hypot(dx, dz)
    let k = (d / s.r) * s.rings
    for (let i = 0; i < 2; i++) k = (d / (s.r * wobble(s, a, k))) * s.rings
    const level = Math.min(s.rings, Math.max(0, s.rings + 1 - k))
    best = Math.max(best, level * DZ)
  }
  return best
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
