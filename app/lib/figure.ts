// The travelling figure's poses: the man at the desk in the hero, in a beanie and headphones,
// drawn as poster figures (flat silhouettes, one ink for the body, the beanie as the one accent,
// the headphones in the gear ink). Poses are discrete, like the frames of a printed strip:
// nothing is tweened between them.
//
// Units: a standing figure is 100 tall. The origin is where he touches the thing he is on:
// - the feet (stand, front, crouch, jump, fall, stride): bottom centre;
// - the harness on the topo's route lines (climb, lower): the line runs through it;
// - the tie-in on the career rope (ropeUp, ropeDown): his body hangs to the left of the rope;
// - the seat (sit): the ledge he sits on, under his hips.
// Facing right; the figure flips to face left.

export type PoseId =
  | 'sit'
  | 'stand'
  | 'front'
  | 'crouch'
  | 'jump'
  | 'fall'
  | 'stride'
  | 'climb'
  | 'lower'
  | 'ropeUp'
  | 'ropeDown'

// The head is drawn apart from the body so it can look somewhere else than where he goes: a
// few discrete frames (ahead, up, down, turned back), never a tween, like the poses.
export interface Head {
  body: string // the face and neck in the figure ink
  hat: string // the beanie
  band: string // the beanie's turn-up, an overprint of hat and body
  gear: string // the headphone cups
}

export interface Pose {
  body: string // the figure ink, without the head
  gear?: string // the harness
  head: Head // as drawn in the pose (seen from the back on the routes and in the plate)
  turn: Head // the same head side on, facing right: what he shows when he looks at something
  neck: [number, number] // where the head turns, and the x it is mirrored about
}

// an ellipse as a path, so every part is one `d`
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`

// a head in a beanie and headphones, seen from the side (facing right) or from the back
function head(cx: number, cy: number, side = true) {
  if (!side)
    return {
      body: oval(cx, cy, 6, 6.8),
      hat: `M${cx - 6.4} ${cy - 1} C${cx - 6.8} ${cy - 9} ${cx - 3.5} ${cy - 13.5} ${cx} ${cy - 13.5} C${cx + 3.5} ${cy - 13.5} ${cx + 6.8} ${cy - 9} ${cx + 6.4} ${cy - 1} Z`,
      band: `M${cx - 6.6} ${cy - 0.3} H${cx + 6.6} V${cy - 3.2} H${cx - 6.6} Z`,
      gear: `${oval(cx - 6.2, cy + 1, 1.7, 2.7)} ${oval(cx + 6.2, cy + 1, 1.7, 2.7)}`,
    }
  return {
    body: oval(cx, cy, 6.2, 7),
    hat: `M${cx - 6.8} ${cy - 1} C${cx - 7.8} ${cy - 9} ${cx - 4} ${cy - 13.5} ${cx + 0.5} ${cy - 13.5} C${cx + 4.5} ${cy - 13.5} ${cx + 6.8} ${cy - 9.5} ${cx + 6.4} ${cy - 1.6} Z`,
    band: `M${cx - 7.2} ${cy - 0.4} L${cx + 6.6} ${cy - 1.4} L${cx + 6.6} ${cy - 4.2} L${cx - 7.2} ${cy - 3.2} Z`,
    gear: oval(cx - 2.6, cy + 2, 2, 2.8),
  }
}

// Widen a path about x = 0 (absolute M, L, H, V, C commands only): the limbs and the jacket
// are drawn lean and printed at the desk figure's build.
function widen(d: string, k: number) {
  let cmd = ''
  let i = 0
  return d.replace(/[MLHVCZ]|-?\d*\.?\d+/g, (tok) => {
    if (/[A-Z]/.test(tok)) {
      cmd = tok
      i = 0
      return tok
    }
    const n = parseFloat(tok)
    const isX = cmd === 'H' || ((cmd === 'M' || cmd === 'L' || cmd === 'C') && i % 2 === 0)
    i++
    return isX ? String(+(n * k).toFixed(2)) : tok
  })
}

function pose(
  parts: string[],
  [cx, cy, side]: [number, number, boolean?],
  gear = '',
  k = 1.3,
): Pose {
  const h = head(cx * k, cy, side ?? true)
  return {
    body: parts.map((d) => widen(d, k)).join(' '),
    gear: gear ? widen(gear, k) : undefined,
    head: h,
    turn: side === false ? head(cx * k, cy, true) : h,
    neck: [cx * k, cy + 7],
  }
}

export const POSES: Record<Exclude<PoseId, 'sit'>, Pose> = {
  // standing on an edge, weight on both feet, one arm loose
  stand: pose(
    [
      'M-7.5 -47 H8.5 L7.4 -3 H1.6 L0.6 -30 L-0.6 -30 L-1.2 -3 H-7 Z', // legs
      'M-7.4 -3 H-0.6 L1.6 0 H-7.4 Z M1.2 -3 H7.8 L10.6 0 H1.2 Z', // boots
      'M-7.6 -77 C-3 -80 5 -80 8.6 -77 C10 -68 10 -56 9 -46 H-8 C-9 -56 -9.4 -68 -7.6 -77 Z', // jacket
      'M5.4 -75 C9.4 -70 11.6 -62 12 -55 L13 -46.5 L9.4 -46 L8.4 -54 C7.8 -60 5.4 -66 3.2 -70 Z', // arm
      'M-1.6 -81 H3.2 V-76 H-1.6 Z', // neck
    ],
    [0.8, -87.5],
  ),
  // the same, turned to face us: for the portrait plate
  front: pose(
    [
      'M-8 -47 H8 L7 -3 H1.3 L0 -30 L-1.3 -3 H-7 Z',
      'M-7.6 -3 H-1 L-0.4 0 H-8.2 Z M1 -3 H7.6 L8.2 0 H0.4 Z',
      'M-9 -77 C-4 -80 4 -80 9 -77 C10.4 -68 10.2 -56 9 -46 H-9 C-10.2 -56 -10.4 -68 -9 -77 Z',
      'M-9 -76 L-11.6 -70 L-12.6 -50 L-9.4 -49 L-8.6 -66 Z M9 -76 L11.6 -70 L12.6 -50 L9.4 -49 L8.6 -66 Z',
      'M-2.4 -81 H2.4 V-76 H-2.4 Z',
    ],
    [0, -87.5, false],
  ),
  // a landing (or a spring before a jump): knees bent forward, a hand down on the edge
  crouch: pose(
    [
      'M-7 -32 L5 -33 L12 -25 L8.5 -3 L2.6 -3 L5.4 -21 L-5 -21 Z', // near leg
      'M-8.4 -30 L-2 -31 L1 -22 L-4 -3 L-9.4 -3 L-5.4 -20 Z', // far leg
      'M2 -3 H9 L11.6 0 H2 Z M-9.8 -3 H-3.8 L-1.6 0 H-9.8 Z', // boots
      'M-8.4 -30 L5.4 -31 C10.4 -40 13.4 -50 13.4 -56 C10.4 -60.4 3 -60.4 0 -57 C-4.4 -50 -7.4 -40 -8.4 -30 Z', // jacket
      'M8.4 -55 L12.4 -53 L16.4 -30 L17.4 -3 L13.8 -3 L12.8 -28 Z', // the hand down
      'M7 -59.5 L11.4 -60 L12.4 -57 L8.4 -56 Z', // neck
    ],
    [11.4, -65.4],
  ),
  // pushing off: stretched out forward, an arm reaching ahead, the back leg trailing
  jump: pose(
    [
      'M-6 -47 H2.4 L0.4 -24 L-0.6 -2 H-6 L-5.4 -24 Z',
      'M-6.4 -46 L-1 -44 L-8.4 -26 L-16.4 -14 L-19.6 -17 L-12.4 -28 Z',
      'M-6.6 -2.6 H0 L2 0 H-6.6 Z M-20.4 -18 L-15.6 -12.4 L-17.4 -10.4 L-22 -15.6 Z',
      'M-6.4 -46 H3.4 C6.4 -58 8.4 -70 9.4 -79 C6.4 -82.4 0 -82.4 -2.4 -79 C-4.4 -70 -6.4 -58 -6.4 -46 Z',
      'M3.4 -77 L7.4 -79 L16.4 -96 L18.4 -104 L14.8 -105 L12.4 -97 Z', // arm ahead
      'M-1 -76 L2 -74 L-6 -62 L-10.4 -55 L-12.6 -57.4 L-9 -64 Z', // arm back
      'M1.6 -82 L6 -82.6 L6.4 -78 L2 -77.4 Z',
    ],
    [5.4, -89],
  ),
  // dropping: both arms up, knees drawn up under him
  fall: pose(
    [
      'M-6.6 -40 L3.4 -40 L10.6 -31 L5.4 -6 L0.6 -6 L4.4 -28 L-4.6 -30 Z',
      'M-7.6 -38 L-2.4 -39 L-1.4 -24 L-5.4 -2 L-10.4 -2 L-6.6 -24 Z',
      'M0.4 -6 H6.6 L8.4 -3.4 H0.4 Z M-10.6 -2.6 H-4.6 L-3 0 H-10.6 Z',
      'M-7.6 -73 C-3 -76 5 -76 8.6 -73 C10 -62 9.6 -50 8.4 -39 H-8 C-9 -50 -9.4 -62 -7.6 -73 Z',
      'M-6.4 -71 L-3 -73 L-9.4 -90 L-13.4 -102 L-16.8 -100.4 L-13 -88 Z',
      'M5.4 -72 L8.6 -70 L14.4 -87 L17 -99.6 L13.6 -100.6 L10.4 -88 Z',
      'M-1.6 -77 H3.2 V-72 H-1.6 Z',
    ],
    [0.8, -83.4],
  ),
  // a stride, for walking along the foot of the wall and running off an edge
  stride: pose(
    [
      'M-6 -47 H4.4 L12.4 -22 L14.4 -3 L9 -3 L7.6 -20 L0 -34 Z', // front leg
      'M-7 -46 L1.4 -44 L-3.6 -24 L-11.4 -5 L-16 -7.6 L-9 -25 Z', // back leg
      'M9 -3 H15.4 L18 0 H9 Z M-16.4 -8.4 L-11 -4.6 L-12.4 -2.4 L-18 -6 Z',
      'M-7 -77 C-2.4 -80 5.6 -80 9.2 -77 C10.6 -68 9.8 -56 7.4 -46 H-7.8 C-9 -56 -9 -68 -7 -77 Z',
      'M5.4 -75 L9 -73 L4 -60 L-2 -52 L-4.4 -54.6 L1 -62 Z', // arm swung back
      'M-1 -81 H3.8 V-76 H-1 Z',
    ],
    [1.6, -87.5],
  ),
  // on a route of the topo, from behind: a hand high, a foot high (mirror it for the next move)
  climb: pose(
    [
      'M-7 -31 C-3 -34 3 -34 7 -31 C8 -20 8 -8 7 0 H-7 C-8 -8 -8 -20 -7 -31 Z',
      'M-7 -30 L-3.6 -28.4 L-6.4 -44 L-7.6 -60 L-11.4 -60 L-10.6 -44 Z', // the high hand
      'M5 -31 L8.4 -28 L13.4 -27.6 L15.6 -26 L14 -44 L10.4 -44 L11.4 -30.6 Z',
      'M-7 -1 L-1 -1 L-6 44 L-10.6 44 Z', // the straight leg
      'M1 -1 L7 -1 L15 -6 L17.4 -2 L13 4 L12 22 L8.4 22 L9.4 3 Z', // the high foot
      'M-11.4 43 H-5 V46.6 H-11.4 Z M7.6 21 H13.4 V24.6 H7.6 Z',
      'M-2.4 -36 H2.4 V-31 H-2.4 Z',
    ],
    [0, -41.4, false],
    'M-7.6 -3.4 H7.6 V0.8 H-7.6 Z',
    1.25,
  ),
  // lowered off the top anchor, from behind: sat in the harness, both hands on the rope
  lower: pose(
    [
      'M-7 -31 C-3 -34 3 -34 7 -31 C8 -20 8 -8 7 0 H-7 C-8 -8 -8 -20 -7 -31 Z',
      'M-7 -30 L-3.6 -29 L-0.6 -58 L-4.6 -58 Z M7 -30 L3.6 -29 L0.6 -58 L4.6 -58 Z',
      'M-7 -1 L-1 -1 L-8 16 L-14 22 L-16.4 19 L-11 12.6 Z M7 -1 L1 -1 L8 16 L14 22 L16.4 19 L11 12.6 Z',
      'M-17.4 18 L-13.4 23 L-15.4 25.4 L-19.6 20.4 Z M17.4 18 L13.4 23 L15.4 25.4 L19.6 20.4 Z',
      'M-2.4 -36 H2.4 V-31 H-2.4 Z',
    ],
    [0, -41.4, false],
    'M-7.6 -3.4 H7.6 V0.8 H-7.6 Z',
    1.25,
  ),
  // on the career rope, side on: climbing, hands up the rope, feet on the wall
  ropeUp: pose(
    [
      'M-11 -30 C-8 -33 -3 -33 -1 -30 C0 -20 -1 -8 -2 0 H-10 C-11.6 -8 -12 -20 -11 -30 Z',
      'M-3 -29 L0 -27 L2.4 -44 L2 -56 L-1 -56 L-0.6 -44 Z', // the high hand on the rope
      'M-6.4 -28 L-3 -27 L-0.4 -36 L1.4 -40 L-1 -42 L-4.4 -36 Z',
      'M-10 -1 L-3 -2 L5 2 L6 6 L3.4 18 L-0.4 18 L1 7 L-4 5 Z',
      'M-9 0 L-4 0 L-2 12 L0 24 L-3.6 24 L-6 13 Z',
      'M-0.6 16 H4.4 V19.6 H-0.6 Z M-3.6 22 H1.4 V25.6 H-3.6 Z',
      'M-7.6 -35 H-3 V-30 H-7.6 Z',
    ],
    [-5, -40.4],
    'M-10.6 -3.4 H-1.4 V0.8 H-10.6 Z M-1.4 -1.2 H0 V0.4 H-1.4 Z',
    1.15,
  ),
  // abseiling, side on: leaning out, legs straight to the wall, the brake hand low
  ropeDown: pose(
    [
      'M-9 0 L-1 -1 C-4 -10 -7 -20 -10 -28 C-13 -30 -17 -29 -19 -26 C-15 -18 -12 -9 -9 0 Z',
      'M-13 -27 L-10 -24 L-1 -31 L1 -35 L-1.6 -37 L-4 -33 Z',
      'M-15 -22 L-12 -21 L-12 -8 L-14 -4 L-16.4 -6 L-15 -10 Z',
      'M-9 1 L-3 -3 L8 -1 L8.6 3 L-6 5 Z M-8 4 L-3 2 L8.6 6 L8.6 10 L-5 9 Z',
      'M8 -3.4 H11 V4 H8 Z M8 5 H11 V11.4 H8 Z',
      'M-16 -31 L-12 -33.4 L-10.6 -29 L-14.4 -27.4 Z',
    ],
    [-17.4, -38.4],
    'M-9.6 -3 L-1.6 -4 L-1 0.4 L-9 1.4 Z',
    1.15,
  ),
}

// The desk figure of the hero (hero/SummitSetup.vue), exactly: drawn in scene units there,
// scaled here (one figure unit is 2.5 scene units) about its seat on the table rock.
// The head and the forearms are apart: the head looks about like the others, the forearms tap
// the keyboard in turn (two frames each, the hand on the keys and lifted, turning about the
// elbow). The far arm is behind the body, so only its hand shows, past the near one.
export const SIT = {
  transform: 'scale(0.4) translate(-828 -776)',
  body: [
    'M806 768 C806 754 818 752 832 752 L882 756 C892 758 894 768 888 774 L886 818 L904 818 C908 822 906 826 900 826 L872 826 L872 776 L826 776 C812 776 806 774 806 768 Z',
    'M806 770 C800 744 801 714 810 696 C818 682 838 679 850 688 C860 700 861 740 857 770 Z',
    'M836 694 C848 708 858 726 862 730 L868 742 C862 746 854 742 851 736 L830 704 Z', // upper arm
  ].join(' '),
  forearm: 'M857 731 L896 712 L901 718 L868 743 C862 745 856 739 857 731 Z',
  elbow: [863, 737] as [number, number],
  farArm: 'M851 728 L913 707 L918 713 L861 741 C855 743 849 737 851 728 Z',
  farElbow: [857, 735] as [number, number],
  head: {
    body: 'M832 690 L846 690 L848 676 L834 676 Z M826 662 a15 17 0 1 0 30 0 a15 17 0 1 0 -30 0 Z',
    hat: 'M824 668 C821 650 828 636 840 633 C847 631 852 633 855 637 C860 645 861 656 858 666 Z',
    band: 'M823 669 L859 666 L859 659 L823 662 Z',
    gear: 'M831.5 674 a5.5 7.5 0 1 0 11 0 a5.5 7.5 0 1 0 -11 0 Z',
  } as Head,
  phones: 'M829 676 C826 654 834 642 845 642 C855 643 859 655 857 670',
  neck: [841, 682] as [number, number],
}
// where the seat is in the scene units of SummitSetup's drawing, and in its own group
export const SEAT_LOCAL: [number, number] = [828, 776]
