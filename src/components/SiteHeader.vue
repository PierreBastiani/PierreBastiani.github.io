<script setup lang="ts">
import { contact, links } from '@/content'
import { useTheme } from '@/composables/useTheme'

const props = defineProps<{ variant?: 'main' | 'geek' }>()
const { mode, next, cycle } = useTheme()

// The button shows the current mode; its label says what it is and what a click does.
const names = { auto: 'automatique (suit l’appareil)', light: 'clair', dark: 'sombre' }
</script>

<template>
  <header class="site-header vt-header">
    <div class="wrap bar">
      <a class="name" :href="props.variant === 'geek' ? links.home : '#top'" translate="no">{{ contact.name }}</a>

      <nav v-if="props.variant !== 'geek'" aria-label="Sections">
        <ul>
          <li><a href="#competences">Compétences</a></li>
          <li><a href="#parcours">Parcours</a></li>
          <li><a href="#projets">Projets</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <a v-if="props.variant !== 'geek'" class="switch" :href="links.geek">Geek du quartier</a>
      <a v-else class="switch" :href="links.home">
        Développeur<span class="long"> full-stack &amp; DevOps</span>
      </a>

      <button
        type="button"
        class="theme"
        :aria-label="`Thème ${names[mode]}. Passer au thème ${names[next]}`"
        :title="`Thème ${names[mode]}`"
        @click="cycle"
      >
        <svg v-if="mode === 'auto'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16Z" class="fill" />
        </svg>
        <svg v-else-if="mode === 'light'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding-top: env(safe-area-inset-top, 0px);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
}
.bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: var(--header-h);
}
.name {
  font: 650 1rem/1 var(--f-display);
  text-decoration: none;
  letter-spacing: -0.01em;
  margin-right: auto;
  white-space: nowrap;
}
/* One small pill holds the section links. */
nav ul {
  display: flex;
  gap: 0.1rem;
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--wash);
  font-size: 0.875rem;
  font-weight: 500;
}
nav a {
  display: block;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
  color: var(--muted);
  transition:
    color var(--dur-hover),
    background-color var(--dur-hover);
}
nav a:hover {
  color: var(--ink);
  background: var(--bg);
}
.switch {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  color: var(--muted);
  text-decoration: none;
}
.switch:hover {
  color: var(--ink);
}
.theme {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-right: -0.5rem;
  border-radius: 50%;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    color var(--dur-hover),
    background-color var(--dur-hover);
}
.theme svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
}
.theme svg .fill {
  fill: currentColor;
}
.theme:hover {

  color: var(--ink);
  background: var(--wash);
}
@media (max-width: 52rem) {
  nav {
    display: none;
  }
}
@media (max-width: 30rem) {
  .bar {
    gap: 0.9rem;
  }
  .long {
    display: none;
  }
}
</style>
