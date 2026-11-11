import { LANGS, type Lang } from '@/entities/payment'
import { useI18n } from '@/shared/i18n'

type Props = { value: Lang | undefined; onChange: (lang: Lang) => void }

export function LanguageSwitcher({ value, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="langs" role="group" aria-label={t('common.warningLocale')}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={l.code === value ? 'lang lang--active' : 'lang'}
          aria-pressed={l.code === value}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
