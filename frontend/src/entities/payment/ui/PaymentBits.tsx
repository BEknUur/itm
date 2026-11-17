import { useI18n, type Key } from '@/shared/i18n'
import { formatDuration, useCountdown } from '@/shared/lib'
import { Icon, type IconName } from '@/shared/ui'
import type { PaymentStatus } from '../model/types'

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n()
  const statusLower = status.toLowerCase()

  return (
    <span className={`badge badge--${statusLower}`}>
      <span className="badge__dot" aria-hidden="true" />
      <span className="badge__label">{t(`status.${status}`)}</span>
    </span>
  )
}

export function ScoreMeter({ score }: { score: number }) {
  const { t } = useI18n()
  const level = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'

  return (
    <span className={`score-meter score-meter--${level}`} title={t('payment.scoreTitle')}>
      <span className="score-meter__bar">
        <span className="score-meter__fill" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </span>
      <span className="score-meter__num">{score}</span>
    </span>
  )
}

const SIGNAL_ICONS: Record<string, IconName> = {
  NEW_PAYEE: 'user',
  UNUSUAL_AMOUNT: 'activity',
  FIRST_LARGE_P2P: 'zap',
  NEW_DEVICE: 'smartphone',
  FAILED_OTP: 'alert-triangle',
}

export function SignalChips({ signals }: { signals: string[] }) {
  const { t } = useI18n()
  if (signals.length === 0) {
    return <span className="chip-empty">{t('payment.noSignals')}</span>
  }

  return (
    <span className="chips">
      {signals.map((s) => {
        const iconName = SIGNAL_ICONS[s] ?? 'info'
        return (
          <span key={s} className={`chip chip--${s.toLowerCase().replace(/_/g, '-')}`}>
            <Icon name={iconName} className="chip__icon" />
            <span>{t(`signal.${s}` as Key)}</span>
          </span>
        )
      })}
    </span>
  )
}

export function HoldTimer({ until }: { until: string | null }) {
  const { t } = useI18n()
  const seconds = useCountdown(until)
  if (!until) return null

  return seconds > 0 ? (
    <span className="timer-badge timer-badge--active">
      <Icon name="clock" className="timer-badge__icon" />
      <span className="timer-badge__val">{formatDuration(seconds)}</span>
    </span>
  ) : (
    <span className="timer-badge timer-badge--expired">
      <Icon name="alert-triangle" className="timer-badge__icon" />
      <span className="timer-badge__val">{t('payment.expired')}</span>
    </span>
  )
}
