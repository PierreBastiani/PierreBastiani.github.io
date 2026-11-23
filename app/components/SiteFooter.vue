<script setup lang="ts">
import { contact, links } from '@/content'
import GithubIcon from '@/assets/icons/GithubIcon.vue'
import LinkedinIcon from '@/assets/icons/LinkedinIcon.vue'
import MaltIcon from '@/assets/icons/MaltIcon.vue'
import GeekIcon from '@/assets/icons/GeekIcon.vue'
import LaptopIcon from '@/assets/icons/LaptopIcon.vue'
import PressPlate from '@/components/PressPlate.vue'

const props = defineProps<{ variant?: 'main' | 'geek' }>()
// the year the pages were generated: the same in the prerendered HTML and after hydration,
// even when a visitor's clock is already in the next year
const year = useRuntimeConfig().public.buildDate.slice(0, 4)
</script>

<template>
  <footer class="site-footer on-ground print">
    <!-- the press: the page's screen in the on-ground ink, 10% in, so the band's text keeps
         5:1 on a dot (the muted line is the floor) -->
    <PressPlate
      class="press"
      :windowed="false"
      ink="color-mix(in srgb, var(--on-ground) 10%, var(--ground))"
    />
    <div class="wrap row">
      <p class="copy">
        <!-- spaces between the parts, so the line's text doesn't read "BastianiMentions" -->
        <span
          >© {{ year }} <span translate="no">{{ contact.name }}</span></span
        >{{ ' '
        }}<span class="legal"
          ><NuxtLink :to="links.legal">Mentions légales</NuxtLink>{{ ' '
          }}<NuxtLink :to="links.privacy">Confidentialité</NuxtLink></span
        >
      </p>
      <ul>
        <li>
          <a :href="links.github"><GithubIcon /><span translate="no">GitHub</span></a>
        </li>
        <li>
          <a :href="links.linkedin"><LinkedinIcon /><span translate="no">LinkedIn</span></a>
        </li>
        <li>
          <a :href="links.malt"><MaltIcon /><span translate="no">Malt</span></a>
        </li>
        <li v-if="props.variant !== 'geek'">
          <NuxtLink :to="links.geek"><GeekIcon />Geek du quartier</NuxtLink>
        </li>
        <li v-else>
          <NuxtLink :to="links.home"><LaptopIcon />Développeur full-stack &amp; DevOps</NuxtLink>
        </li>
        <li>
          <a :href="links.source"><GithubIcon />Code source</a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
/* The page ends on the poster's bottom band: the ground ink with grain, an ink key line on
   top and an inner rule in --on-ground-rule just under it. */
.site-footer {
  padding-block: 2.25rem calc(2.25rem + env(safe-area-inset-bottom, 0px));
  border-top: 1.5px solid var(--ink);
  background: var(--ground);
  color: var(--on-ground-muted);
  box-shadow:
    inset 0 4px 0 var(--ground),
    inset 0 5px 0 var(--on-ground-rule);
  font-size: var(--step--1);
}
.press {
  z-index: -1;
}
.row {
  position: relative;
  z-index: 2; /* above the grain */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
}
.copy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1.25rem;
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.legal {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.25rem;
}
/* a 44 px tall tap target around the small caps, without moving the line */
.legal a {
  padding-block: 0.9rem;
  margin-block: -0.9rem;
}
ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
a {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
}
a:hover {
  color: var(--on-ground);
  text-decoration: underline;
  text-decoration-thickness: 1px;
}
a :deep(.icon) {
  flex: none;
  width: 1rem;
  height: 1rem;
}
</style>
