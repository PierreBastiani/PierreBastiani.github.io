<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import HeroStrata from '@/components/HeroStrata.vue'
import HeroIntro from '@/components/HeroIntro.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import AltitudeRail from '@/components/AltitudeRail.vue'
import TravelFigure from '@/components/journey/TravelFigure.vue'
import { useContact } from '@/composables/useContact'
import { useTextReveal } from '@/composables/useTextReveal'
import { SITE, ogImageAlt, profileJsonLd } from '@/lib/seo'

// the page transition runs under reduced motion too, as a plain cross-fade
// (styles/transitions.css): a still alternative, not a cut
definePageMeta({ viewTransition: 'always' })

const title = 'Pierre Bastiani · Développeur full-stack & DevOps'
const description =
  'Développeur full-stack et DevOps près de Nice. Je reprends des applis (Rails, Node, Python), je les corrige, les fais évoluer et les mets en production.'
const { email } = useContact()
const { buildDate } = useRuntimeConfig().public

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogLocale: 'fr_FR',
  ogSiteName: 'Pierre Bastiani',
  ogUrl: `${SITE}/`,
  ogTitle: title,
  ogDescription: description,
  ogImage: `${SITE}/og/og-main.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: ogImageAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: `${SITE}/og/og-main.jpg`,
})
useHead({
  link: [{ rel: 'canonical', href: `${SITE}/` }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(profileJsonLd(email, buildDate)) },
    // before the first paint: the hero's title and lead come in once on load (styles/main.css)
    {
      key: 'reveal-load',
      tagPosition: 'head',
      innerHTML: "document.documentElement.classList.add('js-reveal-load')",
    },
  ],
})
useTextReveal()
</script>

<template>
  <div class="descent">
    <a class="skip" href="#main">Aller au contenu</a>
    <SiteHeader />
    <main id="main">
      <HeroStrata
        class="vt-hero"
        :title="['Pierre', 'Bastiani']"
        :fit="[7.329, 3.005, 4.099]"
        no-translate
      >
        <HeroIntro variant="main" />
      </HeroStrata>
      <!-- Below the fold, every section is already in the generated HTML. The interactive ones
           load their JS when they scroll into view; recommendations never need it. -->
      <LazyRouteMap hydrate-on-visible />
      <LazyExperienceList hydrate-on-visible />
      <LazyProjectGrid hydrate-on-visible />
      <LazyRecommendationList hydrate-never />
      <LazyContactBlock hydrate-on-visible />
    </main>
    <SiteFooter />
    <AltitudeRail />
    <!-- the desk figure's journey down the page, over everything but the header -->
    <TravelFigure />
  </div>
</template>

<style scoped>
.descent {
  position: relative;
}
</style>
