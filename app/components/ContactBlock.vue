<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { links, logbook, profile, routeCard, sections } from '@/content'
import { useContact } from '@/composables/useContact'
import PortraitImage from './PortraitImage.vue'
import CliffOverlay from './CliffOverlay.vue'

// The register's first line is dated today, in French. Set on mount: the prerendered page
// was built on another day.
const today = ref('')
onMounted(() => {
  today.value = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
})

const contact = useContact()
const signHref = `mailto:${contact.email}?subject=${encodeURIComponent(logbook.subject)}&body=${encodeURIComponent(logbook.body)}`
const hrefs = { malt: links.malt, email: `mailto:${contact.email}` }

// Line icons for the route card, 24-unit grid, one weight, square ends like the drawings.
const icons: Record<string, string> = {
  clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  route: 'M6 21c0-4 3-5 3-8s-3-4-3-8 M18 21c0-4-3-5-3-8s3-4 3-8 M9 13h6',
  tag: 'M3.5 12.5V3.5h9l8 8-9 9z M8 8h1',
  mail: 'M3.5 6.5h17v11h-17z M3.5 6.5l8.5 7 8.5-7',
}
</script>

<template>
  <section id="contact" class="contact" aria-labelledby="contact-title">
    <!-- the face rises along the right edge to the summit: the logbook at its top anchor -->
    <CliffOverlay side="right" width="clamp(180px, 26vw, 360px)" summit-at="#contact .logbook" :summit-gap="96" desk />
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">{{ sections.contact.label }}</p>
        <h2 id="contact-title">{{ sections.contact.title }}</h2>
        <p class="sub">{{ profile.availability }}</p>
      </header>

      <div class="grid">
        <div class="who">
          <div class="id">
            <span class="frame"><PortraitImage :size="104" alt="Pierre Bastiani" class="portrait" /></span>
            <div class="id-text">
              <p class="name" translate="no">{{ contact.name }}</p>
              <p class="role">{{ profile.role }}</p>
              <p class="line">{{ routeCard.intro }}</p>
            </div>
          </div>

          <!-- a guidebook route box: lettering band, mono labels, hairline rules -->
          <div class="box">
            <h3 class="band"><span>{{ routeCard.title }}</span><span>{{ routeCard.place }}</span></h3>
            <dl>
              <div v-for="r in routeCard.rows" :key="r.label" class="row">
                <dt>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="icons[r.icon]" /></svg>
                  {{ r.label }}
                </dt>
                <dd>
                  <a v-if="r.href" :href="hrefs[r.href]" :class="{ mail: r.href === 'email' }">{{ r.href === 'email' ? contact.email : r.value }}</a>
                  <template v-else>{{ r.value }}</template>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- the summit register, printed: double ink rule, grain, lettering band, ruled page -->
        <div class="logbook print">
          <h3 class="band">
            <span>{{ logbook.title }}</span>
            <span>{{ logbook.place }} · {{ logbook.altitude }}</span>
          </h3>
          <p class="intro">{{ logbook.intro }}</p>
          <div class="ruled" aria-hidden="true">
            <p><span class="date">{{ today }}</span><span class="you">{{ logbook.you }}</span></p>
            <p></p>
            <p></p>
          </div>
          <div class="btns">
            <a class="btn btn-primary" :href="signHref">{{ logbook.sign }}</a>
            <a class="btn" :href="links.malt">Me contacter sur Malt</a>
          </div>
          <p class="note">{{ logbook.note }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  isolation: isolate;
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
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
  gap: 2.5rem;
}

/* portrait in a printed frame, like the summit figure's card */
.id {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.frame {
  flex: none;
  display: block;
  padding: 3px;
  border: 1px solid var(--ink);
}
.portrait {
  width: 6.5rem;
  height: 6.5rem;
}
.portrait :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
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

/* The lettering band shared by both printed objects: the poster's bottom band, in mono caps. */
.band {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  padding: 0.45rem 0.9rem;
  background: var(--ground);
  color: var(--on-ground);
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* guidebook route box */
.box {
  border: 1.5px solid var(--ink);
}
dl {
  margin: 0;
  padding: 0 0.9rem;
}
.row {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 0.25rem 1rem;
  padding-block: 0.8rem;
  border-top: 1px solid var(--line);
}
.row:first-child {
  border-top: 0;
}
dt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font: 400 0.78rem / 1.5 var(--f-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
dt svg {
  flex: none;
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}
dd {
  margin: 0;
  font-weight: 500;
}
.mail {
  overflow-wrap: anywhere;
}

/* The summit register: a printed page. Double ink rule, the grain of the drawings, sharp corners. */
.logbook {
  display: grid;
  gap: 1.1rem;
  padding: 0 clamp(1.25rem, 3vw, 2rem) clamp(1.5rem, 3vw, 2rem);
  border: 1.5px solid var(--ink);
  background: var(--surface);
  box-shadow:
    inset 0 0 0 4px var(--surface),
    inset 0 0 0 5px var(--ink);
}
/* everything sits above the grain */
.logbook > * {
  position: relative;
  z-index: 2;
}
.logbook .band {
  margin: 5px calc(-1 * clamp(1.25rem, 3vw, 2rem) + 5px) 0.4rem;
}
.intro {
  color: var(--muted);
  max-width: 46ch;
}
/* three ruled lines, the first one dated */
.ruled p {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  height: 2.4rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
}
.date {
  font: 400 var(--step--1) / 1.4 var(--f-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.you {
  color: var(--accent-text);
  font-weight: 600;
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
  .band {
    flex-direction: column;
    gap: 0.15rem;
  }
}
</style>
