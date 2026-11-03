<script setup lang="ts">
import { contact, localOffer, sections } from '@/content'
</script>

<template>
  <section id="commerces" class="section offer" aria-labelledby="commerces-title">
    <div class="wrap">
      <div class="top">
        <h2 id="commerces-title">{{ localOffer.title }}</h2>

        <ul class="items">
          <li v-for="item in localOffer.items" :key="item.title">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </li>
        </ul>
      </div>

      <div class="how">
        <h3 class="how-title">{{ sections.local.how }}</h3>
        <ol class="steps">
          <li v-for="(step, i) in localOffer.steps" :key="step.title">
            <span class="n" aria-hidden="true">{{ i + 1 }}</span>
            <strong>{{ step.title }}</strong>
            <span class="t">{{ step.text }}</span>
          </li>
        </ol>
      </div>

      <aside class="trial" aria-labelledby="trial-title">
        <h3 id="trial-title">{{ sections.local.trial }}</h3>
        <p>{{ localOffer.offer }}</p>
        <div class="contact">
          <a class="phone" :href="contact.phoneHref">{{ contact.phone }}</a>
          <a class="mail" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.top {
  display: grid;
  gap: 3rem clamp(3rem, 7vw, 7rem);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  align-items: start;
}
.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2.25rem;
}
.items p {
  color: var(--muted);
  margin-top: 0.4rem;
}
.how {
  display: grid;
  gap: 2.5rem;
  margin-top: var(--space-section);
}
.how-title {
  font-size: var(--step-2);
  letter-spacing: -0.025em;
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.5rem clamp(2rem, 4vw, 3.5rem);
}
.steps li {
  display: grid;
  gap: 0.4rem;
  align-content: start;
}
/* a real sequence, so numbers earn their place; kept quiet, no accent */
.n {
  font: 300 var(--step-3) / 1 var(--f-display);
  color: var(--quiet);
  margin-bottom: 0.6rem;
}
.steps strong {
  font: 600 var(--step-1) / 1.15 var(--f-display);
  letter-spacing: -0.01em;
}
.t {
  color: var(--muted);
}
.trial {
  display: grid;
  gap: 1.25rem;
  margin-top: var(--space-section);
  padding: clamp(2rem, 5vw, 3.5rem);
  border-radius: 1.5rem;
  background: var(--surface);
}
.trial h3 {
  font-size: var(--step-2);
  letter-spacing: -0.025em;
}
.trial > p {
  max-width: 58ch;
  font-size: var(--step-1);
  line-height: 1.5;
}
.contact {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 2rem;
  margin-top: 0.5rem;
}
.phone {
  font: 600 var(--step-3) / 1 var(--f-display);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-decoration: none;
}
.mail {
  overflow-wrap: anywhere;
}
@media (max-width: 52rem) {
  .top,
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
