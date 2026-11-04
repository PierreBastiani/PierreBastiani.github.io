// Oblique boxes for the small drawings (project cards, shop vignettes). The sun is up and to
// the left, like the hero: the top plane is lit, the front is the face, the right side is in
// the lilac shadow, and the box throws a flat shadow along the ground to the right.

export interface Box {
  front: string
  top: string
  side: string
  /** the whole silhouette, for the one contour line */
  outline: string
  /** flat shadow on the ground, behind and to the right */
  cast: string
}

const n = (v: number) => +v.toFixed(1)

/** x, y: front face top-left; w, h: front size; dx, dy: depth offset (dy < 0); cast: shadow length */
export function box(x: number, y: number, w: number, h: number, dx = 10, dy = -7, cast = 0): Box {
  const r = x + w
  const b = y + h
  return {
    front: `M${n(x)} ${n(y)}H${n(r)}V${n(b)}H${n(x)}Z`,
    top: `M${n(x)} ${n(y)}L${n(x + dx)} ${n(y + dy)}H${n(r + dx)}L${n(r)} ${n(y)}Z`,
    side: `M${n(r)} ${n(y)}L${n(r + dx)} ${n(y + dy)}V${n(b + dy)}L${n(r)} ${n(b)}Z`,
    outline: `M${n(x)} ${n(y)}L${n(x + dx)} ${n(y + dy)}H${n(r + dx)}V${n(b + dy)}L${n(r)} ${n(b)}H${n(x)}Z`,
    cast: cast ? `M${n(x + w * 0.4)} ${n(b)}L${n(x + dx)} ${n(b + dy)}H${n(r + dx + cast)}L${n(r + cast * 0.8)} ${n(b)}Z` : '',
  }
}
