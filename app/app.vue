<script setup lang="ts">
import { useSiteHead } from '@/composables/useSiteHead'
import PressPaper from '@/components/PressPaper.vue'

useSiteHead()
</script>

<template>
  <NuxtPage />
  <!-- the press on the page's ground, under every page's sections -->
  <PressPaper />
</template>
