export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'safestep_theme'
export const DEFAULT_THEME: Theme = 'dark'

/** Minimal storage contract so the logic can be tested without a browser. */
export interface ThemeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Even reading `localStorage` can throw (e.g. blocked storage), so access it defensively. */
export function browserStorage(): ThemeStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const isTheme =(value: unknown): value is Theme => value === 'dark' || value === 'light'

/** Saved theme if it is valid; otherwise the default. Storage errors never break the app. */
export function readSavedTheme(storage: ThemeStorage | undefined): Theme {
  try {
    const saved = storage?.getItem(THEME_STORAGE_KEY)
    if (isTheme(saved)) return saved
  } catch {
    /* storage optional */
  }
  return DEFAULT_THEME
}

export function saveTheme(storage: ThemeStorage | undefined, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage optional */
  }
}

export const nextTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark')

/** Toggle button shows the icon and label of the mode it switches to. */
export const themeToggleIcon = (theme: Theme) => (theme === 'dark' ? 'sun' : 'moon')
export const themeToggleLabel = (theme: Theme) => `Switch to ${nextTheme(theme)} mode`
