import { useEffect, useState } from 'react'
import { fetchWarning, HoldTimer, type HoldWarning, type Lang, type Payment } from '@/entities/payment'
import { LanguageSwitcher } from '@/features/select-language'
import { StepUpActions } from '@/features/step-up'
import { useI18n } from '@/shared/i18n'
import { formatMoney } from '@/shared/lib'
import { RequestError } from '@/shared/ui'

type Props = { payment: Payment; onChange: (payment: Payment) => void }

export function HoldScreen({ payment, onChange }: Props) {
  const { t } = useI18n()
  const [lang, setLang] = useState<Lang>()
  const [warning, setWarning] = useState<HoldWarning | null>(null)
  const [failure, setFailure] = useState(false)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    // Clear stale instructions on language/retry changes and ignore late responses.
    fetchWarning(payment.id, lang).then((w) => {
      if (alive) { setWarning(w); setFailure(false); setLoading(false) }
    }, () => {
      if (alive) { setWarning(null); setFailure(true); setLoading(false) }
    })
    return () => {
      alive = false
    }
  }, [payment.id, lang, retry])

  function reloadWarning(nextLanguage?: Lang) {
    setLoading(true)
    setFailure(false)
    setWarning(null)
    if (nextLanguage) setLang(nextLanguage)
    else setRetry(value => value + 1)
  }
  if (failure) return <RequestError message="payment.warningError" onRetry={() => reloadWarning()} />
  if (loading || !warning) return <p className="muted" role="status">{t('common.loading')}</p>

  return (
    <div className="hold stack" lang={warning.language}>
      <LanguageSwitcher value={warning.language} onChange={next => { if (next !== warning.language) reloadWarning(next) }} />
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
