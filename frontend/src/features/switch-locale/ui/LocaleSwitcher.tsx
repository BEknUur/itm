import { LOCALES, useI18n } from '@/shared/i18n'

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()
  return (
    <div className="langs" role="group" aria-label={t('common.locale')}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={l.code === locale ? 'lang lang--active' : 'lang'}
          aria-pressed={l.code === locale}
          onClick={() => setLocale(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
