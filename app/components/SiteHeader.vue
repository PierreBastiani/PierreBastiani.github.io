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
      <NuxtLink v-if="props.variant === 'geek'" class="name" :to="links.home" translate="no">
        <BrandMark /><span class="who">{{ contact.name }}</span>
      </NuxtLink>
      <a v-else class="name" href="#top" translate="no"
        ><BrandMark /><span class="who">{{ contact.name }}</span></a
      >

      <nav v-if="props.variant !== 'geek'" aria-label="Sections">
        <ul>
          <li><a href="#competences">Compétences</a></li>
          <li><a href="#parcours">Parcours</a></li>
          <li><a href="#projets">Projets</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <NuxtLink v-if="props.variant !== 'geek'" class="switch" :to="links.geek"
        >Geek du quartier</NuxtLink
      >
      <!-- on a phone the long label doesn't fit; "Développeur" alone didn't say where it leads -->
      <NuxtLink v-else class="switch" :to="links.home">
        <span class="long">Développeur full-stack &amp; DevOps</span>{{ ' '
        }}<span class="short">Profil développeur</span>
      </NuxtLink>

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
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
          />
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
  /* Opaque, from the very top (safe area included): nothing that scrolls under the header
     shows through it, as a translucent blur let section labels do. */
  background: var(--bg);
  box-shadow: inset 0 -1px 0 var(--line); /* the hairline under the header */
}
.bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: var(--header-h);
}
.name {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font: 650 1rem/1 var(--f-display);
  text-decoration: none;
  letter-spacing: -0.01em;
  margin-right: auto;
  white-space: nowrap;
}
/* The wordmark stands alone: the hero under it spells the name out. The link keeps the name
   for screen readers. */
.who {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* The section links: a framed strip of tabs, ink rule round it and between them, mono caps
   like the lettering on the printed cards. Hover lays the ground band under a tab. */
nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--ink);
  font: 500 0.72rem / 1 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
nav li + li {
  border-left: 1px solid var(--ink);
}
nav a {
  display: block;
  padding: 0.7rem 0.9rem 0.65rem;
  text-decoration: none;
  white-space: nowrap;
  color: var(--ink);
  transition:
    color var(--dur-hover),
    background-color var(--dur-hover);
}
nav a:hover {
  color: var(--on-ground);
  background: var(--ground);
}
/* the ring sits inside the tab, clear of the strip's rules */
nav a:focus-visible {
  outline-offset: -5px;
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
.switch .short {
  display: none;
}
/* the theme toggle: a square key in the same ink frame */
.theme {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--ink);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
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
  stroke-width: 1.5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}
.theme svg .fill {
  fill: currentColor;
}
.theme:hover {
  color: var(--on-ground);
  background: var(--ground);
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
  .switch .short {
    display: inline;
  }
}
/* Large text (a phone at 150 % or 200 %, where a rem is 24 or 32 px; at normal size only a
   screen under 320 px): mark, switch and key no longer fit one row, so the key stays by the
   mark and the switch takes a second row under them, rather than pushing the page sideways */
@media (max-width: 20rem) {
  .bar {
    flex-wrap: wrap;
    row-gap: 0.25rem;
    padding-block: 0.5rem;
  }
  .switch {
    order: 1;
    flex-basis: 100%;
    padding-bottom: 0.25rem;
    white-space: normal;
  }
}
</style>
