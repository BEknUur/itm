import { useI18n } from '@/shared/i18n'
import { formatTime, usePolling } from '@/shared/lib'
import { fetchAuditTrail } from '../api/auditApi'

export function AuditTimeline({ paymentId }: { paymentId: string }) {
  const { t } = useI18n()
  const { data: events, error } = usePolling(() => fetchAuditTrail(paymentId), 3000)

  if (error) return <p className="error">{error}</p>
  if (!events) return <p className="muted">{t('audit.loading')}</p>

  return (
    <ol className="timeline">
      {events.map((e) => (
        <li key={e.id}>
          <time>{formatTime(e.created_at)}</time>
          <strong>{e.action}</strong>
          <span className="muted">{e.actor}</span>
          <code>{JSON.stringify(e.details)}</code>
        </li>
      ))}
    </ol>
  )
}
