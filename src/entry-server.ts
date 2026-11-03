// Build-time render of both pages to static HTML (see scripts/prerender.mjs).
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import GeekApp from './GeekApp.vue'

const pages: Record<string, Component> = { main: App, geek: GeekApp }

export function render(page: keyof typeof pages) {
  return renderToString(createSSRApp(pages[page]!))
}
