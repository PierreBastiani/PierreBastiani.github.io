import { onBeforeUnmount, onMounted } from 'vue'
import { journey } from '@/lib/journey'

// Text appears once: a section's title, then the line under it, fade in and rise 0.5em (at
// most 1.5rem) the first time they enter the screen, and then stay still. Nothing is tied to
// the scroll position and nothing plays back on the way up. The main page only.
//
// The hero's title (a word at a time, 35 ms apart) and its lead come in on first load, in CSS
// (styles/main.css): an inline script in the page's head sets html.js-reveal-load before the
// first paint, so they never flash in their final state and then hide. This composable takes
// the class off once they have landed, so a later visit through the page transition finds
// them still.
//
// Section heads below the first screen get their hidden start state from here, as a
// data-reveal attribute (not a class: the lazily hydrated sections own their classes), and
// only once a script runs: with no JS, in print or for a crawler, every text is there. Under
// reduced motion the CSS gives no start state at all. A header link that lands on a section
// shows its text already revealed.

const BLOCKS = '.section-head h2, .section-head .sub'
const FOLLOW = 80 // ms: the line under a title starts this much after it

export function useTextReveal() {
  let io: IntersectionObserver | null = null
  let late = 0
  let loadDone = 0
  const root = () => document.documentElement

  function show(el: Element, now = false) {
    io?.unobserve(el)
    const h = el as HTMLElement
    if (h.dataset.reveal !== 'wait') return
    h.dataset.reveal = now ? 'now' : 'in'
  }
  function showSection(id: string) {
    if (!id) return
    const target = document.getElementById(decodeURIComponent(id))
    target?.querySelectorAll(BLOCKS).forEach((el) => show(el, true))
  }
  function onClick(e: MouseEvent) {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (a) showSection(a.hash.slice(1))
  }
  const onHash = () => showSection(location.hash.slice(1))

  // blocks below the fold get the start state and wait for the screen
  function scan() {
    for (const el of document.querySelectorAll<HTMLElement>(`main ${BLOCKS}`)) {
      if (el.dataset.reveal) continue
      if (el.getBoundingClientRect().top < innerHeight) {
        el.dataset.reveal = 'here' // on screen already: left as it is
        continue
      }
      el.dataset.reveal = 'wait'
      if (el.matches('.sub')) el.style.setProperty('--reveal-delay', `${FOLLOW}ms`)
      el.addEventListener('transitionend', journey.remeasure, { once: true })
      io!.observe(el)
    }
    onHash()
  }

  onMounted(() => {
    // the hero's load-time entrance: take its class off once the lead has landed
    const lead = document.querySelector('#top .intro .lead')
    const endLoad = () => {
      clearTimeout(loadDone)
      root().classList.remove('js-reveal-load')
      journey.remeasure()
    }
    if (root().classList.contains('js-reveal-load')) {
      lead?.addEventListener('animationend', endLoad, { once: true })
      loadDone = window.setTimeout(endLoad, 1500)
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target)
      },
      { threshold: 0.15 },
    )
    root().classList.add('js-reveal')
    scan()
    // sections that render a moment later (a client-side visit) are picked up once more
    late = window.setTimeout(scan, 600)
    document.addEventListener('click', onClick)
    addEventListener('hashchange', onHash)
  })
  onBeforeUnmount(() => {
    clearTimeout(late)
    clearTimeout(loadDone)
    io?.disconnect()
    document.removeEventListener('click', onClick)
    removeEventListener('hashchange', onHash)
    root().classList.remove('js-reveal', 'js-reveal-load')
    for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]'))
      delete el.dataset.reveal
  })
}
