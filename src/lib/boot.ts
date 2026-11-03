import { createApp, createSSRApp, type Component } from 'vue'

// Built pages arrive prerendered (scripts/prerender.mjs), so the client hydrates that markup.
// In dev, #app is empty and the app mounts normally.
export function boot(root: Component) {
  const el = document.getElementById('app')!
  const app = el.hasChildNodes() ? createSSRApp(root) : createApp(root)
  app.mount(el)
}
