<script setup lang="ts">
// The latin Hanken Grotesk file every page needs first: preloaded so text doesn't reflow.
import hanken from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url'

// Theme before first paint: only an explicit Light/Dark choice is stored (see
// composables/useTheme.ts); with nothing stored the CSS follows the device.
const themeScript = `try{const t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`

useHead({
  link: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'preload', href: hanken, as: 'font', type: 'font/woff2', crossorigin: '' },
  ],
  meta: [
    { name: 'theme-color', content: '#f4e8dc', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#141e32', media: '(prefers-color-scheme: dark)' },
  ],
  script: [{ innerHTML: themeScript, tagPriority: 'critical' }],
})
</script>

<template>
  <NuxtPage />
</template>
