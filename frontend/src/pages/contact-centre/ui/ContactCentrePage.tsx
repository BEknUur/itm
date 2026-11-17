import { useState } from 'react'
import { auditExportUrl } from '@/entities/audit'
import { fetchPayments } from '@/entities/payment'
import { useI18n } from '@/shared/i18n'
import { usePolling } from '@/shared/lib'
import { Icon } from '@/shared/ui'
import { NafcFeed } from '@/widgets/nafc-feed'
import { PaymentsQueue } from '@/widgets/payments-queue'

export function ContactCentrePage() {
  const { t } = useI18n()
  const [agent, setAgent] = useState('Dana')
  const { data } = usePolling(fetchPayments)

  const total = data?.length ?? 0
  const held = data?.filter((payment) => payment.status === 'HELD').length ?? 0
  const resolved =
    data?.filter((payment) => payment.status === 'RELEASED' || payment.status === 'CANCELLED').length ?? 0

  return (
    <div className="contact-centre-page stack">
      {data && (
        <div className="operator-kpi-grid">
          <div className="operator-kpi-card operator-kpi-card--total">
            <div className="operator-kpi-card__header">
              <span className="operator-kpi-card__label">{t('operator.total')}</span>
              <Icon name="database" className="operator-kpi-card__icon" />
            </div>
            <strong className="operator-kpi-card__val">{total}</strong>
            <span className="operator-kpi-card__desc">Simulated transaction ledger</span>
          </div>

          <div className="operator-kpi-card operator-kpi-card--held">
            <div className="operator-kpi-card__header">
              <span className="operator-kpi-card__label">{t('operator.held')}</span>
              <span className="kpi-pulse-badge">
                <span className="live-pulse" />
                <Icon name="clock" />
              </span>
            </div>
            <strong className="operator-kpi-card__val">{held}</strong>
            <span className="operator-kpi-card__desc">Requires immediate manual verification</span>
          </div>

          <div className="operator-kpi-card operator-kpi-card--resolved">
            <div className="operator-kpi-card__header">
              <span className="operator-kpi-card__label">{t('operator.resolved')}</span>
              <Icon name="check-circle" className="operator-kpi-card__icon" />
            </div>
            <strong className="operator-kpi-card__val">{resolved}</strong>
            <span className="operator-kpi-card__desc">Interventions concluded successfully</span>
          </div>
        </div>
      )}

      <div className="operator-toolbar-card card">
        <div className="operator-identity-group">
          <div className="operator-avatar-badge">
            <Icon name="user" />
            <span className="operator-online-dot" />
          </div>
          <label className="operator-name-field">
            <span className="operator-field-label">{t('centre.agent')}</span>
            <input
              value={agent}
              placeholder="e.g. Dana, Alex..."
              className="operator-name-input"
              onChange={(e) => setAgent(e.target.value)}
            />
          </label>
          <span className="operator-hint-pill">
            <Icon name="info" />
            <span>{t('decision.agentHint')}</span>
          </span>
        </div>

        <a className="btn btn--export-csv" href={auditExportUrl} download>
          <Icon name="download" />
          <span>{t('centre.export')}</span>
        </a>
      </div>

      <PaymentsQueue agent={agent} />
      <NafcFeed />
    </div>
  )
}
