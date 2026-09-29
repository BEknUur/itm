import { useState } from 'react'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { decideHold, type HoldDecision } from '../api/holdDecision'

type Props = { payment: Payment; agent: string; onDone: () => void }

export function HoldDecisionForm({ payment, agent, onDone }: Props) {
  const { t } = useI18n()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function decide(decision: HoldDecision) {
    setBusy(true)
    setError(null)
    try {
      const fallback = t(decision === 'release' ? 'decision.defaultRelease' : 'decision.defaultCancel')
      await decideHold(payment.id, decision, agent || 'agent', reason.trim() || fallback)
      onDone()
    } catch (e) {
      setError(errorText(e, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="decision">
      <input placeholder={t('decision.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
      <button className="btn btn--primary btn--sm" disabled={busy} onClick={() => decide('release')}>
        {t('decision.release')}
      </button>
      <button className="btn btn--danger btn--sm" disabled={busy} onClick={() => decide('cancel')}>
        {t('decision.cancel')}
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  )
}
