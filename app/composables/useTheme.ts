import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

// Three modes: 'auto' follows the device (and switches live when the OS does), 'light' and
// 'dark' are explicit choices. Only an explicit choice is stored; going back to auto clears it.
// The inline script in both index.html files applies a stored choice before first paint.
export type ThemeMode = 'auto' | 'light' | 'dark'

const KEY = 'theme'
const NEXT: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' }

// Module-level so every component shares one state. Starts at 'auto' / 'light' so the
// prerendered HTML and the first client render agree; the real values arrive on mount.
const mode = ref<ThemeMode>('auto')
const systemDark = ref(false)
let users = 0
let media: MediaQueryList | null = null

// The page background of each palette (--bg in styles/main.css), for the browser's theme-color.
const PAGE_BG = { light: '#f4e8dc', dark: '#141e32' } as const

// What the theme-color meta for one colour scheme says: in auto, that scheme's own background;
// after an explicit Light or Dark choice, the chosen palette's background for both schemes.
// useSiteHead puts it in the head, so the head manager keeps it through hydration and page
// changes (written straight into the DOM, it was reset to the defaults).
export function themeColorFor(scheme: 'light' | 'dark') {
  return computed(() => PAGE_BG[mode.value === 'auto' ? scheme : mode.value])
}

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function apply() {
  const root = document.documentElement
  if (mode.value === 'auto') delete root.dataset.theme
  else root.dataset.theme = mode.value
}

const onSystemChange = (e: MediaQueryListEvent) => {
  systemDark.value = e.matches
}

export function useTheme() {
  onMounted(() => {
    if (users++ === 0) {
      media = window.matchMedia('(prefers-color-scheme: dark)')
      systemDark.value = media.matches
      media.addEventListener('change', onSystemChange)
      mode.value = readStored()
      apply()
    }
  })
  onBeforeUnmount(() => {
    if (--users === 0) media?.removeEventListener('change', onSystemChange)
  })

  const theme = computed<'light' | 'dark'>(() =>
    mode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode.value,
  )

  // The switch is one short cross-fade of the whole page (a cut flashes the screen), the same
  // under reduced motion: nothing moves in it. Browsers without view transitions just switch.
  // A second click during the fade skips to its end and starts the next one.
  function cycle() {
    mode.value = NEXT[mode.value]
    try {
      if (mode.value === 'auto') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, mode.value)
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    const root = document.documentElement
    if (!document.startViewTransition) return apply()
    root.classList.add('vt-theme')
    const t = document.startViewTransition(() => {
      apply()
      return nextTick() // the toggle's own icon, so the new snapshot has it
    })
    t.finished.finally(() => root.classList.remove('vt-theme'))
  }

  return { mode, theme, cycle, next: computed(() => NEXT[mode.value]) }
}
