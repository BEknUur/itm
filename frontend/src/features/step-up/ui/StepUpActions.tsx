import { useState } from 'react'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { Icon } from '@/shared/ui'
import { approveStepUp, denyStepUp } from '../api/stepUp'

type Props = {
  payment: Payment
  confirmLabel: string
  denyLabel: string
  onDone: (payment: Payment) => void
}

export function StepUpActions({ payment, confirmLabel, denyLabel, onDone }: Props) {
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<Payment>) {
    setBusy(true)
    setError(null)
    try {
      onDone(await action())
    } catch (e) {
      setError(errorText(e, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stepup-actions stack">
      <div className="stepup-push-info">
        <div className="stepup-push-info__icon">
          <Icon name="smartphone" />
        </div>
        <p className="stepup-push-info__text">
          {t('stepUp.push', { device: payment.device_id })}
        </p>
      </div>

      <div className="stepup-buttons-grid">
        <button
          type="button"
          className="btn btn--stepup-confirm"
          disabled={busy}
          onClick={() => run(() => approveStepUp(payment.id, payment.device_id))}
        >
          {busy ? <Icon name="refresh" className="spin" /> : <Icon name="check-circle" />}
          <span>{confirmLabel}</span>
        </button>
        <button
          type="button"
          className="btn btn--stepup-deny"
          disabled={busy}
          onClick={() => run(() => denyStepUp(payment.id))}
        >
          {busy ? <Icon name="refresh" className="spin" /> : <Icon name="alert-triangle" />}
          <span>{denyLabel}</span>
        </button>
      </div>

      {error && (
        <div className="error-alert" role="alert">
          <Icon name="alert-triangle" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
