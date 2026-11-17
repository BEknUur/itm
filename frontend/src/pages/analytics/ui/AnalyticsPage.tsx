import { useEffect, useState, type FormEvent } from 'react'
import { http } from '@/shared/api'
import { useI18n, type Key } from '@/shared/i18n'
import { Icon, RequestError, type IconName } from '@/shared/ui'

type Daily = { date: string; total: number; held: number; released: number; cancelled: number }
type Analytics = {
  start_date: string
  end_date: string
  total_payments: number
  held_payments: number
  current_held: number
  released_payments: number
  cancelled_payments: number
  cancelled_amount: number
  average_resolution_seconds: number | null
  daily: Daily[]
}

function getPresetRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setUTCDate(start.getUTCDate() - (days - 1))
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  }
}

const METRIC_ICONS: Record<string, IconName> = {
  'analytics.total': 'database',
  'analytics.held': 'clock',
  'analytics.current': 'alert-triangle',
  'analytics.released': 'check-circle',
  'analytics.cancelled': 'shield',
  'analytics.amount': 'zap',
}

export function AnalyticsPage() {
  const { t, locale } = useI18n()
  const [draft, setDraft] = useState(() => getPresetRange(7))
  const [range, setRange] = useState(() => getPresetRange(7))
  const [data, setData] = useState<Analytics | null>(null)
  const [failed, setFailed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let alive = true
    http<Analytics>(`/agent/analytics?start_date=${range.from}&end_date=${range.to}`).then(
      (value) => {
        if (alive) {
          setData(value)
          setFailed(false)
        }
      },
      () => {
        if (alive) setFailed(true)
      }
    )
    return () => {
      alive = false
    }
  }, [range, retry])

  function submit(event: FormEvent) {
    event.preventDefault()
    applyRange(draft.from, draft.to)
  }

  function applyRange(from: string, to: string) {
    const days = (Date.parse(to) - Date.parse(from)) / 86400000 + 1
    if (!Number.isFinite(days) || days < 1 || days > 366) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setFailed(false)
    setData(null)
    setRange({ from, to })
    setDraft({ from, to })
  }

  function handlePreset(days: number) {
    const next = getPresetRange(days)
    applyRange(next.from, next.to)
  }

  const number = (value: number) =>
    new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { maximumFractionDigits: 2 }).format(value)

  const metrics = data
    ? [
        { key: 'analytics.total', value: number(data.total_payments), color: 'neutral' },
        { key: 'analytics.held', value: number(data.held_payments), color: 'warn' },
        { key: 'analytics.current', value: number(data.current_held), color: 'alert' },
        { key: 'analytics.released', value: number(data.released_payments), color: 'success' },
        { key: 'analytics.cancelled', value: number(data.cancelled_payments), color: 'danger' },
        { key: 'analytics.amount', value: `${number(data.cancelled_amount)} ₸`, color: 'brand' },
      ]
    : []

  const max = Math.max(1, ...(data?.daily.map((day) => day.total) ?? []))

  return (
    <div className="stack analytics-page">
      <div className="page-heading">
        <span className="eyebrow">SAFE STEP / EXECUTIVE INTELLIGENCE</span>
        <h1>{t('analytics.title')}</h1>
        <p>{t('analytics.intro')}</p>
      </div>

      <div className="card analytics-filter-card">
        <form className="date-filters-form" onSubmit={submit}>
          <div className="date-fields-group">
            <label className="date-field">
              <span className="date-field__label">
                <Icon name="calendar" />
                {t('analytics.from')}
              </span>
              <input
                type="date"
                required
                value={draft.from}
                className="date-input"
                onChange={(event) => setDraft((value) => ({ ...value, from: event.target.value }))}
              />
            </label>
            <span className="date-arrow">→</span>
            <label className="date-field">
              <span className="date-field__label">
                <Icon name="calendar" />
                {t('analytics.to')}
              </span>
              <input
                type="date"
                required
                value={draft.to}
                className="date-input"
                onChange={(event) => setDraft((value) => ({ ...value, to: event.target.value }))}
              />
            </label>
          </div>

          <div className="analytics-actions-group">
            <div className="preset-buttons">
              <button type="button" className="btn btn--preset" onClick={() => handlePreset(7)}>
                7D
              </button>
              <button type="button" className="btn btn--preset" onClick={() => handlePreset(30)}>
                30D
              </button>
              <button type="button" className="btn btn--preset" onClick={() => handlePreset(90)}>
                90D
              </button>
            </div>

            <button type="submit" className="btn btn--primary btn--apply-dates">
              <Icon name="search" />
              <span>{t('analytics.apply')}</span>
            </button>
          </div>

          {invalid && (
            <p className="error" role="alert">
              {t('analytics.invalid')}
            </p>
          )}
        </form>
        <p className="muted analytics-scope-hint">{t('analytics.scope')}</p>
      </div>

      {failed ? (
        <RequestError
          onRetry={() => {
            setFailed(false)
            setData(null)
            setRetry((value) => value + 1)
          }}
        />
      ) : !data ? (
        <div className="analytics-loading">
          <Icon name="refresh" className="spin" />
          <p role="status">{t('common.loading')}</p>
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            {metrics.map(({ key, value, color }) => (
              <article className={`metric-card metric-card--${color}`} key={key}>
                <div className="metric-card__header">
                  <span className="metric-card__label">{t(key as Key)}</span>
                  <span className="metric-card__icon">
                    <Icon name={METRIC_ICONS[key] ?? 'activity'} />
                  </span>
                </div>
                <strong className="metric-card__value">{value}</strong>
              </article>
            ))}
          </div>

          <p className="muted">{t('analytics.heldHint')}</p>

          <div className="analytics-caution-card">
            <span className="analytics-caution-icon">
              <Icon name="shield" />
            </span>
            <p>{t('analytics.caution')}</p>
          </div>

          {data.total_payments === 0 && (
            <div className="empty-state">
              <Icon name="chart" className="empty-state__icon" />
              <p>{t('analytics.empty')}</p>
            </div>
          )}

          <section className="card chart-card">
            <header className="card__head">
              <div>
                <h2>{t('analytics.chart')}</h2>
                <p className="muted">{t('analytics.chartAlt')}</p>
              </div>
              <span className="period-badge">
                <Icon name="calendar" />
                {t('analytics.period', { start: data.start_date, end: data.end_date })}
              </span>
            </header>

            <div className="modern-bar-chart" role="img" aria-label={t('analytics.chartAlt')}>
              {data.daily.map((day) => {
                const heightPct = Math.round((day.total / max) * 100)
                const heldPct = day.total > 0 ? Math.round((day.held / day.total) * 100) : 0

                return (
                  <div className="modern-bar-col" key={day.date}>
                    <div className="bar-tooltip">
                      <strong>{day.total} total</strong>
                      <span>{day.held} held</span>
                      <span>{day.released} released</span>
                      <span>{day.cancelled} stopped</span>
                    </div>
                    <span className="modern-bar-total">{day.total}</span>
                    <div className="modern-bar-track">
                      <div
                        className="modern-bar-fill"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      >
                        {heldPct > 0 && (
                          <div
                            className="modern-bar-held-segment"
                            style={{ height: `${heldPct}%` }}
                            title={`${day.held} held (${heldPct}%)`}
                          />
                        )}
                      </div>
                    </div>
                    <span className="modern-bar-date">{day.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
            <div className="chart-legend">
              <span className="chart-legend__item">
                <span className="legend-swatch legend-swatch--total" />
                <span>Routine Transfer</span>
              </span>
              <span className="chart-legend__item">
                <span className="legend-swatch legend-swatch--held" />
                <span>Intervened Hold</span>
              </span>
            </div>
          </section>

          <section className="card velocity-card">
            <div className="velocity-card__header">
              <div>
                <h2>{t('analytics.resolution')}</h2>
                <p className="muted">Mean time elapsed from risk trigger to final agent or step-up release</p>
              </div>
              <span className="velocity-badge">
                <Icon name="zap" />
                SLA &lt; 60s
              </span>
            </div>

            <p className="resolution-number">
              {data.average_resolution_seconds === null
                ? t('analytics.noResolution')
                : t('analytics.seconds', { value: number(data.average_resolution_seconds) })}
            </p>

            <details className="breakdown-details">
              <summary className="breakdown-summary">
                <Icon name="file-text" />
                <span>{t('analytics.details')}</span>
              </summary>
              <div className="table-wrap custom-scrollbar">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>{t('analytics.date')}</th>
                      <th className="num">{t('analytics.total')}</th>
                      <th className="num">{t('analytics.held')}</th>
                      <th className="num">{t('analytics.released')}</th>
                      <th className="num">{t('analytics.cancelled')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((day) => (
                      <tr key={day.date}>
                        <td>
                          <strong>{day.date}</strong>
                        </td>
                        <td className="num">{day.total}</td>
                        <td className="num">{day.held}</td>
                        <td className="num">{day.released}</td>
                        <td className="num">{day.cancelled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </>
      )}
    </div>
  )
}
