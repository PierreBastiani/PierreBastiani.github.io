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

      <!-- the three steps, as a lane through the village -->
      <div class="how">
        <h2 class="sub-h">{{ localOffer.how }}</h2>
        <ol class="lane">
          <li v-for="(step, i) in localOffer.steps" :key="step.title">
            <span class="stop" aria-hidden="true">{{ i + 1 }}</span>
            <strong>{{ step.title }}</strong>
            <span class="t">{{ step.text }}</span>
          </li>
        </ol>
      </div>


      <!-- who I am, and the honest offer -->
      <div class="trial">
        <div class="me">
          <PortraitImage :size="104" alt="Pierre Bastiani" class="portrait" />
          <div>
            <p class="name" translate="no">{{ contact.name }}</p>
            <p class="line">{{ localOffer.me.line }}</p>
          </div>
        </div>
        <div class="offer-text">
          <h2 class="sub-h">{{ localOffer.trial }}</h2>
          <p>{{ localOffer.offer }}</p>
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

      <!-- questions a shop owner asks -->
      <div class="faq">
        <h2 class="sub-h">{{ localOffer.faq.title }}</h2>
        <details v-for="f in localOffer.faq.items" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>

      <!-- call -->
      <div class="call">
        <p class="call-title">{{ localOffer.call.title }}</p>
        <a class="phone" :href="phoneHref">{{ phone }}</a>
        <a class="mail" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
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
h2 {
  margin-bottom: var(--space-head);
}
.sub-h {
  font-size: var(--step-2);
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
}
.how,
.trial,
.faq,
.call {
  margin-top: var(--space-section);
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

/* the lane: a dashed path with three stops */
.lane {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2rem;
  position: relative;
}
.lane::before {
  content: '';
  position: absolute;
  left: 1.1rem;
  top: 1rem;
  bottom: 1rem;
  border-left: 2px dashed color-mix(in srgb, var(--accent) 55%, var(--line));
}
.lane li {
  position: relative;
  display: grid;
  gap: 0.2rem;
  padding-left: 3.4rem;
}
.stop {
  position: absolute;
  left: 0;
  top: -0.1rem;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 5px var(--bg);
  color: var(--on-accent);
  font: 700 0.95rem/1 var(--f-display);
}
.lane strong {
  font: 600 var(--step-1) / 1.2 var(--f-display);
}
.t {
  color: var(--muted);
}

/* who, and the free half-day */
.trial {
  display: grid;
  gap: 2rem;
  padding: clamp(1.75rem, 5vw, 3rem);
  border-radius: 1.5rem;
  background: var(--surface);
}
.me {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.portrait {
  flex: none;
  width: 5.5rem;
  height: 5.5rem;
}
.portrait :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
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

/* FAQ */
.faq details {
  border-top: 1px solid var(--line);
  padding-block: 1rem;
}
.faq details:last-child {
  border-bottom: 1px solid var(--line);
}
.faq summary {
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.faq summary::-webkit-details-marker {
  display: none;
}
.faq summary::after {
  content: '+';
  flex: none;
  color: var(--accent-text);
  font-weight: 400;
  transition: transform var(--dur-hover) var(--ease);
}
.faq details[open] summary::after {
  transform: rotate(45deg);
}
.faq details p {
  margin-top: 0.6rem;
  color: var(--muted);
}

/* call */
.call {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
}
.call-title {
  font: 600 var(--step-2) / 1.15 var(--f-display);
  letter-spacing: -0.02em;
}
.phone {
  font: 650 var(--step-3) / 1 var(--f-display);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-decoration: none;
  color: var(--accent-text);
}
.mail {
  overflow-wrap: anywhere;
}

/* sticky call bar: phones only */
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
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--line);
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
    stroke-linejoin: round;
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
  .lane {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2.5rem;
  }
  .lane::before {
    left: 1.1rem;
    right: 1.1rem;
    top: 1.1rem;
    bottom: auto;
    border-left: 0;
    border-top: 2px dashed color-mix(in srgb, var(--accent) 55%, var(--line));
  }
  .lane li {
    padding-left: 0;
    padding-top: 3.4rem;
  }
  .trial {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
  }
}
</style>
