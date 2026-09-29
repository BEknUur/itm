import { useEffect, useState } from 'react'
import { fetchCustomers, type Customer } from '@/entities/customer'
import { fetchPayment, ScoreMeter, SignalChips, type Payment, type PaymentStatus } from '@/entities/payment'
import { TransferForm } from '@/features/confirm-payment'
import { HoldScreen } from '@/widgets/hold-screen'
import { errorText, useI18n } from '@/shared/i18n'
import { formatMoney } from '@/shared/lib'

type Outcome = Exclude<PaymentStatus, 'HELD'>
const OUTCOME_ICON: Record<Outcome, string> = { SENT: '✓', RELEASED: '✓', CANCELLED: '🛡' }

export function MobileBankingPage() {
  const { t } = useI18n()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchCustomers().then(setCustomers, (e: unknown) => setError(errorText(e, t)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // While held, the contact centre may decide on the other screen — pick it up.
  useEffect(() => {
    if (payment?.status !== 'HELD') return
    const id = setInterval(() => fetchPayment(payment.id).then(setPayment, () => {}), 2000)
    return () => clearInterval(id)
  }, [payment?.id, payment?.status])

  const outcome = payment && payment.status !== 'HELD' ? payment.status : null

  return (
    <div className="phone">
      <div className="phone__bar">
        <span>SafeBank</span>
        <span className="muted">{t('phone.transfer')}</span>
      </div>
      <div className="phone__screen">
        {error && <p className="error">{t('common.backendDown', { msg: error })}</p>}
        {!payment && customers.length > 0 && <TransferForm customers={customers} onConfirmed={setPayment} />}
        {payment?.status === 'HELD' && <HoldScreen payment={payment} onChange={setPayment} />}
        {outcome && payment && (
          <div className={`outcome outcome--${payment.status.toLowerCase()} stack`}>
            <span className="outcome__icon" aria-hidden>
              {OUTCOME_ICON[outcome]}
            </span>
            <h2>{t(`outcome.${outcome}.title`)}</h2>
            <p>
              {formatMoney(payment.amount)} → {payment.payee}
            </p>
            <p className="muted">{t(`outcome.${outcome}.text`)}</p>
            <p>
              {t('phone.riskScore')} <ScoreMeter score={payment.score} /> <SignalChips signals={payment.signals} />
            </p>
            <button className="btn" onClick={() => setPayment(null)}>
              {t('phone.newTransfer')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
