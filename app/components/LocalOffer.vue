<script setup lang="ts">
import { localOffer, localTestimonials } from '@/content'
import { useContact, useContactPhone } from '@/composables/useContact'
import OfferVisual from './OfferVisual.vue'
import PortraitImage from './PortraitImage.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
  <section id="commerces" class="section offer" aria-labelledby="commerces-title">
    <div class="wrap">
      <h2 id="commerces-title">{{ localOffer.title }}</h2>

      <!-- what I fix, each shown before and after -->
      <ul class="items">
        <li v-for="item in localOffer.items" :key="item.title">
          <OfferVisual :kind="item.visual" :before="item.before" :after="item.after" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </li>
      </ul>

      <!-- the three steps, printed like a timetable card in a station or a shop's opening hours -->
      <div class="sheet timetable">
        <h2 class="band"><span>{{ localOffer.how }}</span><span>{{ localOffer.howCount }}</span></h2>
        <ol>
          <li v-for="(step, i) in localOffer.steps" :key="step.title">
            <span class="n" aria-hidden="true">{{ i + 1 }}</span>
            <strong>{{ step.title }}</strong>
            <span class="t">{{ step.text }}</span>
          </li>
        </ol>
      </div>

      <!-- who I am, and the honest offer: a printed card like the summit figure's -->
      <div class="sheet trial print">
        <h2 class="band"><span>{{ localOffer.trial }}</span><span>{{ localOffer.trialFor }}</span></h2>
        <div class="trial-body">
          <div class="me">
            <span class="frame"><PortraitImage :size="104" alt="Pierre Bastiani" class="portrait" /></span>
            <div>
              <p class="name" translate="no">{{ contact.name }}</p>
              <p class="line">{{ localOffer.me.line }}</p>
            </div>
          </div>
          <p class="offer-text">{{ localOffer.offer }}</p>
        </div>
      </div>

      <!-- testimonials: nothing until a real one exists -->
      <ul v-if="localTestimonials.length" class="quotes">
        <li v-for="t in localTestimonials" :key="t.author">
          <blockquote>
            <p>{{ t.quote }}</p>
          </blockquote>
          <p class="who">{{ t.author }}<template v-if="t.shop">, {{ t.shop }}</template></p>
        </li>
      </ul>

      <!-- questions a shop owner asks: a printed notice, one native disclosure per question -->
      <div class="sheet faq">
        <h2 class="band"><span>{{ localOffer.faq.title }}</span></h2>
        <details v-for="f in localOffer.faq.items" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>

      <!-- call: the poster's lettering band -->
      <div class="call print">
        <p class="call-band">{{ localOffer.call.band }}</p>
        <p class="call-title">{{ localOffer.call.title }}</p>
        <a class="phone" :href="phoneHref">{{ phone }}</a>
        <a class="mail" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
        <div class="btns">
          <a class="btn btn-primary" :href="phoneHref">{{ localOffer.call.bar }}</a>
          <a class="btn" :href="`mailto:${contact.email}`">{{ localOffer.call.mail }}</a>
        </div>
      </div>
    </div>

    <!-- on phones, the call stays under the thumb -->
    <div class="call-bar" :class="{ tucked: heroCallVisible }" role="region" aria-label="Appeler">
      <a class="btn btn-primary" :href="phoneHref">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
        </svg>
        <span>{{ localOffer.call.bar }} <span class="nw">{{ phone }}</span></span>
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
#commerces-title {
  margin-bottom: var(--space-head);
}

/* offer items */
.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 3.5rem clamp(2rem, 5vw, 4rem);
}
.items li {
  display: grid;
  gap: 0.6rem;
  align-content: start;
}
.items :deep(.ba) {
  margin-bottom: 0.6rem;
}
.items h3 {
  font-size: var(--step-1);
}
.items p {
  color: var(--muted);
}

/* ---- Printed objects: sharp corners, an ink rule, the posters' lettering band on top ---- */
.sheet,
.call {
  margin-top: var(--space-section);
}
.sheet {
  border: 1.5px solid var(--ink);
  background: var(--bg);
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

/* the timetable: number column, a vertical rule, step title large and plain, the detail under it */
.timetable ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
.timetable li {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  column-gap: 1.25rem;
  row-gap: 0.15rem;
  padding: 1.1rem 1rem 1.1rem 0;
  border-top: 1px solid var(--line);
}
.timetable li:first-child {
  border-top: 0;
}
.n {
  grid-row: span 2;
  align-self: stretch;
  display: grid;
  place-items: start center;
  padding-top: 0.1rem;
  border-right: 1px solid var(--ink);
  font: 600 var(--step-2) / 1 var(--f-mono);
  color: var(--accent-text);
}
.timetable strong {
  font: 600 var(--step-1) / 1.2 var(--f-display);
  letter-spacing: -0.01em;
}
.t {
  color: var(--muted);
}

/* the free half-day: the figure card's family, double ink rule and grain */
.trial {
  background: var(--surface);
  box-shadow:
    inset 0 0 0 4px var(--surface),
    inset 0 0 0 5px var(--ink);
}
.trial > * {
  position: relative;
  z-index: 2;
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
.frame {
  flex: none;
  display: block;
  padding: 3px;
  border: 1px solid var(--ink);
}
.portrait {
  width: 5.5rem;
  height: 5.5rem;
}
.portrait :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name {
  font: 650 var(--step-1) / 1.2 var(--f-display);
}
.line {
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
}
.call > * {
  position: relative;
  z-index: 2;
}
.call-band {
  font: 500 0.8rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.85;
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
/* square buttons in the printed blocks (radius 0–2 px); same inks as everywhere */
.call .btn,
.call-bar .btn {
  border-radius: 2px;
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
  .timetable ol {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .timetable li {
    border-top: 0;
    border-left: 1px solid var(--line);
  }
  .timetable li:first-child {
    border-left: 0;
  }
  .trial-body {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
  }
}
</style>
