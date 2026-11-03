<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import HeroStrata from '@/components/HeroStrata.vue'
import HeroIntro from '@/components/HeroIntro.vue'
import LocalOffer from '@/components/LocalOffer.vue'
import SiteFooter from '@/components/SiteFooter.vue'
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
      <HeroStrata class="vt-hero" :title="['Le geek', 'du quartier']">
        <HeroIntro variant="geek" />
      </HeroStrata>
      <LocalOffer />
    </main>
    <SiteFooter variant="geek" />
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
