import { LANGS, type Lang } from '@/entities/payment'

type Props = { value: Lang | undefined; onChange: (lang: Lang) => void }

export function LanguageSwitcher({ value, onChange }: Props) {
  return (
    <div className="langs" role="group" aria-label="Warning language">
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
