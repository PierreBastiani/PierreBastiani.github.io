// The latin Hanken Grotesk file every page needs first: preloaded so text doesn't reflow.
import hanken from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url'
import { themeColorFor } from './useTheme'

// Theme before first paint: only an explicit Light/Dark choice is stored (see
// composables/useTheme.ts); with nothing stored the CSS follows the device.
const themeScript = `try{const t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`

// The head every page shares. Called from app.vue and from error.vue: Nuxt renders the error
// page in place of app.vue, so the 404 would otherwise lose the icons, the font preload and
// the theme script.
export function useSiteHead() {
  // Kensae Sans (2 KB) sets the hero's wordmark on every page: preloaded too, so the wordmark is
  // drawn in it from the first paint instead of shifting off its Arial stand-in when the file
  // lands (0.07 of layout shift on the shop page, 2026-11-24). It sits in public/, so its URL
  // takes the site's base (the preview's sub-path) by hand, as Vite does for the CSS url().
  const base = useRuntimeConfig().app.baseURL.replace(/\/?$/, '/')
  useHead({
    link: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'preload', href: hanken, as: 'font', type: 'font/woff2', crossorigin: '' },
      {
        rel: 'preload',
        href: `${base}fonts/kensae-sans.woff2`,
        as: 'font',
        type: 'font/woff2',
        crossorigin: '',
      },
    ],
    // the browser's bar colour per device scheme; it follows an explicit Light/Dark choice once
    // useTheme has read it (composables/useTheme.ts)
    meta: [
      {
        name: 'theme-color',
        content: themeColorFor('light'),
        media: '(prefers-color-scheme: light)',
      },
      {
        name: 'theme-color',
        content: themeColorFor('dark'),
        media: '(prefers-color-scheme: dark)',
      },
    ],
    script: [{ innerHTML: themeScript, tagPriority: 'critical' }],
  })
}
