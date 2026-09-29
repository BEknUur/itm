import { Fragment, useState } from 'react'
import { AuditTimeline } from '@/entities/audit'
import { fetchPayments, HoldTimer, ScoreMeter, SignalChips, StatusBadge } from '@/entities/payment'
import { HoldDecisionForm } from '@/features/hold-decision'
import { useI18n } from '@/shared/i18n'
import { formatMoney, formatTime, usePolling } from '@/shared/lib'

export function PaymentsQueue({ agent }: { agent: string }) {
  const { t } = useI18n()
  const { data: payments, error, reload } = usePolling(fetchPayments)
  const [openId, setOpenId] = useState<string | null>(null)
  const [heldOnly, setHeldOnly] = useState(true)

  const rows = (payments ?? []).filter((p) => !heldOnly || p.status === 'HELD')

  return (
    <section className="card">
      <header className="card__head">
        <h2>
          {t('queue.title')}{' '}
          {payments && <span className="count">{payments.filter((p) => p.status === 'HELD').length}</span>}</h2>
        <label className="toggle">
          <input type="checkbox" checked={heldOnly} onChange={(e) => setHeldOnly(e.target.checked)} /> {t('queue.heldOnly')}
        </label>
      </header>
      {error && <p className="error">{error}</p>}
      {rows.length === 0 ? (
        <p className="muted">{t(heldOnly ? 'queue.emptyHeld' : 'queue.empty')}</p>
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
