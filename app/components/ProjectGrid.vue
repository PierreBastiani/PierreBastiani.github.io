<script setup lang="ts">
import { projects, sections } from '@/content'
import ProjectArt from './ProjectArt.vue'
</script>

<template>
  <section id="projets" class="section" aria-labelledby="projects-title">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">{{ sections.projects.label }}</p>
        <h2 id="projects-title">
          {{ sections.projects.title }}
          <span class="quiet">{{ sections.projects.quiet }}</span>
        </h2>
      </header>

      <ul class="grid">
        <li v-for="p in projects" :key="p.name" class="card">
          <ProjectArt :kind="p.art" :label="p.name" :sub="p.tags[0]" />
          <h3 translate="no">
            <a :href="p.href">{{ p.name }}<span class="arrow" aria-hidden="true">&nbsp;↗</span></a>
          </h3>
          <p>{{ p.text }}</p>
          <ul class="tags" aria-label="Technologies" translate="no">
            <li v-for="t in p.tags" :key="t">{{ t }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem clamp(2rem, 4vw, 3.5rem);
}
.card {
  position: relative;
  display: grid;
  gap: 0.9rem;
  align-content: start;
}
.card :deep(.art) {
  margin-bottom: 0.6rem;
}
h3 {
  font-size: var(--step-2);
  font-weight: 600;
  letter-spacing: -0.025em;
}
h3 a {
  text-decoration: none;
}
.arrow {
  font-weight: 400;
  font-size: 0.7em;
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
  color: var(--accent-text);
}
.card:hover .arrow {
  color: currentColor;
}
.card p {
  color: var(--muted);
  line-height: 1.6;
}

@media (min-width: 40rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* The gimmick: on hover or keyboard focus the illustration's layers lift apart, like the
   hero's depth layers. Mouse and trackpad only, and never with reduced motion. */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .card:is(:hover, :focus-within) :deep(.stage) {
    transform: rotateX(16deg) rotateZ(-3deg) scale(0.94);
  }
  .card:is(:hover, :focus-within) :deep(.l1) {
    transform: translate3d(0, -8px, 26px);
  }
  .card:is(:hover, :focus-within) :deep(.l2) {
    transform: translate3d(0, -18px, 56px);
  }
}
</style>
