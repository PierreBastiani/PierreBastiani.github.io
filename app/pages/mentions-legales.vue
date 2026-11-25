<script setup lang="ts">
// The legal page (mentions légales + données personnelles). All its text is in
// app/content/legal.json, written by the legal-page generator (`legal.py render`) from
// templates/legal/: never edit the wording here or in the JSON, change templates/legal/.
// This file only renders it, with the site's header, footer, share tags and styles.
//
// A row with `from` is filled here from runtime config, so no .env value is in the repo:
//   address  NUXT_LEGAL_ADDRESS, private runtime config (loadLegalAddress, composables/useContact.ts)
//   phone    NUXT_CONTACT_PHONE, private runtime config (loadContactPhone)
//   email    NUXT_PUBLIC_CONTACT_EMAIL (useContact)
// The address and the phone are generated into this page and its payload, never into the other
// pages. noindex: the page carries the business address, which is a home address for now.
// `notranslate` rows (names, addresses, phone, email) get translate="no", so a browser's
// translation leaves them as they are; legal.py writes the flag only for a page that reads
// `row.notranslate`. The email link after `b.mailTo` carries it here.
// A `from` row the config leaves empty prints page.unknown, which is French to translate.
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import {
  loadContactPhone,
  loadLegalAddress,
  useContact,
  useContactPhone,
} from '@/composables/useContact'
import page from '~/content/legal.json'
import { SITE, ogImageAlt } from '@/lib/seo'

type Row = {
  label: string
  value?: string
  from?: string
  href?: string
  list?: string[]
  notranslate?: boolean
}
type Block = {
  title: string
  text: string[]
  mailTo?: string
  after?: string
  link?: { label: string; href: string }
}
type Section = { id: string; title: string; rows?: Row[]; intro?: string; blocks?: Block[] }

const { email } = useContact()
const mailto = `mailto:${email}`
await loadContactPhone()
const { data: address } = await loadLegalAddress()
const { phone, phoneHref } = useContactPhone()

function fromConfig(from: string): { value: string; href?: string } {
  if (from === 'address') return { value: address.value ?? '' }
  if (from === 'phone') return { value: phone.value, href: phoneHref.value }
  if (from === 'email') return { value: email, href: mailto }
  return { value: '' }
}
function shown(row: Row) {
  const r = row.from ? fromConfig(row.from) : { value: row.value ?? '', href: row.href }
  return r.value ? r : { value: page.unknown }
}
function translateAttr(row: Row) {
  return row.notranslate && shown(row).value !== page.unknown ? 'no' : undefined
}

const title = 'Mentions légales et confidentialité · Pierre Bastiani'
const description = page.description
// a shared link still gets a card: the main page's image, nothing from the page's private rows
useSeoMeta({
  title,
  description,
  robots: 'noindex',
  ogType: 'website',
  ogLocale: 'fr_FR',
  ogSiteName: 'Pierre Bastiani',
  ogUrl: `${SITE}/mentions-legales/`,
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
useHead({ link: [{ rel: 'canonical', href: `${SITE}/mentions-legales/` }] })
</script>

<template>
  <div class="legal-page">
    <a class="skip" href="#main">Aller au contenu</a>
    <SiteHeader variant="geek" />
    <main id="main">
      <section class="section" aria-labelledby="legal-title">
        <div class="wrap">
          <header class="section-head">
            <p class="eyebrow">Mentions légales</p>
            <h1 id="legal-title">
              {{ page.title }}
              <span class="quiet">{{ page.quiet }}</span>
            </h1>
          </header>

          <div class="blocks">
            <section
              v-for="s in page.sections as Section[]"
              :id="s.id"
              :key="s.id"
              :aria-labelledby="`${s.id}-title`"
            >
              <h2 :id="`${s.id}-title`">{{ s.title }}</h2>
              <dl v-if="s.rows">
                <div v-for="row in s.rows" :key="row.label">
                  <dt>{{ row.label }}</dt>
                  <dd :translate="translateAttr(row)">
                    <ul v-if="row.list">
                      <li v-for="x in row.list" :key="x">{{ x }}</li>
                    </ul>
                    <a v-else-if="shown(row).href" :href="shown(row).href">{{
                      shown(row).value
                    }}</a>
                    <template v-else>{{ shown(row).value }}</template>
                  </dd>
                </div>
              </dl>
              <p v-if="s.intro" class="note">{{ s.intro }}</p>
              <div v-for="b in s.blocks ?? []" :key="b.title" class="prose">
                <h3>{{ b.title }}</h3>
                <p v-for="t in b.text" :key="t">{{ t }}</p>
                <p v-if="b.mailTo">
                  {{ b.mailTo }} <a :href="mailto" translate="no">{{ email }}</a
                  >.
                </p>
                <p v-if="b.after">{{ b.after }}</p>
                <p v-if="b.link">
                  <a :href="b.link.href">{{ b.link.label }}</a>
                </p>
              </div>
            </section>

            <p class="note">{{ page.updated }}</p>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.blocks {
  display: grid;
  gap: var(--space-head);
  max-width: 52rem;
}
.blocks > section {
  display: grid;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1.5px solid var(--ink);
}
h1 {
  font-size: var(--step-h2);
  font-weight: 650;
  line-height: 1.04;
  letter-spacing: -0.03em;
}
h2 {
  font-size: var(--step-2);
}
h3 {
  margin-bottom: 0.4rem;
}
dl {
  display: grid;
  gap: 0.6rem;
  margin: 0;
}
dl > div {
  display: grid;
  grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
  gap: 0.25rem 1.5rem;
}
dt {
  padding-top: 0.2em;
  color: var(--muted);
  font: 500 0.72rem / 1.5 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
dd ul {
  margin: 0;
  padding-left: 1.1em;
}
.prose {
  display: grid;
  gap: 0.6rem;
  max-width: 62ch;
}
.prose + .prose {
  margin-top: 0.75rem;
}
.note {
  color: var(--muted);
}
@media (max-width: 40rem) {
  dl > div {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
