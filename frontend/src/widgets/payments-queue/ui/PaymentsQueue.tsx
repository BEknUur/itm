import { Fragment, useState } from 'react'
import { AuditTimeline } from '@/entities/audit'
import { fetchPayments, HoldTimer, ScoreMeter, SignalChips, StatusBadge } from '@/entities/payment'
import { HoldDecisionForm } from '@/features/hold-decision'
import { useI18n } from '@/shared/i18n'
import { formatMoney, formatTime, usePolling } from '@/shared/lib'
import { Icon, RequestError } from '@/shared/ui'
import { filterPayments, type StatusFilter } from '../model/filterPayments'

export function PaymentsQueue({ agent }: { agent: string }) {
  const { t } = useI18n()
  const { data: payments, error, reload } = usePolling(fetchPayments)
  const [openId, setOpenId] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusFilter>('HELD')
  const [query, setQuery] = useState('')

  const rows = filterPayments(payments ?? [], query, status)

  const heldCount = payments?.filter((p) => p.status === 'HELD').length ?? 0

  return (
    <section className="card queue-card">
      <header className="queue-card__header">
        <div className="queue-card__title-area">
          <div className="queue-card__icon-wrapper">
            <Icon name="transfer" />
          </div>
          <div>
            <div className="queue-card__title-row">
              <h2>{t('queue.payments')}</h2>
              {payments && (
                <span className="queue-counter-badge">
                  {rows.length} {rows.length === 1 ? 'record' : 'records'}
                </span>
              )}
            </div>
            <p className="muted queue-card__subtitle">{t('queue.scope')}</p>
          </div>
        </div>

        <div className="queue-status-quick-pills">
          <button
            type="button"
            className={`status-pill-tab ${status === 'HELD' ? 'status-pill-tab--active' : ''}`}
            onClick={() => setStatus('HELD')}
          >
            <span className="status-pill-tab__dot status-pill-tab__dot--held" />
            <span>{t('status.HELD')}</span>
            <span className="status-pill-tab__count">{heldCount}</span>
          </button>
          <button
            type="button"
            className={`status-pill-tab ${status === 'ALL' ? 'status-pill-tab--active' : ''}`}
            onClick={() => setStatus('ALL')}
          >
            <span>{t('queue.all')}</span>
            <span className="status-pill-tab__count">{payments?.length ?? 0}</span>
          </button>
        </div>
      </header>

      <div className="queue-filters-bar">
        <div className="search-input-box">
          <Icon name="search" className="search-input-icon" />
          <input
            type="search"
            value={query}
            placeholder={t('queue.searchHint')}
            className="queue-search-input"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              aria-label={t('queue.clear')}
              onClick={() => setQuery('')}
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        <div className="queue-select-group">
          <label className="queue-select-label">
            <span className="sr-only">{t('queue.status')}</span>
            <select
              aria-label={t('queue.status')}
              value={status}
              className="queue-status-select"
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="ALL">{t('queue.all')}</option>
              {(['HELD', 'SENT', 'RELEASED', 'CANCELLED'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`status.${value}`)}
                </option>
              ))}
            </select>
          </label>

          {(query || status !== 'ALL') && (
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--reset-filters"
              onClick={() => {
                setQuery('')
                setStatus('ALL')
              }}
            >
              <Icon name="refresh" />
              <span>{t('queue.clear')}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="queue-error-wrap">
          <p className="error">{t('common.pollError')}</p>
          <RequestError onRetry={() => void reload()} />
        </div>
      )}

      {!payments && !error && (
        <div className="queue-loading-state">
          <Icon name="refresh" className="spin" />
          <p className="muted" role="status">
            {t('common.loading')}
          </p>
        </div>
      )}

      {payments && (
        <div className="queue-table-meta">
          <span className="queue-count" aria-live="polite">
            {t('queue.count', { shown: rows.length, total: payments.length })}
          </span>
        </div>
      )}

      {payments && rows.length === 0 ? (
        <div className="empty-state queue-empty-state">
          <Icon name="search" className="empty-state__icon" />
          <p>{t(payments.length === 0 ? 'queue.empty' : 'queue.noMatch')}</p>
        </div>
      ) : (
        <div className="table-wrap custom-scrollbar">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('queue.col.time')}</th>
                <th>{t('queue.col.customer')}</th>
                <th>{t('queue.col.payee')}</th>
                <th className="num">{t('queue.col.amount')}</th>
                <th>{t('queue.col.score')}</th>
                <th>{t('queue.col.signals')}</th>
                <th>{t('queue.col.status')}</th>
                <th>{t('queue.col.hold')}</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isHeld = p.status === 'HELD'
                const isExpanded = openId === p.id

                return (
                  <Fragment key={p.id}>
                    <tr className={`table-row ${isHeld ? 'table-row--held' : ''} ${isExpanded ? 'table-row--expanded' : ''}`}>
                      <td className="cell-time">
                        <time>{formatTime(p.created_at)}</time>
                      </td>
                      <td className="cell-customer">
                        <div className="customer-cell">
                          <span className="customer-avatar">
                            {p.customer_id.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="customer-id">{p.customer_id}</span>
                        </div>
                      </td>
                      <td className="cell-payee">
                        <span className="payee-tag">{p.payee}</span>
                      </td>
                      <td className="num cell-amount">
                        <span className="amount-val">{formatMoney(p.amount)}</span>
                      </td>
                      <td className="cell-score">
                        <ScoreMeter score={p.score} />
                      </td>
                      <td className="cell-signals">
                        <SignalChips signals={p.signals} />
                      </td>
                      <td className="cell-status">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="cell-hold">
                        {p.status === 'HELD' ? <HoldTimer until={p.hold_until} /> : <span className="text-dim">—</span>}
                      </td>
                      <td className="text-right cell-actions">
                        <button
                          type="button"
                          className={`btn btn--ghost btn--sm btn--audit ${isExpanded ? 'btn--audit-active' : ''}`}
                          onClick={() => setOpenId(openId === p.id ? null : p.id)}
                        >
                          <Icon name="file-text" />
                          <span>{t(openId === p.id ? 'queue.hide' : 'queue.audit')}</span>
                        </button>
                      </td>
                    </tr>

                    {p.status === 'HELD' && (
                      <tr className="subrow subrow--decision">
                        <td colSpan={9}>
                          <HoldDecisionForm payment={p} agent={agent} onDone={reload} />
                        </td>
                      </tr>
                    )}

                    {openId === p.id && (
                      <tr className="subrow subrow--audit">
                        <td colSpan={9}>
                          <AuditTimeline paymentId={p.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
