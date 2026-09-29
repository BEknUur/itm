import { useState, type FormEvent } from 'react'
import type { Customer } from '@/entities/customer'
import type { Payment } from '@/entities/payment'
import { errorText, useI18n } from '@/shared/i18n'
import { confirmPayment, type ConfirmPaymentInput } from '../api/confirmPayment'
import { SCENARIOS, UNKNOWN_DEVICE } from '../model/scenarios'

type Props = { customers: Customer[]; onConfirmed: (payment: Payment) => void }

export function TransferForm({ customers, onConfirmed }: Props) {
  const { t } = useI18n()
  const [form, setForm] = useState<ConfirmPaymentInput>(SCENARIOS[0].input)
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
      <div className="scenarios">
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
      </div>

      <label>
        {t('form.customer')}
        <select
          value={form.customer_id}
          onChange={(e) => {
            const next = customers.find((c) => c.id === e.target.value)
            setForm((f) => ({ ...f, customer_id: e.target.value, device_id: next?.trusted_devices[0] ?? UNKNOWN_DEVICE }))
          }}
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t('form.device')}
        <select value={form.device_id} onChange={(e) => set('device_id', e.target.value)}>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d === UNKNOWN_DEVICE ? `${d} (${t('form.notTrusted')})` : d}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t('form.payee')}
        <input list="known-payees" value={form.payee} onChange={(e) => set('payee', e.target.value)} required />
        <datalist id="known-payees">
          {customer?.known_payees.map((p) => <option key={p} value={p} />)}
        </datalist>
      </label>

      <div className="row">
        <label>
          {t('form.amount')}
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => set('amount', Number(e.target.value))}
            required
          />
        </label>
        <label>
          {t('form.failedOtp')}
          <input
            type="number"
            min={0}
            value={form.failed_otp}
            onChange={(e) => set('failed_otp', Number(e.target.value))}
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" disabled={busy}>
        {busy ? t('form.scoring') : t('form.submit')}
      </button>
    </form>
  )
}
