import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
let metaDefaults: [HTMLMetaElement, string][] = []

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
  // theme-color: in auto the media-specific defaults are right; an explicit choice
  // points them all at the page background.
  const bg = mode.value === 'auto' ? null : getComputedStyle(document.body).backgroundColor
  for (const [m, original] of metaDefaults) m.setAttribute('content', bg ?? original)
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
      metaDefaults = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => [
        m,
        m.getAttribute('content') ?? '',
      ])
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

  function cycle() {
    mode.value = NEXT[mode.value]
    try {
      if (mode.value === 'auto') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, mode.value)
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    apply()
  }

  return { mode, theme, cycle, next: computed(() => NEXT[mode.value]) }
}
