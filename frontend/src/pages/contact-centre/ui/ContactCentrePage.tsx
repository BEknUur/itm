import { useState } from 'react'
import { auditExportUrl } from '@/entities/audit'
import { useI18n } from '@/shared/i18n'
import { NafcFeed } from '@/widgets/nafc-feed'
import { PaymentsQueue } from '@/widgets/payments-queue'
import { fetchPayments } from '@/entities/payment'
import { usePolling } from '@/shared/lib'

export function ContactCentrePage() {
  const { t } = useI18n()
  const [agent, setAgent] = useState('Dana')
  const { data } = usePolling(fetchPayments)

  return (
    <div className="stack">
      {data && <div className="operator-metrics">
        <div><span>{t('operator.total')}</span><strong>{data.length}</strong></div>
        <div><span>{t('operator.held')}</span><strong>{data.filter(payment => payment.status === 'HELD').length}</strong></div>
        <div><span>{t('operator.resolved')}</span><strong>{data.filter(payment => payment.status === 'RELEASED' || payment.status === 'CANCELLED').length}</strong></div>
      </div>}
      <div className="toolbar card">
        <label className="inline">
          {t('centre.agent')}
          <input value={agent} onChange={(e) => setAgent(e.target.value)} />
        </label>
        <a className="btn btn--ghost" href={auditExportUrl} download>
          {t('centre.export')}
        </a>
      </div>
      <p className="muted">{t('decision.agentHint')}</p>
      <PaymentsQueue agent={agent} />
      <NafcFeed />
    </div>
  )
}
