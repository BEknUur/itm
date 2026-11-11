import { useState } from 'react'
import { LocaleSwitcher } from '@/features/switch-locale'
import { ContactCentrePage } from '@/pages/contact-centre'
import { MobileBankingPage } from '@/pages/mobile-banking'
import { AnalyticsPage } from '@/pages/analytics'
import { useI18n } from '@/shared/i18n'
import { Icon } from '@/shared/ui'

type View = 'client' | 'operator' | 'analytics' | 'demo'
const icons = { client: 'transfer', operator: 'headset', analytics: 'chart', demo: 'grid' } as const

export function App() {
  const { t } = useI18n()
  const [view, setView] = useState<View>('client')
  return <div className="site-shell">
    <div className="demo-banner">{t('demo.notice')}</div>
    <header className="site-header">
      <a className="wordmark" href="#" onClick={event => { event.preventDefault(); setView('client') }}><span className="brand-icon"><Icon name="shield" /></span><span>SafeStep<small>{t('brand.subtitle')}</small></span></a>
      <LocaleSwitcher />
    </header>
    <nav className="site-nav" aria-label={t('nav.label')}>
      {(['client', 'operator', 'analytics', 'demo'] as const).map(value => <button key={value} type="button" className={`nav-item ${view === value ? 'nav-item--active' : ''}`} aria-current={view === value ? 'page' : undefined} onClick={() => setView(value)}><Icon name={icons[value]} />{t(`nav.${value}`)}</button>)}
    </nav>
    <main className="workspace">
      {view === 'client' && <>
        <section className="hero">
          <div><span className="eyebrow">{t('client.eyebrow')}</span><h1>{t('client.title')}</h1><p>{t('client.intro')}</p><span className="hero-tag"><Icon name="shield" />{t('client.protected')}</span></div>
          <div className="hero-art" aria-hidden="true"><div className="shield-orbit"><Icon name="shield" /></div><span className="art-chip art-chip--one"><Icon name="check" />SafeStep</span><span className="art-chip art-chip--two"><Icon name="lock" />{t('app.loop.confirm')} → {t('app.loop.hold')}</span></div>
        </section>
        <div className="client-layout">
          <MobileBankingPage key="client" />
          <aside className="stack"><section className="card explainer"><span className="section-icon"><Icon name="lock" /></span><h2>{t('client.check')}</h2><p className="muted">{t('client.checkText')}</p><ol className="flow-list">{([1, 2, 3] as const).map(number => <li key={number}><span>{number}</span>{t(`client.flow${number}`)}</li>)}</ol></section><section className="safety-card"><Icon name="phone" /><h2>{t('client.tip1')}</h2><p>{t('client.tip1Text')}</p></section></aside>
        </div>
        <section className="tips-grid">{([2, 3] as const).map(number => <article className="card" key={number}><Icon name={number === 2 ? 'lock' : 'clock'} /><h2>{t(`client.tip${number}`)}</h2><p className="muted">{t(`client.tip${number}Text`)}</p></article>)}</section>
      </>}
      {view === 'operator' && <><div className="page-heading"><span className="eyebrow">SAFE STEP / OPERATIONS</span><h1>{t('operator.title')}</h1><p>{t('operator.intro')}</p><span className="demo-pill">{t('operator.demo')}</span></div><ContactCentrePage /></>}
      {view === 'analytics' && <AnalyticsPage />}
      {view === 'demo' && <><div className="page-heading"><span className="eyebrow">SAFE STEP / DEMO</span><h1>{t('demo.title')}</h1><p>{t('demo.text')}</p></div><div className="demo-layout"><section><h2 className="pane-title">{t('app.pane.customer')}</h2><MobileBankingPage key="demo" demo /></section><section><h2 className="pane-title">{t('app.pane.bank')}</h2><ContactCentrePage /></section></div></>}
    </main>
    <footer className="site-footer"><strong>SafeStep</strong><p>{t('demo.disclaimer')}</p><span>© 2026 SafeStep · SIS 10–11</span></footer>
  </div>
}
