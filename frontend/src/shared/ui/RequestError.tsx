import { useI18n, type Key } from '@/shared/i18n'

export function RequestError({ onRetry, message = 'common.requestError' }: { onRetry: () => void; message?: Key }) {
  const { t } = useI18n()
  return <div className="request-error" role="alert"><p>{t(message)}</p><button type="button" className="btn btn--sm" onClick={onRetry}>{t('common.retry')}</button></div>
}
