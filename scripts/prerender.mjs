// Prerender: fill the empty <div id="app"> of each built page with the server-rendered
// markup, so crawlers and no-JS visitors get the content and the client only hydrates.
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.ts`.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render } = await import(`${root}dist-ssr/entry-server.js`)

const pages = { main: 'dist/index.html', geek: 'dist/geek-du-quartier/index.html' }
for (const [page, file] of Object.entries(pages)) {
  const path = root + file
  const html = await readFile(path, 'utf8')
  const marker = '<div id="app"></div>'
  if (!html.includes(marker)) throw new Error(`${file}: no empty #app to fill`)
  const body = await render(page)
  await writeFile(path, html.replace(marker, `<div id="app">${body}</div>`))
  console.log(`prerendered ${file} (${(body.length / 1024).toFixed(1)} kB of markup)`)
}
await rm(root + 'dist-ssr', { recursive: true, force: true })
