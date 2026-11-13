<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import {
  loadContactPhone,
  loadLegalAddress,
  useContact,
  useContactPhone,
} from '@/composables/useContact'
import { legal, type LegalRow } from '@/content'
import { SITE, ogImageAlt } from '@/lib/seo'

// Legal notice (LCEN) and privacy section. The address and the phone are private runtime config
// (see nuxt.config.ts): generated into this page and its payload, never into the other pages.
// noindex: the page carries the business address, which is a home address for now.
const { email } = useContact()
await loadContactPhone()
const { data: address } = await loadLegalAddress()
const { phone, phoneHref } = useContactPhone()

const title = 'Mentions légales et confidentialité · Pierre Bastiani'
const description = 'Éditeur, hébergeur et données personnelles du site pierre.kensae.com.'
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

function shown(row: LegalRow) {
  if (row.from === 'address') return { value: address.value ?? '' }
  if (row.from === 'email') return { value: email, href: `mailto:${email}` }
  if (row.from === 'phone') return { value: phone.value, href: phoneHref.value }
  return { value: row.value ?? '', href: row.href }
}
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
              {{ legal.title }}
              <span class="quiet">{{ legal.quiet }}</span>
            </h1>
          </header>

          <div class="blocks">
            <section aria-labelledby="editeur">
              <h2 id="editeur">{{ legal.publisher.title }}</h2>
              <dl>
                <div v-for="row in legal.publisher.rows" :key="row.label">
                  <dt>{{ row.label }}</dt>
                  <dd>
                    <a v-if="shown(row).href" :href="shown(row).href">{{ shown(row).value }}</a>
                    <template v-else>{{ shown(row).value }}</template>
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="hebergeur">
              <h2 id="hebergeur">{{ legal.host.title }}</h2>
              <dl>
                <div v-for="row in legal.host.rows" :key="row.label">
                  <dt>{{ row.label }}</dt>
                  <dd>
                    <a v-if="row.href" :href="row.href">{{ row.value }}</a>
                    <template v-else>{{ row.value }}</template>
                  </dd>
                </div>
              </dl>
            </section>

            <section id="confidentialite" aria-labelledby="confidentialite-title">
              <h2 id="confidentialite-title">{{ legal.privacy.title }}</h2>
              <p class="note">{{ legal.privacy.intro }}</p>
              <div v-for="block in legal.privacy.blocks" :key="block.title" class="prose">
                <h3>{{ block.title }}</h3>
                <p v-for="(line, i) in block.text" :key="i">{{ line }}</p>
                <p v-if="block.mailTo">
                  {{ block.mailTo }} <a :href="`mailto:${email}`">{{ email }}</a
                  >.
                </p>
                <p v-if="block.after">{{ block.after }}</p>
                <p v-if="block.link">
                  <a :href="block.link.href">{{ block.link.label }}</a>
                </p>
              </div>
            </section>

            <section aria-labelledby="credits">
              <h2 id="credits">{{ legal.credits.title }}</h2>
              <dl>
                <div v-for="row in legal.credits.rows" :key="row.label">
                  <dt>{{ row.label }}</dt>
                  <dd>
                    <a v-if="row.href" :href="row.href">{{ row.value }}</a>
                    <template v-else>{{ row.value }}</template>
                  </dd>
                </div>
              </dl>
            </section>

            <p class="note">{{ legal.updated }}</p>
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
  font-weight: 650;
  letter-spacing: -0.02em;
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
