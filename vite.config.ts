import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import type { Plugin } from 'vite'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// Vite drops unknown attributes when it rewrites the entry <script> on build. Put back
// blocking="render" so a cross-page view transition captures the mounted app, not an empty #app.
const renderBlockingEntry = (): Plugin => ({
  name: 'render-blocking-entry',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      // Preload the one font file every page needs first (Hanken Grotesk, latin subset), so
      // text doesn't reflow when it swaps in. Its name is hashed, so find it in the bundle.
      const font = Object.keys(ctx.bundle ?? {}).find((f) =>
        /hanken-grotesk-latin-wght-normal-.*\.woff2$/.test(f),
      )
      const preload = font
        ? `<link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin>\n    `
        : ''
      return html
        .replace(
          /<script type="module" crossorigin src=/g,
          '<script type="module" blocking="render" crossorigin src=',
        )
        .replace('<script type="module"', `${preload}<script type="module"`)
    },
  },
})

// Contact details are build-time env, not source (the repository is public): see
// .env.example. The JSON-LD in both index.html files carries __CONTACT_EMAIL__ and
// __CONTACT_TEL__ placeholders; this fills them. Same tel: rule as telHref in content.ts.
const contactInHtml = (email: string, phone: string): Plugin => {
  const digits = phone.replace(/[^\d+]/g, '')
  const tel = digits.startsWith('0') ? '+33' + digits.slice(1) : digits
  return {
    name: 'contact-in-html',
    transformIndexHtml: (html) =>
      html.replaceAll('__CONTACT_EMAIL__', email).replaceAll('__CONTACT_TEL__', tel),
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const missing = ['VITE_CONTACT_EMAIL', 'VITE_CONTACT_PHONE'].filter((k) => !env[k]?.trim())
  if (missing.length && command === 'build') {
    throw new Error(
      `Missing ${missing.join(' and ')}. Set them in .env.local (see .env.example) or, in CI, ` +
        'from the CONTACT_EMAIL and CONTACT_PHONE secrets. The build stops rather than ship a page without contact details.',
    )
  }
  const email = env.VITE_CONTACT_EMAIL || 'VITE_CONTACT_EMAIL-manquant@example.invalid'
  const phone = env.VITE_CONTACT_PHONE || '00 00 00 00 00'

  return {
    plugins: [vue(), vueDevTools(), renderBlockingEntry(), contactInHtml(email, phone)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // Two static pages: the professional site, and the local-shop page the flyers point to.
      rollupOptions: {
        input: {
          main: page('./index.html'),
          geek: page('./geek-du-quartier/index.html'),
        },
      },
    },
  }
})
