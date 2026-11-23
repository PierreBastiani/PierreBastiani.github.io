#!/usr/bin/env node
// Build-time only: turns a photo into a one-ink halftone plate, as an SVG of dots on a 45° screen
// plus a thin ruled frame that the figure breaks out of. The SVG is black on transparent and is
// used as a CSS mask, so the page prints it in whatever ink the section asks for.
//
//   node scripts/halftone-plate.mjs <input.jpg|.pgm> <output.svg> [options]
//
//   --pitch <px>      screen pitch in source pixels (default: width / 60)
//   --frame <t,r,b,l> frame edges as fractions of the image (default 0.31,1,1,0)
//   --break <edges>   frame edges the figure may cross, comma-separated (default: top)
//   --white <0-1>     paper level; lighter pixels print nothing (default: from the border)
//   --black <0-1>     solid level (default 0.1)
//   --gamma <n>       > 1 opens the mid-tones (default 1.5)
//
// Next to the SVG it writes <output>.json with the geometry (size, frame) for the component.
// JPEGs are decoded with djpeg (libjpeg-turbo: `brew install jpeg-turbo`); a binary PGM (P5)
// is read directly, so any other decoder can feed it.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const [input, output] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!input || !output) {
  console.error('usage: node scripts/halftone-plate.mjs <input.jpg|.pgm> <output.svg> [options]')
  process.exit(1)
}
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

// --- decode to 8-bit grey ---------------------------------------------------------------------
const pgm = /\.p[gn]m$/i.test(input)
  ? readFileSync(input)
  : execFileSync('djpeg', ['-grayscale', '-pnm', input], { maxBuffer: 1 << 28 })
const head = pgm.toString('latin1', 0, 64).match(/^P5\s+(\d+)\s+(\d+)\s+(\d+)\s/)
if (!head) throw new Error('expected a binary greyscale PGM (P5)')
const W = Number(head[1])
const H = Number(head[2])
const max = Number(head[3])
const px = new Float32Array(W * H)
for (let i = 0; i < W * H; i++) px[i] = pgm[head[0].length + i] / max

// --- tone: paper level from the border, levels, gamma ------------------------------------------
const border = []
for (let x = 0; x < W; x += 2) border.push(px[x], px[(H - 1) * W + x])
for (let y = 0; y < H; y += 2) border.push(px[y * W], px[y * W + W - 1])
border.sort((a, b) => a - b)
const paper = border[Math.floor(border.length / 2)]
const white = Number(opt('white', paper - 0.05))
const black = Number(opt('black', 0.1))
const gamma = Number(opt('gamma', 1.5))
const pitch = Number(opt('pitch', W / 60))
const [fT, fR, fB, fL] = opt('frame', '0.31,1,1,0').split(',').map(Number)
const breaks = new Set(opt('break', 'top').split(','))

// box-filtered sample (summed-area table), so each dot reads its whole cell
const sat = new Float64Array((W + 1) * (H + 1))
for (let y = 0; y < H; y++) {
  let row = 0
  for (let x = 0; x < W; x++) {
    row += px[y * W + x]
    sat[(y + 1) * (W + 1) + x + 1] = sat[y * (W + 1) + x + 1] + row
  }
}
const mean = (cx, cy, half) => {
  const x0 = Math.max(0, Math.floor(cx - half))
  const y0 = Math.max(0, Math.floor(cy - half))
  const x1 = Math.min(W, Math.ceil(cx + half))
  const y1 = Math.min(H, Math.ceil(cy + half))
  if (x1 <= x0 || y1 <= y0) return 1
  const s =
    sat[y1 * (W + 1) + x1] -
    sat[y0 * (W + 1) + x1] -
    sat[y1 * (W + 1) + x0] +
    sat[y0 * (W + 1) + x0]
  return s / ((x1 - x0) * (y1 - y0))
}
const ink = (v) => {
  const t = Math.min(1, Math.max(0, (v - black) / (white - black)))
  return Math.min(0.9, (1 - t) ** gamma) // cap: the shirt stays a screen, never a flat
}

// --- the screen: a square lattice turned 45°, one dot per cell, area = ink coverage -------------
const dots = []
const c = Math.SQRT1_2
const reach = Math.ceil((W + H) / pitch) + 2
for (let i = -reach; i <= reach; i++) {
  for (let j = -reach; j <= reach; j++) {
    const x = (i - j) * c * pitch + W / 2
    const y = (i + j) * c * pitch + H / 2
    if (x < -pitch || y < -pitch || x > W + pitch || y > H + pitch) continue
    const d = ink(mean(x, y, pitch * 0.5))
    const r = pitch * Math.sqrt(d / Math.PI)
    if (r < pitch * 0.11) continue // no speckle on the paper
    dots.push([x, y, r])
  }
}

// --- the frame, broken where the figure crosses it ----------------------------------------------
// The figure is whatever is darker than the paper, grown by most of a cell so the rule stops
// short of the dots instead of touching them.
const figure = (x, y) => {
  const gap = pitch * 0.9
  for (let dy = -gap; dy <= gap; dy += 1)
    for (let dx = -gap; dx <= gap; dx += 1) {
      if (dx * dx + dy * dy > gap * gap) continue
      const sx = Math.round(x + dx)
      const sy = Math.round(y + dy)
      if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue
      if (mean(sx, sy, 1.5) < white - 0.06) return true
    }
  return false
}
const sw = Math.max(1, W / 280) // the rule, about 1.25 px at the plate's shown size
const fx0 = fL * W + sw / 2
const fx1 = fR * W - sw / 2
const fy0 = fT * H + sw / 2
const fy1 = fB * H - sw / 2
const rule = []
const edge = (ax, ay, bx, by, breakable) => {
  if (!breakable) return rule.push([ax, ay, bx, by])
  const n = Math.ceil(Math.hypot(bx - ax, by - ay))
  let start = null
  for (let k = 0; k <= n; k++) {
    const x = ax + ((bx - ax) * k) / n
    const y = ay + ((by - ay) * k) / n
    const open = !figure(x, y)
    if (open && start === null) start = [x, y]
    if ((!open || k === n) && start !== null) {
      rule.push([start[0], start[1], x, y])
      start = null
    }
  }
}
edge(fx0, fy0, fx1, fy0, breaks.has('top'))
edge(fx1, fy0, fx1, fy1, breaks.has('right'))
edge(fx1, fy1, fx0, fy1, breaks.has('bottom'))
edge(fx0, fy1, fx0, fy0, breaks.has('left'))

// --- write ---------------------------------------------------------------------------------------
// Coordinates in tenths of a source pixel, as integers: the viewBox is scaled by ten. Dots are
// grouped by radius, 24 steps, each group one path of zero-length strokes with round caps, so a
// dot costs a dozen bytes instead of an arc pair.
const k = (v) => Math.round(v * 10)
const STEPS = 24
const rMax = Math.max(...dots.map((d) => d[2]))
const groups = new Map()
for (const [x, y, r] of dots) {
  const s = Math.max(1, Math.round((r / rMax) * STEPS))
  if (!groups.has(s)) groups.set(s, [])
  groups.get(s).push(`M${k(x)} ${k(y)}h0`)
}
const dotPaths = [...groups.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([s, d]) => `<path stroke-width="${k((2 * rMax * s) / STEPS)}" d="${d.join('')}"/>`)
  .join('')
const rulePath = rule.map(([ax, ay, bx, by]) => `M${k(ax)} ${k(ay)}L${k(bx)} ${k(by)}`).join('')
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * 10} ${H * 10}">` +
  `<g fill="none" stroke="#000" stroke-linecap="round">${dotPaths}</g>` +
  `<path d="${rulePath}" fill="none" stroke="#000" stroke-width="${k(sw)}" stroke-linecap="square"/>` +
  `</svg>\n`
writeFileSync(output, svg)
const geometry = {
  source: input.split('/').pop(),
  width: W,
  height: H,
  pitch: Number(pitch.toFixed(2)),
  frame: { top: fT, right: fR, bottom: fB, left: fL },
  dots: dots.length,
}
writeFileSync(output.replace(/\.svg$/, '.json'), JSON.stringify(geometry, null, 2) + '\n')
console.log(
  `${output}: ${dots.length} dots, pitch ${pitch.toFixed(2)} px, paper ${paper.toFixed(3)}, ` +
    `${rule.length} rule segments, ${(svg.length / 1024).toFixed(1)} KB`,
)
