import { useState, type FormEvent } from 'react'
import type { Customer } from '@/entities/customer'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { Icon } from '@/shared/ui'
import { confirmPayment, type ConfirmPaymentInput } from '../api/confirmPayment'
import { SCENARIOS, UNKNOWN_DEVICE } from '../model/scenarios'

type Props = { customers: Customer[]; onConfirmed: (payment: Payment) => void; demo?: boolean }

export function TransferForm({ customers, onConfirmed, demo = false }: Props) {
  const { t } = useI18n()
  const [form, setForm] = useState<ConfirmPaymentInput>(() => demo ? SCENARIOS[0].input : {
    customer_id: customers[0].id,
    payee: customers[0].known_payees[0] ?? '',
    amount: 20_000,
    device_id: customers[0].trusted_devices[0] ?? '',
    failed_otp: 0,
  })
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

  return (
    <form className="stack" onSubmit={submit}>
      {demo && <div className="scenarios">
        {SCENARIOS.map((s) => (
          <button
            type="button"
            key={s.id}
            className="scenario"
            title={t(`scenario.${s.id}.hint`)}
            onClick={() => setForm(s.input)}
          >
            {t(`scenario.${s.id}.title`)}
          </button>
        ))}
      </div>}

      <label>
        {t('client.profile')}
        <select
          aria-label={t('client.profile')}
          value={form.customer_id}
          onChange={(e) => {
            const next = customers.find((c) => c.id === e.target.value)
            setForm((f) => ({ ...f, customer_id: e.target.value, device_id: next?.trusted_devices[0] ?? UNKNOWN_DEVICE, ...(!demo ? { payee: next?.known_payees[0] ?? '', failed_otp: 0 } : {}) }))
          }}
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {demo && <label>
        {t('form.device')}
        <select aria-label={t('form.device')} value={form.device_id} onChange={(e) => set('device_id', e.target.value)}>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d === UNKNOWN_DEVICE ? `${d} (${t('form.notTrusted')})` : d}
            </option>
          ))}
        </select>
      </label>}

      <label>
        {t('form.payee')}
        <input list={demo ? 'demo-known-payees' : 'known-payees'} value={form.payee} onChange={(e) => set('payee', e.target.value)} required maxLength={200} />
        <datalist id={demo ? 'demo-known-payees' : 'known-payees'}>
          {customer?.known_payees.map((p) => <option key={p} value={p} />)}
        </datalist>
      </label>

      <div className="row">
        <label>
          {t('client.currency')}
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => set('amount', Number(e.target.value))}
            required
          />
        </label>
        {demo && <label>
          {t('form.failedOtp')}
          <input
            type="number"
            min={0}
            value={form.failed_otp}
            onChange={(e) => set('failed_otp', Number(e.target.value))}
          />
        </label>}
      </div>

      {!demo && <p className="form-note"><Icon name="lock" />{t('client.trusted')}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn--primary" disabled={busy}>
        {busy ? t('form.scoring') : t('form.submit')}
        <Icon name="arrow" />
      </button>
    </form>
  )
}
