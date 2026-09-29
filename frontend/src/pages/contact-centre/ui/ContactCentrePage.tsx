import { useState } from 'react'
import { auditExportUrl } from '@/entities/audit'
import { useI18n } from '@/shared/i18n'
import { NafcFeed } from '@/widgets/nafc-feed'
import { PaymentsQueue } from '@/widgets/payments-queue'

export function ContactCentrePage() {
  const { t } = useI18n()
  const [agent, setAgent] = useState('Dana')

  return (
    <div className="stack">
      <div className="toolbar">
        <label className="inline">
          {t('centre.agent')}
          <input value={agent} onChange={(e) => setAgent(e.target.value)} />
        </label>
        <a className="btn btn--ghost" href={auditExportUrl} download>
          {t('centre.export')}
        </a>
      </div>
      <PaymentsQueue agent={agent} />
      <NafcFeed />
    </div>
  )
}
