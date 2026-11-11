import { Fragment, useState } from 'react'
import { AuditTimeline } from '@/entities/audit'
import { fetchPayments, HoldTimer, ScoreMeter, SignalChips, StatusBadge } from '@/entities/payment'
import { HoldDecisionForm } from '@/features/hold-decision'
import { useI18n } from '@/shared/i18n'
import { formatMoney, formatTime, usePolling } from '@/shared/lib'
import { RequestError } from '@/shared/ui'
import { filterPayments, type StatusFilter } from '../model/filterPayments'

export function PaymentsQueue({ agent }: { agent: string }) {
  const { t } = useI18n()
  const { data: payments, error, reload } = usePolling(fetchPayments)
  const [openId, setOpenId] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusFilter>('HELD')
  const [query, setQuery] = useState('')

  const rows = filterPayments(payments ?? [], query, status)

  return (
    <section className="card">
      <header className="card__head">
        <h2>
          {t('queue.payments')}{' '}
          {payments && <span className="count">{rows.length}</span>}</h2>
        <span className="muted">{t('queue.scope')}</span>
      </header>
      <div className="queue-filters">
        <label>{t('queue.search')}<input type="search" value={query} placeholder={t('queue.searchHint')} onChange={event => setQuery(event.target.value)} /></label>
        <label>{t('queue.status')}<select aria-label={t('queue.status')} value={status} onChange={event => setStatus(event.target.value as StatusFilter)}>
          <option value="ALL">{t('queue.all')}</option>
          {(['HELD', 'SENT', 'RELEASED', 'CANCELLED'] as const).map(value => <option key={value} value={value}>{t(`status.${value}`)}</option>)}
        </select></label>
        <button className="btn" onClick={() => { setQuery(''); setStatus('ALL') }}>{t('queue.clear')}</button>
      </div>
      {error && <><p className="error">{t('common.pollError')}</p><RequestError onRetry={() => void reload()} /></>}
      {!payments && !error && <p className="muted" role="status">{t('common.loading')}</p>}
      {payments && <p className="queue-count" aria-live="polite">{t('queue.count', { shown: rows.length, total: payments.length })}</p>}
      {payments && rows.length === 0 ? (
        <p className="empty-state">{t(payments.length === 0 ? 'queue.empty' : 'queue.noMatch')}</p>
      ) : (
        <div className="table-wrap">
          <table>
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
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td>{formatTime(p.created_at)}</td>
                    <td>{p.customer_id}</td>
                    <td>{p.payee}</td>
                    <td className="num">{formatMoney(p.amount)}</td>
                    <td>
                      <ScoreMeter score={p.score} />
                    </td>
                    <td>
                      <SignalChips signals={p.signals} />
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{p.status === 'HELD' && <HoldTimer until={p.hold_until} />}</td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                        {t(openId === p.id ? 'queue.hide' : 'queue.audit')}
                      </button>
                    </td>
                  </tr>
                  {p.status === 'HELD' && (
                    <tr className="subrow">
                      <td colSpan={9}>
                        <HoldDecisionForm payment={p} agent={agent} onDone={reload} />
                      </td>
                    </tr>
                  )}
                  {openId === p.id && (
                    <tr className="subrow">
                      <td colSpan={9}>
                        <AuditTimeline paymentId={p.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
