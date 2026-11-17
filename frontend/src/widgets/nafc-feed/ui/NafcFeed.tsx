import { fetchIncidents } from '@/entities/incident'
import { SignalChips } from '@/entities/payment'
import { useI18n } from '@/shared/i18n'
import { formatMoney, formatTime, usePolling } from '@/shared/lib'
import { Icon } from '@/shared/ui'

export function NafcFeed() {
  const { t } = useI18n()
  const { data: incidents, error } = usePolling(fetchIncidents, 3000)

  return (
    <section className="card nafc-card">
      <header className="card__head nafc-card__head">
        <div className="nafc-card__title-group">
          <span className="nafc-card__badge">
            <span className="live-pulse" />
            <Icon name="database" />
          </span>
          <div>
            <h2>{t('nafc.title')}</h2>
            <span className="muted nafc-card__subtitle">{t('nafc.subtitle')}</span>
          </div>
        </div>
        <span className="nafc-card__telemetry-tag">
          <Icon name="activity" />
          {incidents ? `${incidents.length} events logged` : 'Syncing...'}
        </span>
      </header>
      {error && (
        <div className="error-banner">
          <Icon name="alert-triangle" />
          <span>{error}</span>
        </div>
      )}
      {!incidents?.length ? (
        <div className="empty-state">
          <Icon name="shield" className="empty-state__icon" />
          <p>{t('nafc.empty')}</p>
        </div>
      ) : (
        <div className="nafc-feed-list">
          {incidents.map((i) => (
            <article key={i.id} className="nafc-feed-item">
              <div className="nafc-feed-item__header">
                <div className="nafc-feed-item__money-group">
                  <span className="nafc-feed-item__amount">{formatMoney(i.amount)}</span>
                  <span className="nafc-feed-item__arrow">→</span>
                  <span className="nafc-feed-item__payee">{i.payee}</span>
                </div>
                <time className="nafc-feed-item__time">{formatTime(i.created_at)}</time>
              </div>

              <div className="nafc-feed-item__meta">
                <span className="nafc-feed-item__customer">
                  <Icon name="user" />
                  {i.customer_id}
                </span>
                {i.reason && (
                  <span className="nafc-feed-item__reason">
                    <Icon name="alert-triangle" />
                    {i.reason}
                  </span>
                )}
              </div>

              <div className="nafc-feed-item__signals">
                <SignalChips signals={i.signals} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
