<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contact, links, logbook, profile, routeCard, sections } from '@/content'
import PortraitImage from './PortraitImage.vue'
import SummitStrip from './SummitStrip.vue'

// The register's first line is dated today, in French. Set on mount: the prerendered page
// was built on another day.
const today = ref('')
onMounted(() => {
  today.value = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
})

const signHref = `mailto:${contact.email}?subject=${encodeURIComponent(logbook.subject)}&body=${encodeURIComponent(logbook.body)}`
const hrefs = { malt: links.malt, email: `mailto:${contact.email}` }

// Tiny line icons for the route card, 24-unit grid, drawn for this site.
const icons: Record<string, string> = {
  clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  route: 'M6 21c0-4 3-5 3-8s-3-4-3-8 M18 21c0-4-3-5-3-8s3-4 3-8 M9 13h6',
  tag: 'M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z M8.5 8.5h.01',
  mail: 'M3.5 6.5h17v11h-17z M3.5 6.5l8.5 7 8.5-7',
}
</script>

<template>
  <section id="contact" class="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">{{ sections.contact.label }}</p>
        <h2 id="contact-title">
          {{ sections.contact.title }}
          <span class="quiet">{{ profile.availability }}</span>
        </h2>
      </header>

      <div class="grid">
        <div class="who">
          <div class="id">
            <PortraitImage :size="104" alt="Pierre Bastiani" class="portrait" />
            <div class="id-text">
              <p class="name" translate="no">{{ contact.name }}</p>
              <p class="role">{{ profile.role }}</p>
              <p class="line">{{ routeCard.intro }}</p>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">{{ routeCard.title }}</h3>
            <dl>
              <div v-for="r in routeCard.rows" :key="r.label" class="row">
                <dt>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="icons[r.icon]" /></svg>
                  {{ r.label }}
                </dt>
                <dd>
                  <a v-if="r.href" :href="hrefs[r.href]" :class="{ mail: r.href === 'email' }">{{ r.value }}</a>
                  <template v-else>{{ r.value }}</template>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="logbook">
          <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z M13.5 7l3 3 M4 20l4.5-1.5" />
          </svg>
          <h3>{{ logbook.title }}</h3>
          <p class="intro">{{ logbook.intro }}</p>
          <table>
            <thead>
              <tr>
                <th v-for="c in logbook.columns" :key="c" scope="col">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="date">{{ today }}</td>
                <td class="you">{{ logbook.you }}</td>
                <td><span class="visually-hidden">à remplir</span></td>
              </tr>
              <tr v-for="n in 2" :key="n" aria-hidden="true">
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div class="btns">
            <a class="btn btn-primary" :href="signHref">{{ logbook.sign }}</a>
            <a class="btn" :href="links.malt">Me contacter sur Malt</a>
          </div>
          <p class="note">{{ logbook.note }}</p>
        </div>
      </div>
    </div>

    <SummitStrip />
  </section>
</template>

<style scoped>
.contact {
  padding-top: var(--space-section);
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 3.5rem clamp(3rem, 6vw, 6rem);
  align-items: start;
  margin-bottom: clamp(4rem, 8vw, 7rem);
}
.who {
  display: grid;
  gap: 2.75rem;
}

/* Malt-style header: round portrait, name, title, one line in the first person */
.id {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.portrait {
  flex: none;
  width: 6.5rem;
  height: 6.5rem;
}
.portrait :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--wash);
}
.id-text {
  display: grid;
  gap: 0.2rem;
}
.name {
  font: 650 var(--step-1) / 1.2 var(--f-display);
  letter-spacing: -0.015em;
}
.role {
  color: var(--muted);
}
.line {
  margin-top: 0.4rem;
}

/* Guidebook route card: mono labels, tiny line icons, hairlines between rows */
.card {
  display: grid;
  gap: 1rem;
}
.card-title {
  font: 500 0.8rem / 1.4 var(--f-mono);
  letter-spacing: 0.02em;
  color: var(--muted);
}
dl {
  margin: 0;
  border-top: 1px solid var(--line);
}
.row {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 0.25rem 1rem;
  padding-block: 0.85rem;
  border-bottom: 1px solid var(--line);
}
dt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font: 400 0.8rem / 1.5 var(--f-mono);
  color: var(--muted);
}
dt svg {
  flex: none;
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
dd {
  margin: 0;
  font-weight: 500;
}
.mail {
  overflow-wrap: anywhere;
}

/* The summit register: a page of a small logbook, ruled, with a pencil in the corner */
.logbook {
  position: relative;
  display: grid;
  gap: 1.1rem;
  padding: clamp(1.75rem, 4vw, 2.75rem);
  border-radius: 1.25rem;
  background: var(--surface);
}
.pencil {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.logbook h3 {
  font-size: var(--step-2);
  letter-spacing: -0.025em;
  padding-right: 2.5rem;
}
.intro {
  color: var(--muted);
  max-width: 46ch;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-block: 0.25rem 0.75rem;
}
th {
  text-align: left;
  font: 400 0.8rem / 1.4 var(--f-mono);
  color: var(--muted);
  padding: 0 0.75rem 0.5rem 0;
}
th:first-child {
  width: 34%;
}
th:nth-child(2) {
  width: 24%;
}
td {
  height: 2.6rem;
  padding: 0 0.75rem 0.4rem 0;
  border-bottom: 1px solid var(--line);
  vertical-align: bottom;
}
.date {
  font: 400 var(--step--1) / 1.4 var(--f-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.you {
  color: var(--accent-text);
  font-weight: 550;
}
.note {
  color: var(--muted);
  font-size: var(--step--1);
}
@media (max-width: 52rem) {
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 30rem) {
  .row {
    grid-template-columns: 1fr;
  }
  .id {
    align-items: flex-start;
  }
  .portrait {
    width: 5rem;
    height: 5rem;
  }
}
</style>
