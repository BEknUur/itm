import { useI18n } from '@/shared/i18n'
import { formatTime, usePolling } from '@/shared/lib'
import { Icon } from '@/shared/ui'
import { fetchAuditTrail } from '../api/auditApi'

export function AuditTimeline({ paymentId }: { paymentId: string }) {
  const { t } = useI18n()
  const { data: events, error } = usePolling(() => fetchAuditTrail(paymentId), 3000)

  if (error) {
    return (
      <div className="audit-timeline__error">
        <Icon name="alert-triangle" />
        <span>{error}</span>
      </div>
    )
  }
  if (!events) {
    return (
      <div className="audit-timeline__loading">
        <Icon name="refresh" className="spin" />
        <span>{t('audit.loading')}</span>
      </div>
    )
  }
  if (events.length === 0) {
    return <p className="audit-timeline__empty">{t('audit.empty')}</p>
  }

  return (
    <div className="audit-timeline-container">
      <div className="audit-timeline-header">
        <Icon name="file-text" />
        <span>Audit Trail · {events.length} records</span>
      </div>
      <ol className="audit-timeline">
        {events.map((e) => {
          const isSystem = e.actor.toLowerCase().includes('system') || e.actor.toLowerCase().includes('engine')
          const isOperator = !isSystem && e.actor !== 'client'

          return (
            <li key={e.id} className="audit-item">
              <div className="audit-item__marker">
                <span className="audit-item__dot" />
                <span className="audit-item__line" />
              </div>
              <div className="audit-item__card">
                <div className="audit-item__top">
                  <span className="audit-item__action">{e.action}</span>
                  <span
                    className={`audit-item__actor ${
                      isSystem ? 'audit-item__actor--system' : isOperator ? 'audit-item__actor--operator' : 'audit-item__actor--client'
                    }`}
                  >
                    <Icon name={isSystem ? 'zap' : isOperator ? 'user' : 'smartphone'} />
                    {e.actor}
                  </span>
                  <time className="audit-item__time">{formatTime(e.created_at)}</time>
                </div>
                {e.details && Object.keys(e.details).length > 0 && (
                  <pre className="audit-item__code">
                    <code>{JSON.stringify(e.details, null, 2)}</code>
                  </pre>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
