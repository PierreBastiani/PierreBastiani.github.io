// /sitemap.xml, prerendered at generate time: every page's lastmod is the day the site was
// generated (runtimeConfig.public.buildDate, the same date as the JSON-LD dateModified), so it
// can't go stale the way a hand-written file did.
// /mentions-legales/ stays out: it is noindex (app/pages/mentions-legales.vue), and a sitemap
// lists only pages meant for the index.
const PAGES = ['/', '/geek-du-quartier/']

export default defineEventHandler((event) => {
  const { buildDate } = useRuntimeConfig(event).public
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PAGES.map(
      (p) =>
        `  <url>\n    <loc>https://pierre.kensae.com${p}</loc>\n    <lastmod>${buildDate}</lastmod>\n  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')
})
