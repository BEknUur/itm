import { useEffect, useState, type FormEvent } from 'react'
import { http } from '@/shared/api'
import { useI18n } from '@/shared/i18n'
import { Icon, RequestError } from '@/shared/ui'

type Daily = { date: string; total: number; held: number; released: number; cancelled: number }
type Analytics = { start_date: string; end_date: string; total_payments: number; held_payments: number; current_held: number; released_payments: number; cancelled_payments: number; cancelled_amount: number; average_resolution_seconds: number | null; daily: Daily[] }
function initialRange() { const end = new Date(); const start = new Date(); start.setUTCDate(start.getUTCDate() - 6); return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) } }

export function AnalyticsPage() {
  const { t, locale } = useI18n()
  const [draft, setDraft] = useState(initialRange)
  const [range, setRange] = useState(initialRange)
  const [data, setData] = useState<Analytics | null>(null)
  const [failed, setFailed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let alive = true
    http<Analytics>(`/agent/analytics?start_date=${range.from}&end_date=${range.to}`).then(value => { if (alive) { setData(value); setFailed(false) } }, () => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [range, retry])
  function submit(event: FormEvent) {
    event.preventDefault()
    const days = (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000 + 1
    if (!Number.isFinite(days) || days < 1 || days > 366) { setInvalid(true); return }
    setInvalid(false); setFailed(false); setData(null); setRange({ ...draft })
  }
  const number = (value: number) => new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { maximumFractionDigits: 2 }).format(value)
  const metrics = data ? [
    ['analytics.total', number(data.total_payments)], ['analytics.held', number(data.held_payments)], ['analytics.current', number(data.current_held)], ['analytics.released', number(data.released_payments)], ['analytics.cancelled', number(data.cancelled_payments)], ['analytics.amount', number(data.cancelled_amount)],
  ] as const : []
  const max = Math.max(1, ...data?.daily.map(day => day.total) ?? [])
  return <div className="stack analytics-page">
    <div className="page-heading"><span className="eyebrow">SAFE STEP / ANALYTICS</span><h1>{t('analytics.title')}</h1><p>{t('analytics.intro')}</p></div>
    <form className="card date-filters" onSubmit={submit}><label>{t('analytics.from')}<input type="date" required value={draft.from} onChange={event => setDraft(value => ({ ...value, from: event.target.value }))} /></label><label>{t('analytics.to')}<input type="date" required value={draft.to} onChange={event => setDraft(value => ({ ...value, to: event.target.value }))} /></label><button className="btn btn--primary">{t('analytics.apply')}<Icon name="arrow" /></button>{invalid && <p className="error" role="alert">{t('analytics.invalid')}</p>}</form>
    <p className="muted">{t('analytics.scope')}</p>
    {failed ? <RequestError onRetry={() => { setFailed(false); setData(null); setRetry(value => value + 1) }} /> : !data ? <p role="status">{t('common.loading')}</p> : <>
      <div className="metrics-grid">{metrics.map(([key, value]) => <article className="metric card" key={key}><span className="muted">{t(key)}</span><strong>{value}</strong></article>)}</div>
      <p className="muted">{t('analytics.heldHint')}</p>
      <p className="analytics-caution"><Icon name="shield" />{t('analytics.caution')}</p>
      {data.total_payments === 0 && <p className="empty-state">{t('analytics.empty')}</p>}
      <section className="card"><header className="card__head"><h2>{t('analytics.chart')}</h2><span className="muted">{t('analytics.period', { start: data.start_date, end: data.end_date })}</span></header><p className="muted">{t('analytics.chartAlt')}</p><div className="bar-chart" role="img" aria-label={t('analytics.chartAlt')}>{data.daily.map(day => <div className="bar-column" key={day.date}><span>{day.total}</span><div className="bar-track"><div style={{ height: `${day.total / max * 100}%` }} /></div><small>{day.date.slice(5)}</small></div>)}</div></section>
      <section className="card"><h2>{t('analytics.resolution')}</h2><p className="resolution-number">{data.average_resolution_seconds === null ? t('analytics.noResolution') : t('analytics.seconds', { value: number(data.average_resolution_seconds) })}</p><details><summary>{t('analytics.details')}</summary><div className="table-wrap"><table><thead><tr><th>{t('analytics.date')}</th><th>{t('analytics.total')}</th><th>{t('analytics.held')}</th><th>{t('analytics.released')}</th><th>{t('analytics.cancelled')}</th></tr></thead><tbody>{data.daily.map(day => <tr key={day.date}><td>{day.date}</td><td>{day.total}</td><td>{day.held}</td><td>{day.released}</td><td>{day.cancelled}</td></tr>)}</tbody></table></div></details></section>
    </>}
  </div>
}
