<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import HeroStrata from '@/components/HeroStrata.vue'
import HeroIntro from '@/components/HeroIntro.vue'
import LocalOffer from '@/components/LocalOffer.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import TravelFigure from '@/components/journey/TravelFigure.vue'
import { shopCourse } from '@/lib/shop-course'
import { loadContactPhone, useContact, useContactPhone } from '@/composables/useContact'
import { SITE, ogImageAlt, serviceJsonLd } from '@/lib/seo'

const title = 'Le geek du quartier · Pierre Bastiani, Saint-Paul-de-Vence'
const description =
  'Fiche Google, site, devis et pépins informatiques : j’aide les commerces de La Colle-sur-Loup et Saint-Paul-de-Vence. Demi-journée offerte aux 3 premiers.'
const { email } = useContact()
await loadContactPhone()
const { phoneHref } = useContactPhone()

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogLocale: 'fr_FR',
  ogSiteName: 'Pierre Bastiani',
  ogUrl: `${SITE}/geek-du-quartier/`,
  ogTitle: title,
  ogDescription: description,
  ogImage: `${SITE}/og/og-geek.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: ogImageAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: `${SITE}/og/og-geek.jpg`,
})
useHead({
  link: [{ rel: 'canonical', href: `${SITE}/geek-du-quartier/` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(serviceJsonLd(email, phoneHref.value.replace('tel:', ''))),
    },
  ],
})
</script>

<template>
  <div class="geek-page">
    <a class="skip" href="#main">Aller au contenu</a>
    <SiteHeader variant="geek" />
    <main id="main">
      <!-- the wordmark (see HeroStrata's fit): "Le geek du quartier" on one line, 9.832em wide;
           on phones "Le geek" (3.657em) over "du quartier" (5.950em) -->
      <HeroStrata class="vt-hero" :title="['Le geek', 'du quartier']" :fit="[9.832, 3.657, 5.95]">
        <HeroIntro variant="geek" />
      </HeroStrata>
      <LocalOffer />
    </main>
    <SiteFooter variant="geek" />
    <!-- the desk figure's round of the page: the call button, the plates, the steps, the call -->
    <TravelFigure :course="shopCourse" />
  </div>
</template>

<style scoped>
/* On phones the sticky call bar covers the bottom of the screen: leave room for it so it never
   hides the footer. Scoped to this page: when the main page prefetches this one, its CSS loads
   there too, so nothing here may target body. */
@media (max-width: 40rem) {
  .geek-page {
    padding-bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
<style scoped>
/* Wide screens: the shop's wordmark stands a little higher than the main page's. Its last
   word ends on "IER", and at the 41.5% foot the right-hand hills cover the E's foot bar, so
   it read "QUARTIFR"; at 45.5% every foot clears the hills and the summits stay under it. */
@media (min-width: 40.0625rem) {
  .geek-page :deep(.wordmark) {
    bottom: 45.5%;
  }
  .geek-page :deep(.skyplate) {
    --foot: 45.5%;
  }
}
</style>
