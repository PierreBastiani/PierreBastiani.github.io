<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import HeroStrata from './components/HeroStrata.vue'
import HeroIntro from './components/HeroIntro.vue'
import RouteMap from './components/RouteMap.vue'
import ExperienceList from './components/ExperienceList.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import RecommendationList from './components/RecommendationList.vue'
import ContactBlock from './components/ContactBlock.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
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
</template>
