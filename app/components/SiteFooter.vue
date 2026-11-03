<script setup lang="ts">
import { contact, links } from '@/content'
import GithubIcon from '@/assets/icons/GithubIcon.vue'
import LinkedinIcon from '@/assets/icons/LinkedinIcon.vue'
import MaltIcon from '@/assets/icons/MaltIcon.vue'
import GeekIcon from '@/assets/icons/GeekIcon.vue'
import LaptopIcon from '@/assets/icons/LaptopIcon.vue'

const props = defineProps<{ variant?: 'main' | 'geek' }>()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="wrap row">
      <p class="copy">© {{ year }} <span translate="no">{{ contact.name }}</span></p>
      <ul>
        <li><a :href="links.github"><GithubIcon /><span translate="no">GitHub</span></a></li>
        <li><a :href="links.linkedin"><LinkedinIcon /><span translate="no">LinkedIn</span></a></li>
        <li><a :href="links.malt"><MaltIcon /><span translate="no">Malt</span></a></li>
        <li v-if="props.variant !== 'geek'"><NuxtLink :to="links.geek"><GeekIcon />Geek du quartier</NuxtLink></li>
        <li v-else><NuxtLink :to="links.home"><LaptopIcon />Développeur full-stack &amp; DevOps</NuxtLink></li>
        <li><a :href="links.source"><GithubIcon />Code source</a></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding-block: 2.5rem calc(2.5rem + env(safe-area-inset-bottom, 0px));
  font-size: var(--step--1);
  color: var(--muted);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
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
  color: var(--accent-text);
}
a :deep(.icon) {
  flex: none;
  width: 1rem;
  height: 1rem;
}
</style>
