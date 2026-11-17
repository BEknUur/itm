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
function savedId(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

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
    fetchPayment(restoreId).then(
      (value) => {
        if (alive) {
          setPayment(value)
          setRestoreId(null)
          setRestoreError(false)
        }
      },
      (error) => {
        if (!alive) return
        if (error instanceof ApiError && error.status === 404) {
          try {
            sessionStorage.removeItem(storageKey)
          } catch {
            /* storage is optional */
          }
          setStale(true)
          setRestoreId(null)
        } else setRestoreError(true)
      }
    )
    return () => {
      alive = false
    }
  }, [restoreId, retry, storageKey])

  useEffect(() => {
    if (restoreId) return
    try {
      if (payment) sessionStorage.setItem(storageKey, payment.id)
      else sessionStorage.removeItem(storageKey)
    } catch {
      /* Application still works with storage disabled. */
    }
  }, [payment, restoreId, storageKey])

  useEffect(() => {
    if (payment?.status !== 'HELD') return
    let alive = true
    const id = setInterval(
      () =>
        fetchPayment(payment.id).then(
          (value) => {
            if (!alive) return
            setPayment((current) =>
              current?.id === value.id && current.status === 'HELD' ? value : current
            )
            setPollError(false)
          },
          () => {
            if (alive) setPollError(true)
          }
        ),
      2000
    )
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [payment?.id, payment?.status])

  const outcome: Outcome | null = payment && payment.status !== 'HELD' ? payment.status : null

  return (
    <div className={`phone-chassis ${demo ? 'phone-chassis--demo' : 'phone-chassis--workspace'}`}>
      <div className="phone-bezel">
        {/* Dynamic Island & Hardware Speaker */}
        <div className="phone-notch">
          <div className="dynamic-island">
            <span className="dynamic-island__camera" />
            <span className="dynamic-island__sensor" />
            <span className="dynamic-island__indicator" />
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="phone-status-bar">
          <span className="phone-status-time">09:41</span>
          <div className="phone-status-icons">
            <span className="status-cellular">5G</span>
            <span className="status-wifi" aria-label="Wi-Fi">●●●</span>
            <div className="status-battery" aria-label="Battery 100%">
              <div className="battery-level" />
            </div>
          </div>
        </div>

        {/* Bank Header Navigation */}
        <div className="phone__bar">
          <span className="phone-title-group">
            <span className="phone-title-icon">
              <Icon name="transfer" />
            </span>
            <span className="phone-title-text">{t('client.transfer')}</span>
          </span>
          <span className="secure-label">
            <Icon name="shield" />
            <span>SafeStep Pay</span>
          </span>
        </div>

        {/* Inner Screen Viewport */}
        <div className="phone__screen stack">
          {stale && (
            <div className="phone-info-pill" role="status">
              <Icon name="info" />
              <span>{t('payment.stale')}</span>
            </div>
          )}
          {pollError && (
            <div className="phone-error-pill" role="alert">
              <Icon name="alert-triangle" />
              <span>{t('common.pollError')}</span>
            </div>
          )}
          {restoreId ? (
            restoreError ? (
              <RequestError
                onRetry={() => {
                  setRestoreError(false)
                  setRetry((value) => value + 1)
                }}
              />
            ) : (
              <div className="phone-loading-state">
                <Icon name="refresh" className="spin" />
                <p role="status">{t('payment.restoring')}</p>
              </div>
            )
          ) : (
            <>
              {!payment && customerError && <RequestError onRetry={() => void reloadCustomers()} />}
              {!payment && !customers && !customerError && (
                <div className="phone-loading-state">
                  <Icon name="refresh" className="spin" />
                  <p role="status">{t('common.loading')}</p>
                </div>
              )}
              {!payment && customers?.length === 0 && (
                <p className="phone-empty-state">{t('client.noCustomers')}</p>
              )}
              {!payment && customers && customers.length > 0 && (
                <TransferForm
                  customers={customers}
                  demo={demo}
                  onConfirmed={(value) => {
                    setStale(false)
                    setPayment(value)
                  }}
                />
              )}
              {payment?.status === 'HELD' && (
                <HoldScreen
                  key={payment.id}
                  payment={payment}
                  onChange={(value) => {
                    setPollError(false)
                    setPayment(value)
                  }}
                />
              )}
              {outcome && payment && (
                <div className={`outcome-card outcome-card--${payment.status.toLowerCase()} stack`}>
                  <div className="outcome-card__glow" />
                  <div className="outcome-card__emblem">
                    <Icon name={outcome === 'CANCELLED' ? 'alert-triangle' : 'check-circle'} />
                  </div>
                  <h2 className="outcome-card__title">{t(`outcome.${outcome}.title`)}</h2>
                  <div className="outcome-card__details">
                    <span className="outcome-card__amount">{formatMoney(payment.amount)}</span>
                    <span className="outcome-card__arrow">→</span>
                    <span className="outcome-card__payee">{payment.payee}</span>
                  </div>
                  <p className="outcome-card__explanation">{t(`outcome.${outcome}.text`)}</p>

                  <div className="outcome-card__risk-box">
                    <span className="risk-box-label">{t('phone.riskScore')}</span>
                    <ScoreMeter score={payment.score} />
                    <SignalChips signals={payment.signals} />
                  </div>

                  <p className="outcome-card__disclaimer">{t('payment.demoOutcome')}</p>

                  <button
                    type="button"
                    className="btn btn--primary btn--new-transfer"
                    onClick={() => setPayment(null)}
                  >
                    <Icon name="refresh" />
                    <span>{t('phone.newTransfer')}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
