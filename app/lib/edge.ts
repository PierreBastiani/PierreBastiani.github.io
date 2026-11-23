// The top edge of the projects' flood: the Esterel's porphyry ridge against the sky of the
// section above it, where a bare horizontal cut used to be. One list of points serves the CSS
// clip (a `shape()` in % across and in units of --edge-a down, so it stays responsive without
// script) and the travelling figure, which prints in the flood's ink only inside this outline.
// The shadow sides are printed as on the hero's hills (ridgeFacets), in the flood's shade.
import { ridgeFacets, ridgeY, type RidgeOptions } from '@/lib/ridge'

const W = 1600 // the ridge is drawn across 1600 units, then stretched to the page's width
const N = 80 // segments across
const RIDGE: RidgeOptions = {
  seed: 23,
  base: 0,
  amp: 26,
  scale: 0.0034,
  octaves: 4,
  x0: 0,
  x1: W,
  step: W / N,
  // one clear summit on the right, over the plate and clear of the text column above it, a
  // lesser top on the left, a col between them
  bumps: [
    { x: 230, height: 30, width: 130 },
    { x: 820, height: -18, width: 160 },
    { x: 1390, height: 64, width: 160 },
  ],
}

const ys = Array.from({ length: N + 1 }, (_, i) => ridgeY(RIDGE, (i / N) * W))
const lo = Math.min(...ys)
const hi = Math.max(...ys)

// [u, f]: u across the page (0 to 1), f down from the summit (0) to the deepest col (1)
export const FLOOD_EDGE: [number, number][] = ys.map((y, i) => [i / N, (y - lo) / (hi - lo)])

// the clip as CSS, in the section's own box
export const floodEdgeShape = (() => {
  const pt = ([u, f]: [number, number]) =>
    `${+(u * 100).toFixed(2)}% calc(var(--edge-a) * ${f.toFixed(3)})`
  const [first, ...rest] = FLOOD_EDGE
  return `shape(from ${pt(first!)}, ${rest.map((p) => `line to ${pt(p)}`).join(', ')}, line to 100% 100%, line to 0% 100%, close)`
})()

// the shadow sides, for an SVG three --edge-a tall laid over the flood's top
// (preserveAspectRatio none: it stretches across like the clip)
export const floodEdgeShade = {
  viewBox: `0 ${lo.toFixed(1)} ${W} ${(3 * (hi - lo)).toFixed(1)}`,
  d: ridgeFacets(RIDGE, { minProm: 16, smooth: 50, depth: 0.8, lean: 0.5, step: W / N }),
}

// the outline in screen px, for a flood whose box starts at `top`, with `a` px of edge
export function floodEdgePath(l: number, w: number, top: number, h: number, a: number) {
  const pts = FLOOD_EDGE.map(([u, f]) => `${(l + u * w).toFixed(1)} ${(top + f * a).toFixed(1)}`)
  return `M${pts.join('L')}L${(l + w).toFixed(1)} ${(top + h).toFixed(1)}L${l.toFixed(1)} ${(top + h).toFixed(1)}Z`
}
