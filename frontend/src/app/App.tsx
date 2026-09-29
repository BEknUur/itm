import { LocaleSwitcher } from '@/features/switch-locale'
import { ContactCentrePage } from '@/pages/contact-centre'
import { MobileBankingPage } from '@/pages/mobile-banking'
import { useI18n } from '@/shared/i18n'

// ponytail: no router — the demo is one screen showing both sides of the same hold.
export function App() {
  const { t } = useI18n()
  return (
    <div className="app">
      <header className="app__head">
        <div>
          <h1>SafeStep</h1>
          <p className="muted">{t('app.tagline')}</p>
        </div>
        <div className="app__tools">
          <ol className="loop" aria-label="Product loop">
            <li>{t('app.loop.confirm')}</li>
            <li>{t('app.loop.score')}</li>
            <li>{t('app.loop.hold')}</li>
            <li>{t('app.loop.resolve')}</li>
          </ol>
          <LocaleSwitcher />
        </div>
      </header>
      <main className="app__grid">
        <section aria-label="Customer">
          <h2 className="pane-title">{t('app.pane.customer')}</h2>
          <MobileBankingPage />
        </section>
        <section aria-label="Contact centre">
          <h2 className="pane-title">{t('app.pane.bank')}</h2>
          <ContactCentrePage />
        </section>
      </main>
    </div>
  )
}
