import { useState, type FormEvent } from 'react'
import type { Customer } from '@/entities/customer'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { Icon, type IconName } from '@/shared/ui'
import { confirmPayment, type ConfirmPaymentInput } from '../api/confirmPayment'
import { SCENARIOS, UNKNOWN_DEVICE } from '../model/scenarios'

type Props = { customers: Customer[]; onConfirmed: (payment: Payment) => void; demo?: boolean }

const SCENARIO_ICONS: Record<string, IconName> = {
  routine: 'check-circle',
  fakeCall: 'phone',
  takeover: 'alert-triangle',
  genuine: 'zap',
}

const AMOUNT_PRESETS = [10_000, 50_000, 200_000, 1_500_000]

export function TransferForm({ customers, onConfirmed, demo = false }: Props) {
  const { t } = useI18n()
  const [form, setForm] = useState<ConfirmPaymentInput>(() =>
    demo
      ? SCENARIOS[0].input
      : {
          customer_id: customers[0].id,
          payee: customers[0].known_payees[0] ?? '',
          amount: 20_000,
          device_id: customers[0].trusted_devices[0] ?? '',
          failed_otp: 0,
        }
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const customer = customers.find((c) => c.id === form.customer_id)
  const devices = [...(customer?.trusted_devices ?? []), UNKNOWN_DEVICE]
  const set = <K extends keyof ConfirmPaymentInput>(key: K, value: ConfirmPaymentInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onConfirmed(await confirmPayment(form))
    } catch (err) {
      setError(errorText(err, t))
    } finally {
      setBusy(false)
    }
  }

  const isTrustedDevice = form.device_id && form.device_id !== UNKNOWN_DEVICE

  return (
    <form className="transfer-form stack" onSubmit={submit}>
      {demo && (
        <div className="scenarios-wrapper">
          <span className="scenarios-label">
            <Icon name="sliders" />
            <span>Preset Attack &amp; Routine Vectors</span>
          </span>
          <div className="scenarios-grid">
            {SCENARIOS.map((s) => {
              const active = form.customer_id === s.input.customer_id &&
                form.payee === s.input.payee &&
                form.amount === s.input.amount &&
                form.device_id === s.input.device_id

              return (
                <button
                  type="button"
                  key={s.id}
                  className={`scenario-card ${active ? 'scenario-card--active' : ''}`}
                  title={t(`scenario.${s.id}.hint`)}
                  onClick={() => setForm(s.input)}
                >
                  <div className="scenario-card__header">
                    <span className="scenario-card__icon">
                      <Icon name={SCENARIO_ICONS[s.id] ?? 'sparkles'} />
                    </span>
                    <strong className="scenario-card__title">{t(`scenario.${s.id}.title`)}</strong>
                  </div>
                  <p className="scenario-card__hint">{t(`scenario.${s.id}.hint`)}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="form-card">
        <label className="form-field">
          <span className="form-field__label">
            <Icon name="user" />
            {t('client.profile')}
          </span>
          <div className="input-with-icon">
            <select
              aria-label={t('client.profile')}
              value={form.customer_id}
              className="custom-select"
              onChange={(e) => {
                const next = customers.find((c) => c.id === e.target.value)
                setForm((f) => ({
                  ...f,
                  customer_id: e.target.value,
                  device_id: next?.trusted_devices[0] ?? UNKNOWN_DEVICE,
                  ...(!demo ? { payee: next?.known_payees[0] ?? '', failed_otp: 0 } : {}),
                }))
              }}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>
        </label>

        {demo && (
          <label className="form-field">
            <span className="form-field__label">
              <Icon name="smartphone" />
              {t('form.device')}
            </span>
            <div className="input-with-icon">
              <select
                aria-label={t('form.device')}
                value={form.device_id}
                className="custom-select"
                onChange={(e) => set('device_id', e.target.value)}
              >
                {devices.map((d) => (
                  <option key={d} value={d}>
                    {d === UNKNOWN_DEVICE ? `⚠️ ${d} (${t('form.notTrusted')})` : `🛡️ ${d}`}
                  </option>
                ))}
              </select>
            </div>
            <span className={`device-status-badge ${isTrustedDevice ? 'device-status-badge--trusted' : 'device-status-badge--untrusted'}`}>
              <Icon name={isTrustedDevice ? 'shield' : 'alert-triangle'} />
              {isTrustedDevice ? 'Hardware Biometrics & Enclave Bound' : 'Unknown Hardware Fingerprint'}
            </span>
          </label>
        )}

        <label className="form-field">
          <span className="form-field__label">
            <Icon name="transfer" />
            {t('form.payee')}
          </span>
          <div className="input-with-action">
            <input
              list={demo ? 'demo-known-payees' : 'known-payees'}
              value={form.payee}
              placeholder="e.g. KZ12 Mother, UZ88 Dealer..."
              className="custom-input"
              onChange={(e) => set('payee', e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <datalist id={demo ? 'demo-known-payees' : 'known-payees'}>
            {customer?.known_payees.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {customer?.known_payees && customer.known_payees.length > 0 && (
            <div className="quick-payees">
              <span className="quick-payees__hint">Known:</span>
              {customer.known_payees.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`quick-payee-pill ${form.payee === p ? 'quick-payee-pill--active' : ''}`}
                  onClick={() => set('payee', p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </label>

        <div className="amount-section">
          <label className="form-field">
            <span className="form-field__label">
              <Icon name="sparkles" />
              {t('client.currency')}
            </span>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₸</span>
              <input
                type="number"
                min={1}
                value={form.amount}
                className="amount-input"
                onChange={(e) => set('amount', Number(e.target.value))}
                required
              />
            </div>
          </label>

          <div className="amount-presets">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                className={`amount-preset-btn ${form.amount === preset ? 'amount-preset-btn--active' : ''}`}
                onClick={() => set('amount', preset)}
              >
                {new Intl.NumberFormat('ru-RU').format(preset)} ₸
              </button>
            ))}
          </div>

          {demo && (
            <label className="form-field otp-field">
              <span className="form-field__label">
                <Icon name="alert-triangle" />
                {t('form.failedOtp')}
              </span>
              <div className="failed-otp-wrapper">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={form.failed_otp}
                  className="custom-input custom-input--compact"
                  onChange={(e) => set('failed_otp', Number(e.target.value))}
                />
                <span className="failed-otp-hint">Simulate consecutive OTP failures before transfer</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {!demo && (
        <div className="security-notice-banner">
          <Icon name="shield" />
          <span>{t('client.trusted')}</span>
        </div>
      )}

      {error && (
        <div className="error-alert" role="alert">
          <Icon name="alert-triangle" />
          <span>{error}</span>
        </div>
      )}

      <button className="btn btn--primary btn--hero-submit" disabled={busy}>
        {busy ? (
          <>
            <Icon name="refresh" className="spin" />
            <span>{t('form.scoring')}</span>
          </>
        ) : (
          <>
            <span>{t('form.submit')}</span>
            <Icon name="arrow" />
          </>
        )}
      </button>
    </form>
  )
}
