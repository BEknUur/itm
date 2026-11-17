import { useEffect, useState } from 'react'
import { fetchWarning, HoldTimer, type HoldWarning, type Lang, type Payment } from '@/entities/payment'
import { LanguageSwitcher } from '@/features/select-language'
import { StepUpActions } from '@/features/step-up'
import { useI18n } from '@/shared/i18n'
import { formatMoney } from '@/shared/lib'
import { Icon, RequestError } from '@/shared/ui'

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
    fetchWarning(payment.id, lang).then(
      (w) => {
        if (alive) {
          setWarning(w)
          setFailure(false)
          setLoading(false)
        }
      },
      () => {
        if (alive) {
          setWarning(null)
          setFailure(true)
          setLoading(false)
        }
      }
    )
    return () => {
      alive = false
    }
  }, [payment.id, lang, retry])

  function reloadWarning(nextLanguage?: Lang) {
    setLoading(true)
    setFailure(false)
    setWarning(null)
    if (nextLanguage) setLang(nextLanguage)
    else setRetry((value) => value + 1)
  }

  if (failure) return <RequestError message="payment.warningError" onRetry={() => reloadWarning()} />
  if (loading || !warning) {
    return (
      <div className="hold-loading-state">
        <Icon name="refresh" className="spin" />
        <p className="muted" role="status">
          {t('common.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="hold-container" lang={warning.language}>
      <div className="hold-topbar">
        <div className="hold-status-pill">
          <span className="hold-status-pill__beacon" />
          <span>PAUSE ACTIVE · RISK INTERVENTION</span>
        </div>
        <LanguageSwitcher
          value={warning.language}
          onChange={(next) => {
            if (next !== warning.language) reloadWarning(next)
          }}
        />
      </div>

      <div className="hold-hero-alert">
        <div className="hold-alert-emblem">
          <Icon name="shield" />
          <span className="hold-alert-emblem__subicon">⏸</span>
        </div>
        <div className="hold-hero-text">
          <h2>{warning.title}</h2>
          <div className="hold-amount-badge">
            <span className="hold-amount-badge__num">{formatMoney(payment.amount)}</span>
            <span className="hold-amount-badge__arrow">→</span>
            <span className="hold-amount-badge__payee">{payment.payee}</span>
          </div>
        </div>
      </div>

      <div className="hold-timer-section">
        <div className="hold-timer-box">
          <span className="hold-timer-label">Decision Window Remaining</span>
          <HoldTimer until={payment.hold_until} />
        </div>
      </div>

      <div className="hold-body-card">
        <p className="hold-body-lead">{warning.body}</p>

        {warning.reasons.length > 0 && (
          <div className="hold-reasons-block">
            <span className="hold-reasons-label">Detected Trigger Signals:</span>
            <ul className="reasons-list">
              {warning.reasons.map((r, i) => (
                <li key={r}>
                  <span className="reason-bullet">{i + 1}</span>
                  <span className="reason-text">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="hold-action-guidance">
          <Icon name="info" />
          <p>{warning.action}</p>
        </div>
      </div>

      <StepUpActions
        payment={payment}
        confirmLabel={warning.confirm_label}
        denyLabel={warning.deny_label}
        onDone={onChange}
      />
    </div>
  )
}
