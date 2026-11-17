import { useState } from 'react'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { Icon } from '@/shared/ui'
import { decideHold, type HoldDecision } from '../api/holdDecision'

type Props = { payment: Payment; agent: string; onDone: () => void }

export function HoldDecisionForm({ payment, agent, onDone }: Props) {
  const { t } = useI18n()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function decide(decision: HoldDecision) {
    if (!reason.trim() || !agent.trim()) {
      setError(t('decision.required'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await decideHold(payment.id, decision, agent.trim(), reason.trim())
      onDone()
    } catch (e) {
      setError(errorText(e, t))
    } finally {
      setBusy(false)
    }
  }

  const defaultRelease = t('decision.defaultRelease')
  const defaultCancel = t('decision.defaultCancel')

  return (
    <div className="operator-decision-panel">
      <div className="operator-decision-panel__top">
        <span className="operator-decision-panel__badge">
          <Icon name="sliders" />
          <span>Operator Decision Workbench</span>
        </span>
        <div className="quick-reason-pills">
          <button
            type="button"
            className="quick-reason-pill quick-reason-pill--release"
            onClick={() => setReason(defaultRelease)}
          >
            + {defaultRelease}
          </button>
          <button
            type="button"
            className="quick-reason-pill quick-reason-pill--cancel"
            onClick={() => setReason(defaultCancel)}
          >
            + {defaultCancel}
          </button>
        </div>
      </div>

      <div className="decision-form-row">
        <label className="decision-form-field">
          <span className="sr-only">{t('decision.reasonLabel')}</span>
          <div className="decision-input-wrap">
            <Icon name="file-text" className="decision-input-icon" />
            <input
              required
              placeholder={t('decision.reason')}
              value={reason}
              className="decision-input"
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </label>

        <div className="decision-buttons">
          <button
            type="button"
            className="btn btn--release-action"
            disabled={busy}
            onClick={() => decide('release')}
          >
            {busy ? <Icon name="refresh" className="spin" /> : <Icon name="check-circle" />}
            <span>{t('decision.release')}</span>
          </button>
          <button
            type="button"
            className="btn btn--cancel-action"
            disabled={busy}
            onClick={() => decide('cancel')}
          >
            {busy ? <Icon name="refresh" className="spin" /> : <Icon name="alert-triangle" />}
            <span>{t('decision.cancel')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert error-alert--compact" role="alert">
          <Icon name="alert-triangle" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
