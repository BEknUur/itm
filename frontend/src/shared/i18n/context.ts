import { createContext, useContext } from 'react'
import { ApiError } from '@/shared/api'
import { DICTIONARIES, type Key, type Locale } from './dictionaries'

export type Translate = (key: Key, vars?: Record<string, string | number>) => string

export function makeTranslate(locale: Locale): Translate {
  const dict = DICTIONARIES[locale]
  return (key, vars) =>
    (dict[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? `{${name}}`))
}

type I18n = { locale: Locale; setLocale: (locale: Locale) => void; t: Translate }

export const I18nContext = createContext<I18n>({
  locale: 'ru',
  setLocale: () => {},
  t: makeTranslate('ru'),
})

export const useI18n = () => useContext(I18nContext)

/** Known API errors get a localized text; anything else shows the server message. */
export function errorText(e: unknown, t: Translate): string {
  if (e instanceof ApiError && [403, 404, 409, 423].includes(e.status)) {
    return t(`error.${e.status}` as Key)
  }
  return e instanceof Error ? e.message : String(e)
}
