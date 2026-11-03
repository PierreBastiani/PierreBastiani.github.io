import { createHash } from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import type { Plugin } from 'vite'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// Preload the one font file every page needs first (Hanken Grotesk, latin subset), so text
// doesn't reflow when it swaps in. Its name is hashed, so find it in the bundle. (The entry
// script used to be blocking="render" so the cross-page view transition wouldn't capture an
// empty #app; the pages are prerendered now, so the first paint already has the content.)
const fontPreload = (): Plugin => ({
  name: 'font-preload',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      const font = Object.keys(ctx.bundle ?? {}).find((f) =>
        /hanken-grotesk-latin-wght-normal-.*\.woff2$/.test(f),
      )
      if (!font) return html
      return html.replace(
        '<script type="module"',
        `<link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin>\n    <script type="module"`,
      )
    },
  },
})

// Contact details are build-time env, not source (the repository is public): see
// .env.example. The JSON-LD in both index.html files carries __CONTACT_EMAIL__ and
// __CONTACT_TEL__ placeholders (and __BUILD_DATE__ for dateModified); this fills
// them. Same tel: rule as telHref in content.ts.
const contactInHtml = (email: string, phone: string): Plugin => {
  const digits = phone.replace(/[^\d+]/g, '')
  const tel = digits.startsWith('0') ? '+33' + digits.slice(1) : digits
  return {
    name: 'contact-in-html',
    transformIndexHtml: (html) =>
      html
        .replaceAll('__CONTACT_EMAIL__', email)
        .replaceAll('__CONTACT_TEL__', tel)
        .replaceAll('__BUILD_DATE__', new Date().toISOString().slice(0, 10)),
  }
}

// Security headers GitHub Pages can't send, as <meta> in the built pages. The inline
// no-flash theme script is allowed by its sha256, computed from the final HTML; JSON-LD is a
// data block, so script-src doesn't apply to it. style-src needs 'unsafe-inline' for the style
// attributes Vue renders (hero layer positions, the rope's offset). Build only: the dev
// server and devtools inject their own scripts. frame-ancestors can't be set from a meta.
const securityMeta = (): Plugin => ({
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
        (m) => `'sha256-${createHash('sha256').update(m[1]!).digest('base64')}'`,
      )
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
        '<meta charset="UTF-8">',
        `<meta charset="UTF-8">\n    <meta http-equiv="Content-Security-Policy" content="${csp}">\n    <meta name="referrer" content="strict-origin-when-cross-origin">`,
      )
    },
  },
})

// /.well-known/security.txt (RFC 9116), written at build time so the contact address comes
// from the env like everything else and never sits in the repository. Client build only.
const securityTxt = (email: string): Plugin => {
  let ssr = false
  return {
    name: 'security-txt',
    apply: 'build',
    configResolved(config) {
      ssr = !!config.build.ssr
    },
    generateBundle() {
      if (ssr) return
      const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
      this.emitFile({
        type: 'asset',
        fileName: '.well-known/security.txt',
        source:
          `Contact: mailto:${email}\n` +
          `Expires: ${expires}\n` +
          'Preferred-Languages: fr, en\n' +
          'Canonical: https://pierre.kensae.com/.well-known/security.txt\n',
      })
    },
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
    plugins: [
      vue(),
      vueDevTools(),
      fontPreload(),
      contactInHtml(email, phone),
      securityMeta(),
      securityTxt(email),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // Keep the portrait derivatives and the fonts as files: inlined, they'd be base64 in the
      // HTML or CSS, and the CSP only allows fonts from 'self'.
      assetsInlineLimit: (file: string) =>
        file.includes('/assets/portrait/') || /\.woff2?$/.test(file) ? false : undefined,
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
