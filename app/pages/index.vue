<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import HeroStrata from '@/components/HeroStrata.vue'
import HeroIntro from '@/components/HeroIntro.vue'
import RouteMap from '@/components/RouteMap.vue'
import ExperienceList from '@/components/ExperienceList.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import RecommendationList from '@/components/RecommendationList.vue'
import ContactBlock from '@/components/ContactBlock.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useContact } from '@/composables/useContact'
import { SITE, ogImageAlt, profileJsonLd } from '@/lib/seo'

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
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(profileJsonLd(email, buildDate)) }],
})
</script>

<template>
  <div>
    <a class="skip" href="#main">Aller au contenu</a>
    <SiteHeader />
    <main id="main">
      <HeroStrata class="vt-hero" :title="['Pierre', 'Bastiani']" no-translate>
        <HeroIntro variant="main" />
      </HeroStrata>
      <RouteMap />
      <ExperienceList />
      <ProjectGrid />
      <RecommendationList />
      <ContactBlock />
    </main>
    <SiteFooter />
  </div>
</template>
