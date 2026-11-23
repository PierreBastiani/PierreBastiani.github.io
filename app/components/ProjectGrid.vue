<script setup lang="ts">
import { projects, sections } from '@/content'
import ProjectArt from './ProjectArt.vue'
import PressPlate from './PressPlate.vue'
import { floodEdgeShade, floodEdgeShape } from '@/lib/edge'
// The section's one photographic plate: the portrait screened in one ink by
// scripts/halftone-plate.mjs, used as a mask so it prints in the section's ink. To swap in an
// object photo, rerun the script on it and point these two imports at its output.
import plateUrl from '@/assets/plates/portrait-halftone.svg?url'
import plate from '@/assets/plates/portrait-halftone.json'

const no = (i: number) => String(i + 1).padStart(2, '0')
const last = no(projects.length - 1)
const plateStyle = {
  aspectRatio: `${plate.width} / ${plate.height}`,
  maskImage: `url(${plateUrl})`,
  WebkitMaskImage: `url(${plateUrl})`,
}
</script>

<template>
  <section
    id="projets"
    class="section flood"
    :style="{ '--edge-shape': floodEdgeShape }"
    aria-labelledby="projects-title"
  >
    <!-- the press: a faint screen on the flood, bare at rest, never on plate 00 -->
    <PressPlate class="press" ink="var(--flood-press)" :depth="0.3" avoid=".plate" />
    <!-- the ridge's shadow sides, under its summits (lib/edge.ts) -->
    <svg
      class="edge-shade"
      :viewBox="floodEdgeShade.viewBox"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path :d="floodEdgeShade.d" />
    </svg>
    <div class="wrap">
      <div class="masthead">
        <header class="section-head">
          <p class="eyebrow">{{ sections.projects.label }}</p>
          <h2 id="projects-title">
            {{ sections.projects.title }}
            <span class="quiet">{{ sections.projects.quiet }}</span>
          </h2>
        </header>
        <!-- plate 00: the person behind the repos, his head out of the frame's top rule -->
        <figure class="plate">
          <!-- While the desk figure travels down the page (components/journey), the plate is an
               empty ruled frame until he stands in it; then a roller prints the screen down
               the plate, a row of dots at a time (--roll, set as the page scrolls). -->
          <span class="plate-box">
            <span
              class="plate-art"
              role="img"
              aria-label="Portrait de Pierre Bastiani, tramé en points"
              :style="plateStyle"
            />
            <svg class="plate-frame" viewBox="0 0 3120 3120" aria-hidden="true" focusable="false">
              <path d="M6 973H3114V3114H6Z" />
            </svg>
            <span class="roller" aria-hidden="true" />
          </span>
          <figcaption><span>N° 00</span><span>L’auteur des dépôts</span></figcaption>
        </figure>
      </div>

      <!-- the catalogue's running head: how many plates, where the code is -->
      <p class="runhead" aria-hidden="true">
        <span>Planches 01–{{ last }}</span
        ><span translate="no">github.com/PierreBastiani</span>
      </p>

      <ul class="grid">
        <li v-for="(p, i) in projects" :key="p.name" class="card">
          <ProjectArt :kind="p.art" :label="p.code" :sub="`N° ${no(i)}`" />
          <!-- the title is pasted across the frame's foot, breaking its rule -->
          <h3 translate="no">
            <a :href="p.href">{{ p.name }}<span class="arrow" aria-hidden="true">&nbsp;↗</span></a>
          </h3>
          <p class="text">{{ p.text }}</p>
          <ul v-if="p.links" class="links">
            <li v-for="l in p.links" :key="l.href">
              <a :href="l.href">{{ l.label }}<span aria-hidden="true">&nbsp;↗</span></a>
            </li>
          </ul>
          <ul class="tags" aria-label="Technologies" translate="no">
            <li v-for="t in p.tags" :key="t">{{ t }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* The section is one porphyry flood, edge to edge (.section.flood and its tokens in
   main.css). Here only the vignettes change: the flood's own grain replaces theirs (two layers
   read twice as rough), and their one spot moves off porphyry, now that porphyry is the ground:
   the sea by day, the last light at dusk; the beanie in the small poster is the sun's ochre. */
.flood {
  --vig-spot: var(--ink-sea);
  --vig-beanie: var(--ink-ochre);
  padding-bottom: var(--space-section);
}
/* its top is the porphyry ridge against the sky of the section above (lib/edge.ts): the
   summits touch the box's top, the cols sit --edge-a below it, and the title keeps its gap
   under the cols. A browser without shape() keeps the straight cut. */
@supports (clip-path: shape(from 0 0, line to 1px 1px)) {
  .flood {
    padding-top: calc(var(--space-section) + var(--edge-a));
    clip-path: var(--edge-shape);
  }
}
.edge-shade {
  display: none;
}
@supports (clip-path: shape(from 0 0, line to 1px 1px)) {
  .edge-shade {
    display: block;
    position: absolute;
    inset: 0 0 auto;
    z-index: -1;
    width: 100%;
    height: calc(var(--edge-a) * 3);
    fill: color-mix(in srgb, var(--flood-plate) 16%, var(--flood));
  }
}
/* at dusk the vignettes' ground is close to their shadow ink, so the cast screen overprints
   toward the sea instead of the paper it falls on */
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme='light']) #projets) {
    --vig-spot: var(--ink-ochre);
    --vig-cast: color-mix(in srgb, var(--rock-shade) 66%, var(--ink-sea));
  }
}
:global(:root[data-theme='dark'] #projets) {
  --vig-spot: var(--ink-ochre);
  --vig-cast: color-mix(in srgb, var(--rock-shade) 66%, var(--ink-sea));
}
.flood :deep(.art.print)::after {
  display: none;
}

/* The title and plate 00 share the head: the plate stands on the same foot line. */
.masthead {
  display: grid;
  gap: 2.5rem;
  margin-bottom: var(--space-head);
}
.masthead .section-head {
  margin-bottom: 0;
}
.plate {
  justify-self: end;
  width: min(17rem, 78%);
  margin: 0;
}
.plate-art {
  display: block;
  /* the plate's ink, dark on both floods: light dots at dusk would print a negative */
  background: var(--flood-plate);
  mask-position: center;
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
}
.plate-box {
  position: relative;
  display: block;
}
.plate-frame,
.roller {
  display: none;
}
:global(html.journey .plate-art) {
  clip-path: inset(0 0 calc(100% - var(--roll, 100%)) 0);
}
:global(html.journey .plate-frame) {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  clip-path: inset(var(--roll, 100%) 0 0 0);
  fill: none;
  stroke: var(--flood-plate);
  stroke-width: 11;
  stroke-linecap: square;
  stroke-linejoin: miter;
}
/* the roller: a heavy rule across the plate, a little wider than it, on the line being printed */
:global(html.journey .plate-box.rolling .roller) {
  display: block;
  position: absolute;
  left: -0.5rem;
  right: -0.5rem;
  top: var(--roll);
  height: var(--w-heavy);
  margin-top: calc(var(--w-heavy) / -2);
  background: var(--flood-plate);
}
.plate figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
@media (min-width: 40rem) {
  .masthead {
    grid-template-columns: minmax(0, 1fr) clamp(14rem, 30vw, 21rem);
    align-items: end;
    column-gap: clamp(2rem, 4vw, 3.5rem);
  }
  .plate {
    width: 100%;
  }
}
@media (min-width: 64rem) {
  .masthead {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .masthead .section-head {
    grid-column: 1 / span 8;
  }
  .plate {
    grid-column: 9 / span 4;
  }
}

.runhead {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.2rem 1.5rem;
  margin: 0 0 clamp(2rem, 1rem + 2vw, 3rem);
  padding: 0.55rem 0 0.5rem;
  border-top: 1.5px solid var(--ink);
  border-bottom: 1px solid var(--ink);
  color: var(--muted);
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 4.5rem clamp(2rem, 4vw, 3.5rem);
}
.card {
  position: relative;
  container-type: inline-size; /* the title scales with its plate */
  display: grid;
  gap: 0.85rem;
  align-content: start;
}
/* The picture keeps a paper margin at its foot, as deep as the title plate's top half plus a
   little air, so the plate covers margin and frame and never the drawing. */
.card :deep(.win) {
  margin-bottom: calc(0.62 * min(var(--step-3), 10.5cqi) - 5.5px + 0.55rem);
}
/* The title sits on a plate of page paper pasted over the foot of the frame: its top half on
   the picture's margin, its bottom half under it, so the frame's rule stops at the plate. */
h3 {
  z-index: 3; /* a grid item: stacks over the picture without being positioned */
  justify-self: start;
  margin: calc(-0.62em - 0.85rem) 0 0 0.9rem;
  padding: 0.12em 0.45em 0 0.3em;
  background: var(--bg);
  max-width: calc(100% - 1.8rem);
  font-size: min(var(--step-3), 10.5cqi);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.03em;
}
h3 a {
  text-decoration: none;
  text-decoration-thickness: 0.06em;
  text-underline-offset: 0.14em;
}
.arrow {
  font-weight: 400;
  font-size: 0.6em;
  vertical-align: 0.35em;
  color: var(--quiet);
  transition: color var(--dur-hover);
}
/* the whole card is the link target */
h3 a::after {
  content: '';
  position: absolute;
  inset: -0.75rem;
}
.card:hover h3 a {
  text-decoration-line: underline;
  text-decoration-color: currentColor;
}
.card:hover .arrow {
  color: currentColor;
}
.text {
  max-width: 46ch;
  margin-top: 0.35rem;
  color: var(--muted);
  line-height: 1.6;
}
/* the card's other doors (deck, video, code): mono caps, above the title's whole-card target */
.links {
  position: relative;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  font: 500 0.75rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.links a {
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}
.links span {
  color: var(--quiet);
}

/* Two columns, the right one dropped half a plate: the catalogue's page reads in a zigzag. */
@media (min-width: 40rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card:nth-child(even) {
    margin-top: 5rem;
  }
}
/* Wide: a 12-column page, one large plate and one small per row, swapping sides. */
@media (min-width: 64rem) {
  .grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    row-gap: 5.5rem;
  }
  .card:nth-child(4n + 1) {
    grid-column: 1 / span 7;
  }
  .card:nth-child(4n + 2) {
    grid-column: 8 / span 5;
  }
  .card:nth-child(4n + 3) {
    grid-column: 1 / span 5;
  }
  .card:nth-child(4n + 4) {
    grid-column: 6 / span 7;
  }
  .card:nth-child(even) {
    margin-top: 0;
  }
  /* the small plate stands on the large one's foot line on the first row and hangs from the
     large one's top line on the second, so the page steps down in a zigzag with no hole over
     the second row's small plate */
  .card:nth-child(4n + 2) {
    align-self: end;
  }
}

/* The gimmick: on hover or keyboard focus the illustration's layers lift apart, like the
   hero's depth layers. The stage scales up as it tilts, so the frame never shows an edge.
   Mouse and trackpad only, and never with reduced motion. */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .card:is(:hover, :focus-within) :deep(.stage) {
    transform: rotateX(14deg) rotateZ(-2deg) scale(1.16);
  }
  .card:is(:hover, :focus-within) :deep(.l1) {
    transform: translate3d(0, -8px, 26px);
  }
  .card:is(:hover, :focus-within) :deep(.l2) {
    transform: translate3d(0, -18px, 56px);
  }
}
</style>
