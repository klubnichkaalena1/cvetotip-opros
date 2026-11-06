export type ColorTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function readStoredTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function applyTheme(theme: ColorTheme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}
