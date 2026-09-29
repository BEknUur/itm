import { useState } from 'react'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
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
    <div className="stack">
      <p className="muted">{t('stepUp.push', { device: payment.device_id })}</p>
      <div className="row">
        <button
          className="btn btn--primary"
          disabled={busy}
          onClick={() => run(() => approveStepUp(payment.id, payment.device_id))}
        >
          {confirmLabel}
        </button>
        <button className="btn btn--danger" disabled={busy} onClick={() => run(() => denyStepUp(payment.id))}>
          {denyLabel}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
