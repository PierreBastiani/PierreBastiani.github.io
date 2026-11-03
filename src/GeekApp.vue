<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import HeroStrata from './components/HeroStrata.vue'
import HeroIntro from './components/HeroIntro.vue'
import LocalOffer from './components/LocalOffer.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <a class="skip" href="#main">Aller au contenu</a>
  <SiteHeader variant="geek" />
  <main id="main">
    <HeroStrata class="vt-hero" :title="['Le geek', 'du quartier']">
      <HeroIntro variant="geek" />
    </HeroStrata>
    <LocalOffer />
  </main>
  <SiteFooter variant="geek" />
</template>
