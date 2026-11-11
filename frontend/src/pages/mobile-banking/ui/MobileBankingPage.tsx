import { useEffect, useState } from 'react'
import { fetchCustomers } from '@/entities/customer'
import { fetchPayment, ScoreMeter, SignalChips, type Payment, type PaymentStatus } from '@/entities/payment'
import { TransferForm } from '@/features/confirm-payment'
import { HoldScreen } from '@/widgets/hold-screen'
import { useI18n } from '@/shared/i18n'
import { ApiError } from '@/shared/api'
import { formatMoney, usePolling } from '@/shared/lib'
import { Icon, RequestError } from '@/shared/ui'

type Outcome = Exclude<PaymentStatus, 'HELD'>
const OUTCOME_ICON: Record<Outcome, string> = { SENT: '✓', RELEASED: '✓', CANCELLED: '◇' }
function savedId(key: string) { try { return sessionStorage.getItem(key) } catch { return null } }

export function MobileBankingPage({ demo = false }: { demo?: boolean }) {
  const { t } = useI18n()
  const storageKey = `safestep.payment.${demo ? 'demo' : 'client'}`
  const { data: customers, error: customerError, reload: reloadCustomers } = usePolling(fetchCustomers, 60000)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [restoreId, setRestoreId] = useState(() => savedId(storageKey))
  const [restoreError, setRestoreError] = useState(false)
  const [stale, setStale] = useState(false)
  const [retry, setRetry] = useState(0)
  const [pollError, setPollError] = useState(false)

  useEffect(() => {
    if (!restoreId) return
    let alive = true
    fetchPayment(restoreId).then(value => {
      if (alive) { setPayment(value); setRestoreId(null); setRestoreError(false) }
    }, error => {
      if (!alive) return
      if (error instanceof ApiError && error.status === 404) {
        try { sessionStorage.removeItem(storageKey) } catch { /* storage is optional */ }
        setStale(true); setRestoreId(null)
      } else setRestoreError(true)
    })
    return () => { alive = false }
  }, [restoreId, retry, storageKey])

  useEffect(() => {
    if (restoreId) return
    try {
      if (payment) sessionStorage.setItem(storageKey, payment.id)
      else sessionStorage.removeItem(storageKey)
    } catch { /* Application still works with storage disabled. */ }
  }, [payment, restoreId, storageKey])

  useEffect(() => {
    if (payment?.status !== 'HELD') return
    let alive = true
    const id = setInterval(() => fetchPayment(payment.id).then(value => {
      if (!alive) return
      setPayment(current => current?.id === value.id && current.status === 'HELD' ? value : current)
      setPollError(false)
    }, () => { if (alive) setPollError(true) }), 2000)
    return () => { alive = false; clearInterval(id) }
  }, [payment?.id, payment?.status])

  const outcome = payment && payment.status !== 'HELD' ? payment.status : null
  return (
    <div className={`phone ${demo ? 'phone--demo' : 'phone--workspace'}`}>
      <div className="phone__bar"><span><Icon name="transfer" />{t('client.transfer')}</span><span className="secure-label"><Icon name="shield" />SafeStep</span></div>
      <div className="phone__screen stack">
        {stale && <p className="muted" role="status">{t('payment.stale')}</p>}
        {pollError && <p className="error" role="alert">{t('common.pollError')}</p>}
        {restoreId ? (restoreError
          ? <RequestError onRetry={() => { setRestoreError(false); setRetry(value => value + 1) }} />
          : <p role="status">{t('payment.restoring')}</p>) : <>
          {!payment && customerError && <RequestError onRetry={() => void reloadCustomers()} />}
          {!payment && !customers && !customerError && <p role="status">{t('common.loading')}</p>}
          {!payment && customers?.length === 0 && <p>{t('client.noCustomers')}</p>}
          {!payment && customers && customers.length > 0 && <TransferForm customers={customers} demo={demo} onConfirmed={value => { setStale(false); setPayment(value) }} />}
          {payment?.status === 'HELD' && <HoldScreen key={payment.id} payment={payment} onChange={value => { setPollError(false); setPayment(value) }} />}
          {outcome && payment && <div className={`outcome outcome--${payment.status.toLowerCase()} stack`}>
            <span className="outcome__icon" aria-hidden>{OUTCOME_ICON[outcome]}</span>
            <h2>{t(`outcome.${outcome}.title`)}</h2>
            <p>{formatMoney(payment.amount)} → {payment.payee}</p>
            <p className="muted">{t(`outcome.${outcome}.text`)}</p>
            <p>{t('phone.riskScore')} <ScoreMeter score={payment.score} /> <SignalChips signals={payment.signals} /></p>
            <p className="muted">{t('payment.demoOutcome')}</p>
            <button className="btn" onClick={() => setPayment(null)}>{t('phone.newTransfer')}</button>
          </div>}
        </>}
      </div>
    </div>
  )
}
