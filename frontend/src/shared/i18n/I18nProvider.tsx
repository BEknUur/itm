import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, makeTranslate } from './context'
import { DICTIONARIES, type Locale } from './dictionaries'

const STORAGE_KEY = 'safestep.locale'

function initialLocale(): Locale {
  const fromUrl = new URLSearchParams(location.search).get('lang')
  if (fromUrl && fromUrl in DICTIONARIES) return fromUrl as Locale
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in DICTIONARIES) return saved as Locale
  } catch {
    // storage blocked (private mode) — fall back to Russian
  }
  return 'ru'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // not critical
    }
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t: makeTranslate(locale) }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
