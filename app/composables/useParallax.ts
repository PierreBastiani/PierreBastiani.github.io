import { onBeforeUnmount, onMounted, type Ref } from 'vue'

// Writes --scroll (0 → 1 while the element scrolls out) and --px / --py (pointer, -1 → 1)
// on the element. Layers read them with their own --depth. Does nothing with reduced motion.
// While `hold` is true the pointer is ignored, so something the pointer is reaching for
// (the summit figure's card) stays where it is; scroll keeps working.
export function useParallax(el: Ref<HTMLElement | null>, hold?: Ref<boolean>) {
  let frame = 0
  let px = 0
  let py = 0

  function paint() {
    frame = 0
    const node = el.value
    if (!node) return
    const r = node.getBoundingClientRect()
    const scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
    node.style.setProperty('--scroll', scroll.toFixed(4))
    node.style.setProperty('--px', px.toFixed(4))
    node.style.setProperty('--py', py.toFixed(4))
  }
  function request() {
    if (!frame) frame = requestAnimationFrame(paint)
  }
  function onPointer(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || hold?.value) return
    px = (e.clientX / window.innerWidth - 0.5) * 2
    py = (e.clientY / window.innerHeight - 0.5) * 2
    request()
  }

  onMounted(() => {
    // read here, not at setup, so the page can be prerendered without a window
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    request()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', request)
    window.removeEventListener('pointermove', onPointer)
    cancelAnimationFrame(frame)
  })
}
