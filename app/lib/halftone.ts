// Halftone: the second print technique next to the grain. One screened plate per drawing, in
// one flat ink, as an SVG pattern. Never a gradient: a tint is a dot size, and a ramp is a few
// bands of dot sizes, stepped.
//
// The screen is a 45° lattice built from a square tile of side p with two dots, at (p/4, p/4)
// and (3p/4, 3p/4). Neighbours sit p/√2 apart along the diagonals, the classic screen angle.

export type Dot = { cx: number; cy: number; r: number }

// Dots of radius r ≤ p/4 never cross the tile, so a band cut on a tile line cuts no dot.
export const screen = (p: number, r: number): Dot[] => [
  { cx: p / 4, cy: p / 4, r },
  { cx: (3 * p) / 4, cy: (3 * p) / 4, r },
]

// A heavier tint for a shape clipped by its own outline (a cast shadow): the dots may pass
// the tile, so each tile also carries the parts of its neighbours' dots. Up to r = 0.35p.
export const screenOpen = (p: number, r: number): Dot[] =>
  [
    [p / 2, p / 2],
    [0, 0],
    [p, 0],
    [0, p],
    [p, p],
  ].map(([cx, cy]) => ({ cx: cx!, cy: cy!, r }))

export type Band = { y: number; h: number; dots: Dot[]; paper: boolean }

// A stepped ramp from solid ink at the top to bare paper at the bottom, `steps` radii long.
// The upper half is paper dots on the ink, the lower half ink dots on the paper, the way a
// screen turns over at 50%. Each band is `rows` tiles high and starts on a tile line.
export const ramp = (top: number, p: number, rows: number, radii: number[]): Band[] => {
  const half = radii.length / 2
  return radii.map((k, i) => ({
    y: top + i * rows * p,
    h: rows * p,
    dots: screen(p, k * p),
    paper: i < half,
  }))
}
