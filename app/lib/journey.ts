import type { PoseId } from './figure'

// The figure's journey down the page (components/journey/TravelFigure.vue) and the sections
// it visits share this one object, in the browser only. The sections publish what only they
// know (the topo's live camera, the rope's line) and call back when their layout changes; the
// figure tells the topo which route it is on, so the highlight and the climber always agree.
// Nothing here reads the layout: it holds references and callbacks.

export interface Cam {
  x: number
  y: number
  zoom: number
}
export interface Box {
  x: number
  y: number
  w: number
  h: number
}
export interface Rope {
  el: HTMLElement // the timeline's .route box, the rope's origin
  left: number // the rope SVG's left inside it, px
  samples: { x: number; y: number }[] // points along the rope, foot to top, in the SVG's px
  anchors: number[] // y of each belay, top (current job) to foot
}

export const journey = {
  on: false, // the figure travels (set on mount, never under reduced motion)
  // the hero's pointer parallax, as useParallax last painted it (-1 → 1)
  px: 0,
  py: 0,
  // the topo, once hydrated: its camera (a live object, eased in its own frames) and frame
  cam: null as Cam | null,
  box: null as Box | null,
  setRoute: null as ((id: string | null) => void) | null,
  rope: null as Rope | null,
  paint: () => {}, // repaint now: the topo calls it after moving its camera, in that frame
  request: () => {}, // repaint on the next frame
  remeasure: () => {}, // a section hydrated or changed size: measure the anchors again
}

// ---- Another page's route -----------------------------------------------------------------
// TravelFigure plays the main page's route, and on any page the hero part of it: from the desk
// onto the hero's primary button. A page with sections of its own (the shop page) passes a
// Course for what comes after: it measures its own anchors, plans its own moves with the
// figure's jump and hold, names the grounds he crosses and paints its own effects. The main
// page passes none, so its journey doesn't change.

export type CourseInk = 'scene' | 'page' | 'ground' | 'flood'
export interface CourseState {
  x: number // screen px of the pose's origin
  y: number
  k: number // px per figure unit
  pose: PoseId
  flip?: boolean
}
export type CourseAt = (s: number) => CourseState
export interface CourseSeg {
  s0: number
  s1: number
  at: (s: number, t: number) => CourseState
}
export interface CourseGround {
  ink: CourseInk
  d: string // screen px path
  box: [number, number, number, number]
}
export interface CourseKit {
  vw: number
  vh: number
  now: () => number // the scroll position the journey so far ends at
  push: (seg: CourseSeg) => void
  leap: (s0: number, s1: number, a: CourseAt, b: CourseAt, apex: number, land?: PoseId) => CourseSeg
  hold: (s0: number, s1: number, a: CourseAt) => CourseSeg
  button: CourseAt // standing on the hero's primary button, where the hero part ends
  narrow: boolean
}
export interface Course {
  measure: () => void // read the page (on mount, resize, font load, a section's hydration)
  plan: (kit: CourseKit) => void
  grounds?: (s: number, vw: number) => CourseGround[]
  ink?: (el: Element) => CourseInk | null // the ink of a run of text he passes behind
  paint?: (s: number) => void // every frame he moves: the page's own effects
}
