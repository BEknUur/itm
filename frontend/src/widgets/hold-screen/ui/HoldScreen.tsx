import { useEffect, useState } from 'react'
import { fetchWarning, HoldTimer, type HoldWarning, type Lang, type Payment } from '@/entities/payment'
import { LanguageSwitcher } from '@/features/select-language'
import { StepUpActions } from '@/features/step-up'
import { useI18n } from '@/shared/i18n'
import { formatMoney } from '@/shared/lib'

type Props = { payment: Payment; onChange: (payment: Payment) => void }

export function HoldScreen({ payment, onChange }: Props) {
  const { t } = useI18n()
  const [lang, setLang] = useState<Lang>()
  const [warning, setWarning] = useState<HoldWarning | null>(null)

  useEffect(() => {
    let alive = true
    fetchWarning(payment.id, lang).then((w) => alive && setWarning(w))
    return () => {
      alive = false
    }
  }, [payment.id, lang])

  if (!warning) return <p className="muted">{t('common.loading')}</p>

  return (
    <div className="hold stack" lang={warning.language}>
      <LanguageSwitcher value={warning.language} onChange={setLang} />
      <div className="hold__head">
        <span className="hold__icon" aria-hidden>
          ⏸
        </span>
        <h2>{warning.title}</h2>
      </div>
      <p className="hold__amount">
        {formatMoney(payment.amount)} → {payment.payee}
      </p>
      <p className="hold__timer">
        <HoldTimer until={payment.hold_until} />
      </p>
      <p>{warning.body}</p>
      {warning.reasons.length > 0 && (
        <ul className="reasons">
          {warning.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <p className="hold__action">{warning.action}</p>
      <StepUpActions
        payment={payment}
        confirmLabel={warning.confirm_label}
        denyLabel={warning.deny_label}
        onDone={onChange}
      />
    </div>
  )
}
