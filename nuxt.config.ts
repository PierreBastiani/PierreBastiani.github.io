import { createHash } from 'node:crypto'

// Static site: `nuxt generate` renders both pages to HTML at build time (SSR on), the client
// hydrates. GitHub Pages serves .output/public.

// Contact details are not in the repository. They come from NUXT_PUBLIC_CONTACT_EMAIL and
// NUXT_CONTACT_PHONE (.env locally, repository secrets in CI) and are baked into the generated
// pages. The phone is a private key: it's read while generating and reaches only the page that
// shows it (through useState, see composables/useContact.ts), never the main page's HTML or JS.
// A build without them stops here rather than ship a page with no way to reach me.
const building = process.argv.some((a) => a === 'generate' || a === 'build')
const missing = ['NUXT_PUBLIC_CONTACT_EMAIL', 'NUXT_CONTACT_PHONE'].filter((k) => !process.env[k]?.trim())
if (building && missing.length) {
  throw new Error(
    `Missing ${missing.join(' and ')}. Set them in .env (see .env.example) or, in CI, from the ` +
      'CONTACT_EMAIL and CONTACT_PHONE secrets. The build stops rather than ship a page without contact details.',
  )
}

// Security headers GitHub Pages can't send, as a <meta> in each generated page. Every inline
// script Nuxt or the head writes (the theme script, Nuxt's config) is allowed by its sha256,
// computed from the final HTML; JSON blocks (payload, JSON-LD) are data, not scripts.
// style-src needs 'unsafe-inline' for the style attributes Vue renders. frame-ancestors can't
// be set from a meta.
function withSecurityMeta(html: string) {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g)]
  const hashes = inline.map((m) => `'sha256-${createHash('sha256').update(m[1]!).digest('base64')}'`)
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')
  return html.replace(
    /<meta charset="utf-8">/i,
    (m) => `${m}<meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="strict-origin-when-cross-origin">`,
  )
}

export default defineNuxtConfig({
  compatibilityDate: '2026-11-03',
  devtools: { enabled: true },
  ssr: true,
  // Component CSS is inlined into each page (Nuxt's default): as files, the first paint waited for
  // three to seven stylesheets, and Lighthouse mobile went 95 → 97 with it inlined. The W3C
  // validator's CSS checker doesn't know container-query units or vector-effect, so it flags the
  // inlined styles; those are gaps in the checker, the HTML itself validates.
  features: { inlineStyles: true },

  css: [
    '@fontsource-variable/hanken-grotesk',
    '@fontsource-variable/geist-mono',
    '~/styles/main.css',
    '~/styles/transitions.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
    },
  },

  runtimeConfig: {
    contactPhone: '',
    public: {
      contactEmail: '',
      // the day the pages were generated, for the JSON-LD dateModified
      buildDate: new Date().toISOString().slice(0, 10),
    },
  },

  experimental: {
    // page-to-page transition inside the app (Nuxt skips it under prefers-reduced-motion)
    viewTransition: true,
    // each page's state (the phone, on the shop page) lives in its own _payload.json, which the
    // client fetches when it navigates there; the main page never carries the phone
    payloadExtraction: true,
    defaults: {
      // /geek-du-quartier/ keeps its trailing slash, as on the flyers and in the sitemap
      nuxtLink: { trailingSlash: 'append' },
    },
  },

  vite: {
    build: {
      // Keep the portrait derivatives and the fonts as files: inlined, they'd be base64 in the
      // HTML or CSS, and the CSP only allows fonts from 'self'.
      assetsInlineLimit: (file: string) =>
        file.includes('/assets/portrait/') || /\.woff2?$/.test(file) ? false : undefined,
    },
  },

  nitro: {
    prerender: {
      routes: ['/', '/geek-du-quartier/', '/.well-known/security.txt'],
      crawlLinks: false,
      autoSubfolderIndex: true,
    },
    hooks: {
      'prerender:generate'(route) {
        if (route.fileName?.endsWith('.html') && typeof route.contents === 'string') {
          // Nuxt adds idle prefetch hints for every asset a chunk references (all nine portrait
          // files, the error pages); none of them is needed before it's shown, so drop them.
          route.contents = withSecurityMeta(route.contents.replace(/<link rel="prefetch"[^>]*>/g, ''))
        }
      },
    },
  },
})
