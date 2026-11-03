// The skills map: the south face of the Baou de Saint-Jeannet drawn front-on, the way a
// climbing guidebook draws a crag, with the five routes on it. Scene units: 1000 × 680, the
// wall's foot at y 556. Low sun from the right (west), so faces turned right are lit and
// dihedrals, roofs and the cave hold the shadow. Every shape is a flat of the hero's inks.

export type Pt = [number, number]
export const SCENE = { w: 1000, h: 680 }

// Depth planes, for the parallax: the sky and far hills, the wall, the foreground.
export const DEPTH = { far: 0.45, wall: 1, near: 1.3 }

// The plateau's garrigue, then the wall's outline: a flat top, broken ends.
export const PLATEAU = 'M100 300 L130 210 L165 160 L230 128 L330 116 L460 106 L560 110 L660 102 L760 114 L850 136 L905 182 L932 268 L945 300 Z'
export const WALL = 'M70 560 L96 300 L128 220 L160 176 L230 144 L330 132 L460 122 L560 126 L660 118 L760 130 L850 154 L905 200 L930 284 L950 560 Z'

// Flats laid over the wall, by ink: [path, role]. Roles map to scene tokens in RouteMap.
export const WALL_FLATS: [string, 'shade' | 'lit' | 'glow' | 'deep' | 'streak'][] = [
  // the ends of the wall: the east flank turned away from the sun, the west one in the light
  ['M70 560 L96 300 L128 220 L160 176 L178 192 L160 246 L150 300 L138 390 L132 470 L126 560 Z', 'shade'],
  ['M905 200 L930 284 L950 560 L906 560 L902 450 L898 340 L888 250 Z', 'glow'],
  // the rim: the top of the wall overhangs a little and throws a thin band of shade
  ['M160 176 L230 144 L330 132 L460 122 L560 126 L660 118 L760 130 L850 154 L905 200 L900 208 L848 162 L760 139 L660 127 L560 135 L460 131 L330 141 L232 153 L166 186 Z', 'shade'],
  // a big slab high on the right, turned to the sun
  ['M618 140 L700 136 L758 150 L780 214 L770 262 L700 258 L648 250 L632 196 Z', 'glow'],
  // the great dihedral (route 2 climbs its crack): its shaded left wall, wide at the foot
  ['M332 146 L346 145 L352 260 L356 390 L360 545 L318 545 L322 470 L328 360 L330 250 Z', 'shade'],
  ['M346 145 L351 145 L357 260 L362 390 L368 545 L360 545 L356 390 L352 260 Z', 'lit'],
  // a gully right of centre, closing at the ledge, and the arête on the right
  ['M556 142 L568 142 L576 230 L586 330 L582 432 L566 440 L568 330 L560 230 Z', 'shade'],
  ['M800 172 L810 170 L818 280 L828 400 L834 540 L806 540 L808 400 L804 280 Z', 'shade'],
  // water streaks down the limestone, tapering
  ['M244 162 L254 162 L262 300 L258 440 L250 440 L250 300 Z', 'streak'],
  ['M698 330 L708 330 L714 420 L710 520 L702 520 L700 420 Z', 'streak'],
  ['M470 140 L478 140 L484 260 L476 330 L470 330 L472 260 Z', 'streak'],
  // ledges: a lit tread with its shadow under it
  ['M168 378 L302 374 L300 380 L170 384 Z', 'lit'],
  ['M170 384 L300 380 L296 392 L174 396 Z', 'shade'],
  ['M438 236 L542 232 L540 238 L440 242 Z', 'lit'],
  ['M440 242 L540 238 L536 250 L444 252 Z', 'shade'],
  ['M786 372 L884 368 L882 374 L788 378 Z', 'lit'],
  ['M788 378 L882 374 L878 386 L792 388 Z', 'shade'],
  // the roof (route 4 turns it): its lit lip and the dark underside
  ['M596 292 L732 288 L734 296 L598 300 Z', 'lit'],
  ['M598 300 L734 296 L722 320 L606 324 Z', 'deep'],
  // the cave at the foot
  ['M408 530 L418 470 L446 440 L480 438 L500 462 L506 530 Z', 'deep'],
  ['M446 440 L480 438 L500 462 L494 464 L476 446 L450 448 Z', 'lit'],
  // the foot of the wall in its own shadow
  ['M70 545 L950 545 L950 560 L70 560 Z', 'shade'],
]

// Scree under the wall, in three fans.
export const SCREE = 'M40 640 L70 556 L950 556 L990 640 Z'
export const SCREE_SHADE = [
  'M200 556 L260 556 L320 640 L170 640 Z',
  'M520 556 L560 556 L640 640 L470 640 Z',
  'M780 556 L820 556 L900 640 L740 640 Z',
]

// Far hills either side of the Baou, and the foreground garrigue with two Aleppo pines.
export const FAR_HILLS = 'M-140 470 C80 430 160 440 260 455 L760 455 C860 430 960 420 1140 450 V720 H-140 Z'
export const GROUND = 'M-140 720 L-140 612 C60 590 140 600 230 622 C320 642 420 630 520 638 C640 648 760 620 880 612 C960 606 1040 618 1140 628 V720 Z'
export const PINES = [
  { trunk: 'M62 700 C66 650 60 604 76 560 L84 562 C70 604 76 650 72 700 Z', crown: 'M14 570 C24 552 56 546 82 550 C102 540 132 544 148 558 C152 568 138 574 120 572 C96 580 58 580 36 576 C22 576 12 574 14 570 Z', lit: 'M54 552 C70 545 96 543 112 548 C126 544 140 550 146 557 C128 552 108 552 92 554 C78 550 64 551 54 552 Z' },
  { trunk: 'M944 700 C946 664 952 628 940 596 L947 594 C958 628 954 664 952 700 Z', crown: 'M900 600 C910 586 936 582 954 586 C972 578 994 582 1004 594 C1006 602 994 606 980 604 C962 610 932 610 914 606 C902 606 896 604 900 600 Z', lit: 'M928 586 C944 580 962 580 974 584 C986 582 998 588 1002 594 C988 590 972 590 960 592 C950 588 938 588 928 586 Z' },
]

// The routes, foot to top anchor, along the wall's features. Ids match content.routes.
export const ROUTE_LINES: Record<string, Pt[]> = {
  ship: [[206, 548], [198, 470], [214, 392], [230, 330], [222, 262], [238, 200], [248, 150]], // up the left buttress
  build: [[352, 548], [350, 450], [346, 350], [342, 250], [338, 150]], // the dihedral's crack
  ai: [[520, 548], [514, 470], [524, 390], [512, 310], [496, 242]], // right of the cave, to the ledge
  home: [[668, 548], [660, 470], [668, 390], [680, 334], [702, 320], [732, 292], [722, 232], [710, 176], [702, 140]], // through the roof
  data: [[846, 548], [838, 470], [828, 420], [834, 378]], // beside the arête, to the ledge
}

// A smooth line through the points (Catmull-Rom), sampled.
export function smooth(pts: Pt[], per = 10): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    for (let j = 0; j < per; j++) {
      const t = j / per
      const t2 = t * t
      const t3 = t2 * t
      const c = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[pts.length - 1]!)
  return out
}

// Bolts: a short tick across the line every `gap` units, none right at either end.
export function bolts(line: Pt[], gap = 40): string {
  const ticks: string[] = []
  let run = 0
  let next = 26
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1]!
    const [bx, by] = line[i]!
    const seg = Math.hypot(bx - ax, by - ay)
    while (run + seg >= next) {
      const t = (next - run) / seg
      const x = ax + (bx - ax) * t
      const y = ay + (by - ay) * t
      const nx = -(by - ay) / seg
      const ny = (bx - ax) / seg
      ticks.push(`M${(x - nx * 6).toFixed(1)} ${(y - ny * 6).toFixed(1)} L${(x + nx * 6).toFixed(1)} ${(y + ny * 6).toFixed(1)}`)
      next += gap
    }
    run += seg
  }
  // keep clear of the top anchor
  const total = run
  return ticks.filter((_, i) => 26 + i * gap < total - 18).join(' ')
}

export function pathOf(pts: Pt[]): string {
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`
}
