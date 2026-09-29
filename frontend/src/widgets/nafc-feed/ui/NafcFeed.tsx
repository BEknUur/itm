import { fetchIncidents } from '@/entities/incident'
import { SignalChips } from '@/entities/payment'
import { useI18n } from '@/shared/i18n'
import { formatMoney, formatTime, usePolling } from '@/shared/lib'

export function NafcFeed() {
  const { t } = useI18n()
  const { data: incidents, error } = usePolling(fetchIncidents, 3000)

  return (
    <section className="card">
      <header className="card__head">
        <h2>{t('nafc.title')}</h2>
        <span className="muted">{t('nafc.subtitle')}</span>
      </header>
      {error && <p className="error">{error}</p>}
      {!incidents?.length ? (
        <p className="muted">{t('nafc.empty')}</p>
      ) : (
        <ul className="feed">
          {incidents.map((i) => (
            <li key={i.id}>
              <div>
                <strong>{formatMoney(i.amount)}</strong> → {i.payee}{' '}
                <span className="muted">
                  · {i.customer_id} · {formatTime(i.created_at)}
                </span>
              </div>
              <SignalChips signals={i.signals} />
              <span className="muted">{i.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
