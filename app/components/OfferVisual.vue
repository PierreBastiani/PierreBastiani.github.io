<script setup lang="ts">
import { box } from '@/lib/box'
// Before / after for each thing the shop page offers: one printed plate, two vignettes, the
// captions in the lettering band under them. No brands, no real business names. Captions are
// HTML (they translate); the drawings are decorative.
defineProps<{ kind: 'google' | 'site' | 'orders' | 'fix'; before: string; after: string }>()

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const stars = [0, 1, 2, 3, 4].map((i) => star(49 + i * 9.5, 64, 4))

// the objects, the same in both panels so only their state changes
const sign = box(36, 14, 80, 86, 6, -4, 26) // the listing, printed as a notice board
const phone = box(58, 8, 44, 94, 5, -4, 22)
const tablet = box(54, 10, 52, 92, 5, -4, 24)
const router = box(46, 62, 64, 20, 9, -6, 22)
const book = box(20, 30, 46, 64, 4, -3, 0)
const laptop = box(96, 88, 50, 6, 6, -4, 14)
</script>

<template>
  <figure class="ba print">
    <div class="pair">
      <!-- before: the same scene printed through the lilac shadow plate, no spot -->
      <div class="panel before">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <rect width="160" height="78" class="sky" />
          <rect y="78" width="160" height="42" class="ground" />
          <template v-if="kind === 'google'">
            <path :d="sign.cast" class="cast" />
            <path :d="sign.front" class="lit" />
            <path :d="sign.top" class="face" />
            <path :d="sign.side" class="shade" />
            <path d="M44 22 H108 V48 H44 Z" class="ink-hair dashed" />
            <path d="M44 56 H78" class="ink-line" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="ink-hair" />
            <path d="M44 76 H96 M44 84 H80" class="ink-hair" />
            <path d="M96 82 H108 V94 H96 Z" class="ink-line" />
            <path d="M99.5 85.5 C99.5 83.5 104.5 83.5 104.5 86 C104.5 88 102 87.6 102 90 M102 91 V92.6" class="ink-hair" />
            <path :d="sign.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'site'">
            <path :d="phone.cast" class="cast" />
            <path :d="phone.front" class="dark" />
            <path :d="phone.top" class="face" />
            <path :d="phone.side" class="shade" />
            <path d="M62 14 H98 V96 H62 Z" class="lit" />
            <!-- a desktop page squeezed in: the lines run off the screen -->
            <path v-for="i in 8" :key="i" :d="`M65 ${18 + i * 6} H${118 + (i % 3) * 9}`" class="ink-hair" />
            <path d="M65 74 H86 V90 H65 Z M65 74 L86 90 M86 74 L65 90" class="ink-hair" />
            <path :d="phone.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'orders'">
            <!-- the order book, and the laptop it gets typed into again -->
            <g transform="rotate(-7 43 62)">
              <path :d="book.front" class="lit" />
              <path :d="book.side" class="shade" />
              <path v-for="i in 7" :key="i" :d="`M17 ${34 + i * 8} H23`" class="ink-line" />
              <path v-for="i in 6" :key="'s' + i" :d="`M28 ${36 + i * 8} q4 -3 8 0 t8 0 t8 0`" class="ink-hair" />
              <path :d="book.outline" class="ink-line" />
            </g>
            <path d="M68 70 L92 78" class="ink-hair dashed" />
            <path :d="laptop.cast" class="cast" />
            <path d="M102 50 H140 V88 H102 Z" class="dark" />
            <path d="M105 53 H137 V85 H105 Z" class="lit" />
            <path v-for="i in 3" :key="'k' + i" :d="`M109 ${58 + i * 7} q3 -2 6 0 t6 0 t6 0`" class="ink-hair" />
            <path d="M102 50 H140 V88 H102 Z" class="ink-line" />
            <path :d="laptop.front" class="face" />
            <path :d="laptop.top" class="lit" />
            <path :d="laptop.side" class="shade" />
            <path :d="laptop.outline" class="ink-line" />
          </template>
          <template v-else>
            <!-- the box with its cables in a heap, one antenna bent, the light off -->
            <path :d="router.cast" class="cast" />
            <path d="M56 56 V36 M98 56 V44 L110 36" class="ink-line" />
            <path :d="router.front" class="face" />
            <path :d="router.top" class="lit" />
            <path :d="router.side" class="shade" />
            <path d="M52 70 h4 v4 h-4 Z M60 70 h4 v4 h-4 Z" class="ink-hair" />
            <path :d="router.outline" class="ink-line" />
            <path d="M58 82 C34 92 98 94 62 104 S28 110 44 116 M74 82 C110 92 34 98 96 106 S116 110 104 116 M92 82 C70 96 136 100 82 112" class="ink-line" />
          </template>
        </svg>
      </div>

      <!-- after: the same object put right, in sunlight, with the one spot of porphyry -->
      <div class="panel after">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <rect width="160" height="78" class="sky" />
          <rect y="78" width="160" height="42" class="ground" />
          <template v-if="kind === 'google'">
            <path :d="sign.cast" class="cast" />
            <path :d="sign.front" class="lit" />
            <path :d="sign.top" class="face" />
            <path :d="sign.side" class="shade" />
            <!-- the photos: the shop under the sky, its porphyry roof; the shop front -->
            <path d="M44 22 H84 V36 H44 Z" class="sky" />
            <path d="M44 36 H84 V48 H44 Z" class="ground" />
            <path d="M58 30 H72 V34 H58 Z" class="spot" />
            <path d="M60 34 H70 V48 H60 Z" class="face" />
            <path d="M88 22 H108 V48 H88 Z" class="shade" />
            <path d="M92 32 H104 V48 H92 Z" class="lit" />
            <path d="M44 22 H84 V48 H44 Z M88 22 H108 V48 H88 Z" class="ink-line" />
            <path d="M44 56 H86" class="ink-heavy" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="sun" />
            <polygon v-for="(p, i) in stars" :key="'o' + i" :points="p" class="ink-hair" />
            <!-- a reply to a review -->
            <path d="M44 76 H80 M44 82 H72" class="ink-hair" />
            <path d="M84 76 H110 V90 H94 L88 95 V90 H84 Z" class="face" />
            <path d="M84 76 H110 V90 H94 L88 95 V90 H84 Z" class="ink-line" />
            <path d="M88 81 H106 M88 85 H100" class="ink-hair" />
            <path :d="sign.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'site'">
            <path :d="phone.cast" class="cast" />
            <path :d="phone.front" class="dark" />
            <path :d="phone.top" class="face" />
            <path :d="phone.side" class="shade" />
            <path d="M62 14 H98 V96 H62 Z" class="lit" />
            <path d="M62 14 H98 V32 H62 Z" class="sky" />
            <circle cx="89" cy="24" r="4" class="sun" />
            <path d="M62 32 H98 V36 H62 Z" class="sea" />
            <path d="M62 36 H98 V44 H62 Z" class="ground" />
            <path d="M62 44 H98" class="ink-hair" />
            <path d="M66 52 H90" class="ink-heavy" />
            <path d="M66 60 H94 M66 66 H86" class="ink-hair" />
            <!-- the call button -->
            <path d="M66 76 H94 V88 H66 Z" class="spot" />
            <path d="M71 79 H73.5 L74.5 81 L73.5 82 C74.3 83.5 75.5 84.7 77 85.5 L78 84.5 L80 85.5 V87 M83 82 H90" class="ink-line" />
            <path :d="phone.outline" class="ink-line" />
          </template>
          <template v-else-if="kind === 'orders'">
            <!-- one list on the tablet, the done ones ticked in porphyry -->
            <path :d="tablet.cast" class="cast" />
            <path :d="tablet.front" class="dark" />
            <path :d="tablet.top" class="face" />
            <path :d="tablet.side" class="shade" />
            <path d="M58 16 H102 V96 H58 Z" class="lit" />
            <path d="M63 24 H90" class="ink-heavy" />
            <g v-for="i in 6" :key="i">
              <path :d="`M63 ${22 + i * 11} h7 v7 h-7 Z`" :class="i < 5 ? 'spot' : 'lit'" />
              <path :d="`M63 ${22 + i * 11} h7 v7 h-7 Z`" class="ink-line" />
              <path v-if="i < 5" :d="`M64.5 ${25.6 + i * 11} l1.8 1.8 l3.2 -4`" class="ink-line" />
              <path :d="`M74 ${25.5 + i * 11} H${88 + ((i * 7) % 10)}`" class="ink-hair" />
            </g>
            <path :d="tablet.outline" class="ink-line" />
          </template>
          <template v-else>
            <!-- the box squared away: antennas up, the light on, cables run down to their labels -->
            <path :d="router.cast" class="cast" />
            <path d="M56 56 V36 M98 56 V36" class="ink-line" />
            <path :d="router.front" class="face" />
            <path :d="router.top" class="lit" />
            <path :d="router.side" class="shade" />
            <path d="M52 70 h4 v4 h-4 Z" class="spot" />
            <path d="M52 70 h4 v4 h-4 Z M60 70 h4 v4 h-4 Z" class="ink-hair" />
            <path :d="router.outline" class="ink-line" />
            <path d="M58 82 V100 M70 82 V100 M86 82 V100 M98 82 V100" class="ink-line" />
            <path d="M52 100 H64 V108 H52 Z M64 100 H76 V108 H64 Z M80 100 H92 V108 H80 Z M92 100 H104 V108 H92 Z" class="lit" />
            <path d="M52 100 H64 V108 H52 Z M64 100 H76 V108 H64 Z M80 100 H92 V108 H80 Z M92 100 H104 V108 H92 Z" class="ink-hair" />
            <path d="M55 104 H61 M67 104 H73 M83 104 H89 M95 104 H101" class="ink-hair" />
          </template>
        </svg>
        <!-- the seam: a porphyry marker pointing from before to after -->
        <span class="seam" aria-hidden="true"></span>
      </div>
    </div>
    <!-- the lettering band: the two captions, stamped -->
    <figcaption class="band">
      <span class="cap"><span class="stamp">Avant</span> {{ before }}</span>
      <span class="cap"><span class="stamp">Après</span> {{ after }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
/* A printed plate: ink rule, inner rule, two vignettes split by a rule, the band under them. */
.ba {
  --pen: var(--ink-oxblood);
  margin: 0;
  display: grid;
  border: 1.5px solid var(--ink);
  padding: 4px;
  background: var(--surface);
}
.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border: 1px solid var(--ink);
  border-bottom: 0;
}
.panel {
  position: relative;
  aspect-ratio: 4 / 3;
  /* after: the scene in sunlight, the hero's scene tokens */
  --v-sky: var(--sky-top);
  --v-sea: var(--sea-fill);
  --v-ground: var(--plain);
  --v-lit: var(--rock-lit);
  --v-face: var(--rock);
  --v-shade: var(--rock-shade);
  --v-dark: var(--figure);
  --v-sun: var(--ink-ochre);
  --v-spot: var(--ink-porphyry);
}
/* before: every flat overprinted with the shadow ink (lilac by day, slate at dusk), as if the
   sun hasn't reached it yet */
.before {
  --v-sky: color-mix(in srgb, var(--rock-shade) 55%, var(--sky-top));
  --v-ground: color-mix(in srgb, var(--rock-shade) 60%, var(--plain));
  --v-lit: color-mix(in srgb, var(--rock-shade) 30%, var(--rock-lit));
  --v-face: color-mix(in srgb, var(--rock-shade) 45%, var(--rock));
  --v-shade: color-mix(in srgb, var(--rock-shade) 60%, var(--ink-sea));
  --v-dark: color-mix(in srgb, var(--rock-shade) 35%, var(--figure));
}
.after {
  border-left: 1px solid var(--ink);
}
.panel svg {
  display: block;
  width: 100%;
  height: 100%;
}
.panel :is(.ink-heavy, .ink-line, .ink-hair) {
  stroke: var(--pen);
}
.sky { fill: var(--v-sky); }
.sea { fill: var(--v-sea); }
.ground { fill: var(--v-ground); }
.lit { fill: var(--v-lit); }
.face { fill: var(--v-face); }
.shade,
.cast { fill: var(--v-shade); }
.dark { fill: var(--v-dark); }
.sun { fill: var(--v-sun); }
.spot { fill: var(--v-spot); }
.dashed {
  stroke-dasharray: 3 3;
}
/* the marker on the seam: a square porphyry flag with an ink notch, pointing right */
.seam {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 0;
  width: 0.9rem;
  height: 1.3rem;
  transform: translate(-50%, -50%);
  background: var(--ink-porphyry);
  clip-path: polygon(0 0, 55% 0, 100% 50%, 55% 100%, 0 100%);
}

/* the band: both captions in mono caps, each with its stamp */
.band {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.7rem / 1.4 var(--f-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cap {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 0.3rem;
  /* room for a two-line caption, so plates side by side end on the same line */
  min-height: 4.4rem;
  padding: 0.5rem 0.7rem 0.6rem;
}
.cap + .cap {
  border-left: 1px solid color-mix(in srgb, var(--on-ground) 35%, transparent);
}
.stamp {
  padding: 0.05rem 0.4rem;
  border: 1px solid color-mix(in srgb, var(--on-ground) 60%, transparent);
  font-weight: 650;
  letter-spacing: 0.14em;
}
.cap + .cap .stamp {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
</style>
