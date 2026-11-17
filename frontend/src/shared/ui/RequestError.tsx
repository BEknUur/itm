import { useI18n, type Key } from '@/shared/i18n'
import { Icon } from './Icon'

export function RequestError({ onRetry, message = 'common.requestError' }: { onRetry: () => void; message?: Key }) {
  const { t } = useI18n()
  return (
    <div className="request-error" role="alert">
      <div className="request-error__content">
        <span className="request-error__icon">
          <Icon name="alert-triangle" />
        </span>
        <div className="request-error__text">
          <p>{t(message)}</p>
        </div>
      </div>
      <button type="button" className="btn btn--sm btn--retry" onClick={onRetry}>
        <Icon name="refresh" />
        {t('common.retry')}
      </button>
    </div>
  )
}
