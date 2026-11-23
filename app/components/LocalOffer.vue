<script setup lang="ts">
import { localOffer, localTestimonials } from '@/content'
import { useContact, useContactPhone } from '@/composables/useContact'
import OfferVisual from './OfferVisual.vue'
import PressPlate from './PressPlate.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
// the main page's plate 00, the portrait screened in one ink (scripts/halftone-plate.mjs), here
// printed in the trial card's ink
import plateUrl from '@/assets/plates/portrait-halftone.svg?url'
import plate from '@/assets/plates/portrait-halftone.json'

const no = (i: number) => String(i + 1).padStart(2, '0')
const plateStyle = {
  aspectRatio: `${plate.width} / ${plate.height}`,
  maskImage: `url(${plateUrl})`,
  WebkitMaskImage: `url(${plateUrl})`,
}

// The phone bar hides while the hero's own call button is on screen, so there's never two.
// Without JS it simply stays.
const heroCallVisible = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  const heroCall = document.querySelector('.intro-grid .btn-primary')
  if (!heroCall) return
  io = new IntersectionObserver(([e]) => (heroCallVisible.value = !!e?.isIntersecting))
  io.observe(heroCall)
})
onBeforeUnmount(() => io?.disconnect())
const contact = useContact()
const { phone, phoneHref } = useContactPhone()
</script>

<template>
  <section id="commerces" class="section offer items-section" aria-labelledby="commerces-title">
    <div class="wrap">
      <h2 id="commerces-title">{{ localOffer.title }}</h2>
      <!-- the catalogue's running head, as over the main page's project plates -->
      <p class="runhead" aria-hidden="true">
        <span>Planches 01–{{ no(localOffer.items.length - 1) }}</span
        ><span>Avant · Après</span>
      </p>

      <!-- what I fix, each shown before and after on a numbered plate, its title pasted across
           the plate's foot -->
      <ul class="items">
        <li v-for="(item, i) in localOffer.items" :key="item.title" class="item">
          <OfferVisual
            :kind="item.visual"
            :before="item.before"
            :after="item.after"
            :code="item.code"
            :no="`N° ${no(i)}`"
          />
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </li>
      </ul>
    </div>
  </section>

  <!-- the three steps: the page's one flood, a line with three stops, like a local railway's
       poster map -->
  <section id="etapes" class="section offer flood" aria-labelledby="etapes-title">
    <!-- the press: a faint screen on the flood, bare at rest -->
    <PressPlate class="press" ink="var(--flood-press)" />
    <div class="wrap">
      <h2 id="etapes-title">{{ localOffer.how }}</h2>
      <ol class="line">
        <li v-for="(step, i) in localOffer.steps" :key="step.title" class="stop">
          <span class="station" aria-hidden="true"></span>
          <span class="n" aria-hidden="true">{{ i + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="section offer rest" aria-labelledby="essai-title">
    <div class="wrap">
      <!-- who I am, and the honest offer: a printed card, the portrait screened like the main
           page's plate 00, his head out of its frame -->
      <div class="sheet trial print">
        <PressPlate class="press" ink="var(--trial-press)" avoid=".portrait-plate" />
        <h2 id="essai-title" class="band">
          <span>{{ localOffer.trial }}</span
          >{{ ' ' }}<span>{{ localOffer.trialFor }}</span>
        </h2>
        <div class="trial-body">
          <div class="me">
            <figure class="portrait-plate">
              <span
                class="plate-art"
                role="img"
                aria-label="Portrait de Pierre Bastiani, tramé en points"
                :style="plateStyle"
              />
            </figure>
            <p class="name" translate="no">{{ contact.name }}</p>
          </div>
          <p class="line-me">{{ localOffer.me.line }}</p>
          <p class="offer-text">{{ localOffer.offer }}</p>
        </div>
      </div>

      <!-- testimonials: nothing until a real one exists -->
      <ul v-if="localTestimonials.length" class="quotes">
        <li v-for="t in localTestimonials" :key="t.author">
          <blockquote>
            <p>{{ t.quote }}</p>
          </blockquote>
          <p class="who">
            {{ t.author }}<template v-if="t.shop">, {{ t.shop }}</template>
          </p>
        </li>
      </ul>

      <!-- call: the poster's lettering band, straight after the offer (the questions follow it,
           so the number is one screen nearer than when it closed the page). #contact, like the main page's contact section, so
           the hero's figure at the desk leads here on this page -->
      <div id="contact" class="call print">
        <!-- the press on the band, as on the footer's -->
        <PressPlate
          class="press"
          :windowed="false"
          ink="color-mix(in srgb, var(--on-ground) 10%, var(--ground))"
        />
        <p class="call-band">
          <template v-for="(place, i) in localOffer.call.band.split(' · ')" :key="place"
            >{{ i ? ' · ' : '' }}<span class="nw">{{ place }}</span></template
          >
        </p>
        <p class="call-title">{{ localOffer.call.title }}</p>
        <a class="phone" :href="phoneHref">{{ phone }}</a>
        <a class="mail" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
        <div class="btns">
          <a class="btn btn-primary" :href="phoneHref">{{ localOffer.call.bar }}</a>
          <a class="btn" :href="`mailto:${contact.email}`">{{ localOffer.call.mail }}</a>
        </div>
      </div>
      <!-- questions a shop owner asks: a printed notice, one native disclosure per question -->
      <div class="sheet faq">
        <h2 class="band">
          <span>{{ localOffer.faq.title }}</span>
        </h2>
        <details v-for="f in localOffer.faq.items" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </div>

    <!-- on phones, the call stays under the thumb -->
    <div class="call-bar" :class="{ tucked: heroCallVisible }" role="region" aria-label="Appeler">
      <a class="btn btn-primary" :href="phoneHref">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"
          />
        </svg>
        <span
          >{{ localOffer.call.bar }} <span class="nw">{{ phone }}</span></span
        >
      </a>
    </div>
  </section>
</template>

<style scoped>
/* Read by a shop owner on a phone: larger text, shorter lines than the main page. */
.offer {
  font-size: clamp(1.1rem, 1.04rem + 0.3vw, 1.2rem);
  line-height: 1.6;
}
.offer p {
  max-width: 46ch;
}
.items-section {
  padding-bottom: var(--space-section);
}
#commerces-title {
  margin-bottom: 1.5rem;
}
#etapes-title {
  margin-bottom: clamp(2rem, 1rem + 2vw, 3rem);
}
/* the running head over a catalogue: mono caps between an ink rule and a hairline */
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
.offer .runhead {
  max-width: none;
}

/* offer items: numbered plates, each title pasted across its plate's foot */
.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 3.25rem clamp(2rem, 5vw, 4rem);
}
.item {
  /* the title's size, from the plate's width (a token list: cqi resolves where it is used) */
  --t: min(var(--step-2), 7.6cqi);
  position: relative;
  container-type: inline-size;
  display: grid;
  gap: 0.85rem;
  align-content: start;
}
/* the plate keeps a paper margin under its captions, as deep as the title plate's top half
   plus a little air, so the title covers margin and frame and never a caption */
.item :deep(.ba figcaption) {
  margin-bottom: calc(0.62 * var(--t) - 5.5px + 0.55rem);
}
.item h3 {
  z-index: 3; /* a grid item: stacks over the plate without being positioned */
  justify-self: start;
  margin: calc(-0.62em - 0.85rem) 0 0 0.9rem;
  padding: 0.12em 0.45em 0 0.3em;
  background: var(--bg);
  max-width: calc(100% - 1.8rem);
  font-size: var(--t);
  font-weight: 650;
  line-height: 1.05;
  letter-spacing: -0.025em;
  text-wrap: balance;
}
.item p {
  margin-top: 0.2rem;
  color: var(--muted);
}

/* ---- The flood: the three steps on one porphyry sheet, edge to edge -------------------- */
/* As on the main page's projects (.section.flood and its tokens in main.css). */
.flood {
  /* a sheet of its own: its paper margins a little under the section gap */
  padding-block: calc(var(--space-section) * 0.75);
}
#etapes-title {
  font-size: var(--step-h2);
}
/* the line: a heavy rule through three stops; each stop a square station on the rule, the
   number large under it, then the step */
.line {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2rem;
}
.stop {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: 1.25rem;
  padding-top: 1.25rem;
  border-top: var(--w-heavy) solid var(--ink);
}
/* the station: a square of the flood framed in the line's ink, astride the rule */
.station {
  position: absolute;
  top: calc(var(--w-heavy) / -2);
  left: 0;
  width: 1.15rem;
  height: 1.15rem;
  translate: 0 -50%;
  background: var(--flood);
  border: var(--w-heavy) solid var(--ink);
}
.stop .n {
  grid-row: span 2;
  font: 800 var(--step-4) / 0.8 var(--f-display);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.stop h3 {
  font: 650 var(--step-2) / 1.1 var(--f-display);
  letter-spacing: -0.02em;
}
.stop p {
  margin-top: 0.4rem;
}

/* ---- Printed objects: sharp corners, an ink rule, the posters' lettering band on top ---- */
.sheet,
.call {
  margin-top: var(--space-section);
}
.rest .wrap > :first-child {
  margin-top: 0;
}
/* the notice is the page's own paper, so the page's press shows through it */
.sheet {
  border: 1.5px solid var(--ink);
}
.band {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  margin: 0;
  padding: 0.55rem 1rem;
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.8rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* the free half-day: the figure card's family, double ink rule and grain */
.trial {
  background: var(--surface);
  box-shadow:
    inset 0 0 0 4px var(--surface),
    inset 0 0 0 5px var(--ink);
}
.trial {
  /* the press on the card: the ghost wall's ink, 8% into the card, like the page's own */
  --trial-press: color-mix(in srgb, var(--ghost-ink) 8%, var(--surface));
}
.trial > * {
  position: relative;
  z-index: 2;
}
.trial > .press,
.call > .press {
  position: absolute;
  z-index: 0;
}
.trial .band {
  margin: 5px 5px 0;
}
.trial-body {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1.25rem, 4vw, 2.25rem);
}
.me {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.me {
  align-items: end;
}
/* plate 00's portrait, printed in the card's ink; the head rises out of the frame's top rule.
   The screen is a positive: at dusk the card is navy and light dots would print a negative,
   so the plate gets its own sheet of shell paper there, printed in the night ink */
.portrait-plate {
  --plate-paper: var(--surface);
  --plate-ink: var(--ink);
  flex: none;
  width: clamp(7.5rem, 26vw, 12rem);
  margin: 0;
  padding: 0.3rem;
  background: var(--plate-paper);
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme='light']) .trial .portrait-plate) {
    --plate-paper: var(--ink-shell);
    --plate-ink: var(--ink-oxblood);
  }
}
:global(:root[data-theme='dark'] .trial .portrait-plate) {
  --plate-paper: var(--ink-shell);
  --plate-ink: var(--ink-oxblood);
}
.plate-art {
  display: block;
  background: var(--plate-ink);
  mask-position: center;
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
}
.me .name {
  padding-bottom: 0.1rem;
}
.trial-body .line-me {
  margin-top: -0.75rem;
}
.name {
  font: 650 var(--step-1) / 1.2 var(--f-display);
}
.line-me {
  color: var(--muted);
}

/* testimonials */
.quotes {
  list-style: none;
  margin: var(--space-section) 0 0;
  padding: 0;
  display: grid;
  gap: 2rem;
}
blockquote {
  margin: 0;
  font-size: var(--step-1);
}
.who {
  margin-top: 0.5rem;
  color: var(--muted);
}

/* the notice: questions in bold, answers behind a native disclosure, rules between */
.faq details {
  border-top: 1px solid var(--line);
  padding: 0 1rem;
}
.faq .band + details {
  border-top: 0;
}
.faq summary {
  cursor: pointer;
  font-weight: 650;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-block: 1rem;
}
.faq summary::-webkit-details-marker {
  display: none;
}
/* a square printed marker: + closed, − open */
.faq summary::after {
  content: '+';
  flex: none;
  display: grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  border: 1px solid var(--ink);
  font: 500 1rem / 1 var(--f-mono);
  color: var(--ink);
}
.faq details[open] summary::after {
  content: '−';
  background: var(--ink);
  color: var(--bg);
}
.faq summary:hover::after {
  border-color: var(--accent-text);
}
.faq details p {
  padding-bottom: 1.1rem;
  color: var(--muted);
}

/* the call: a lettering band in the ground ink, with grain, the number in large type */
.call {
  display: grid;
  gap: 0.6rem;
  justify-items: start;
  padding: clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 5vw, 3rem);
  background: var(--ground);
  color: var(--on-ground);
  /* an inner printed rule in --on-ground-rule, so the band reads as an object on a dark page too */
  box-shadow:
    inset 0 0 0 5px var(--ground),
    inset 0 0 0 6px var(--on-ground-rule);
}
.call > * {
  position: relative;
  z-index: 2;
}
/* .call .call-band outranks .offer p, whose 46ch cap would break the place names */
.call .call-band {
  max-width: none;
  font: 500 0.8rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--on-ground-muted);
}
.call-title {
  font: 600 var(--step-2) / 1.15 var(--f-display);
  letter-spacing: -0.02em;
}
.phone {
  font: 700 var(--step-4) / 1 var(--f-display);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-decoration: none;
  color: var(--on-ground);
}
.phone:hover {
  color: var(--on-ground);
  text-decoration: underline;
  text-decoration-thickness: 0.06em;
}
.call .mail {
  overflow-wrap: anywhere;
  color: var(--on-ground);
}
.call .btns {
  margin-top: 0.75rem;
}
/* sticky call bar: phones only, opaque, an ink rule on top */
.call-bar {
  display: none;
}
.nw {
  white-space: nowrap;
}
@media (max-width: 40rem) {
  .call-bar {
    display: block;
    position: fixed;
    inset: auto 0 0;
    z-index: 30;
    padding: 0.6rem var(--gutter-r) calc(0.6rem + env(safe-area-inset-bottom, 0px)) var(--gutter);
    background: var(--bg);
    border-top: 1.5px solid var(--ink);
    transition:
      transform var(--dur-fade) var(--ease),
      visibility 0s;
  }
  /* while the bar shows, a link reached with Tab scrolls clear of it instead of under it (its
     height: 3rem button, 0.6rem padding twice, the rule, the safe area) */
  :global(html:has(.call-bar:not(.tucked))) {
    scroll-padding-bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px) + 1rem);
  }
  .call-bar.tucked {
    transform: translateY(110%);
    visibility: hidden;
    transition:
      transform var(--dur-fade) var(--ease),
      visibility 0s linear var(--dur-fade);
  }
  .call-bar .btn {
    width: 100%;
    justify-content: center;
    min-height: 3rem;
    font-size: 1.05rem;
  }
  .call-bar svg {
    width: 1.15rem;
    height: 1.15rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linejoin: miter;
  }
  .phone {
    font-size: clamp(2.4rem, 11vw, 3.2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .call-bar,
  .call-bar.tucked {
    transition: none;
  }
}
@media (min-width: 48rem) {
  .items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  /* one line across the sheet, the stops along it */
  .line {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
  }
  .stop {
    grid-template-columns: minmax(0, 1fr);
    padding-right: clamp(1.5rem, 4vw, 3.5rem);
  }
  .stop .n {
    grid-row: auto;
    margin-bottom: 0.9rem;
  }
  .trial-body {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    column-gap: clamp(1.5rem, 4vw, 3rem);
  }
  .trial-body .offer-text {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: end;
  }
}
</style>
