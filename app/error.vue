<script setup lang="ts">
import type { NuxtError } from '#app'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useSiteHead } from '@/composables/useSiteHead'
import { links } from '@/content'

// The error page, in place of Nuxt's default English one. `nuxt generate` server-renders it
// as 404.html (experimental.prerenderErrorPages), which GitHub Pages serves for any unknown
// path. It never shows the requested path: the prerendered HTML can't know it, and the client
// would then disagree with it on hydration.
const props = defineProps<{ error: NuxtError }>()
const status = computed(() => props.error.status ?? props.error.statusCode ?? 500)
const missing = computed(() => status.value === 404)
const copy = computed(() =>
  missing.value
    ? {
        title: 'Cette page n’existe pas.',
        quiet: 'Vérifiez l’adresse, ou repartez d’une des deux pages du site',
      }
    : {
        title: 'Cette page n’a pas pu s’afficher.',
        quiet: 'Rechargez-la, ou repartez d’une des deux pages du site.',
      },
)

useSiteHead()
useHead({
  title: () =>
    missing.value
      ? 'Page introuvable · Pierre Bastiani'
      : `Erreur ${status.value} · Pierre Bastiani`,
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div class="error-page">
    <a class="skip" href="#main">Aller au contenu</a>
    <!-- the shop page's header: the name and the switch both lead home, no section tabs -->
    <SiteHeader variant="geek" />
    <main id="main">
      <section class="section" aria-labelledby="error-title">
        <div class="wrap">
          <header class="section-head">
            <p class="eyebrow">Erreur {{ status }}</p>
            <h1 id="error-title">
              {{ copy.title }}
              <span class="quiet">{{ copy.quiet }}</span>
            </h1>
          </header>
          <div class="btns">
            <NuxtLink class="btn btn-primary" :to="links.home"
              >Développeur full-stack &amp; DevOps</NuxtLink
            >
            <NuxtLink class="btn" :to="links.geek">Le geek du quartier</NuxtLink>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
/* The footer sits at the bottom of the screen even though the page is short. */
.error-page {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}
main {
  flex: 1;
  padding-bottom: var(--space-section);
}
/* the h1 is set as the other pages' section titles */
h1 {
  font-size: var(--step-h2);
  font-weight: 650;
  line-height: 1.04;
  letter-spacing: -0.03em;
}
</style>
