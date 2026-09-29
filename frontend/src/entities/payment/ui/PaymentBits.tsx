import { useI18n, type Key } from '@/shared/i18n'
import { formatDuration, useCountdown } from '@/shared/lib'
import type { PaymentStatus } from '../model/types'

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n()
  return <span className={`badge badge--${status.toLowerCase()}`}>{t(`status.${status}`)}</span>
}

export function ScoreMeter({ score }: { score: number }) {
  const { t } = useI18n()
  const level = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'
  return (
    <span className={`score score--${level}`} title={t('payment.scoreTitle')}>
      {score}
    </span>
  )
}

export function SignalChips({ signals }: { signals: string[] }) {
  const { t } = useI18n()
  if (signals.length === 0) return <span className="muted">{t('payment.noSignals')}</span>
  return (
    <span className="chips">
      {signals.map((s) => (
        <span key={s} className="chip">
          {t(`signal.${s}` as Key)}
        </span>
      ))}
    </span>
  )
}

export function HoldTimer({ until }: { until: string | null }) {
  const { t } = useI18n()
  const seconds = useCountdown(until)
  if (!until) return null
  return seconds > 0 ? (
    <span className="timer">{formatDuration(seconds)}</span>
  ) : (
    <span className="timer timer--expired">{t('payment.expired')}</span>
  )
}
