import { useEffect, useState } from 'react'
import { LocaleSwitcher } from '@/features/switch-locale'
import { ContactCentrePage } from '@/pages/contact-centre'
import { MobileBankingPage } from '@/pages/mobile-banking'
import { AnalyticsPage } from '@/pages/analytics'
import { useI18n } from '@/shared/i18n'
import {
  browserStorage,
  nextTheme,
  readSavedTheme,
  saveTheme,
  themeToggleIcon,
  themeToggleLabel,
  type Theme,
} from '@/shared/lib/theme'
import { Icon } from '@/shared/ui'

type View = 'client' | 'operator' | 'analytics' | 'demo'
const icons = { client: 'transfer', operator: 'headset', analytics: 'chart', demo: 'grid' } as const

export function App() {
  const { t } = useI18n()
  const [view, setView] = useState<View>('client')
  const [theme, setTheme] = useState<Theme>(() => readSavedTheme(browserStorage()))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(browserStorage(), theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(nextTheme)
  }

  return (
    <div className="site-shell" data-theme={theme}>
      {/* Top Telemetry / Notice Marquee */}
      <div className="demo-banner">
        <div className="demo-banner__inner">
          <span className="live-status-pill">
            <span className="live-pulse" />
            LIVE SIMULATION ENGINE
          </span>
          <span className="demo-banner__text">{t('demo.notice')}</span>
          <span className="demo-banner__tech">LATENCY 4ms · SECURE ENCLAVE ACTIVE</span>
        </div>
      </div>

      {/* Main Glass Header */}
      <header className="site-header">
        <a
          className="wordmark"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            setView('client')
          }}
        >
          <span className="brand-icon">
            <Icon name="shield" />
            <span className="brand-icon__ring" />
          </span>
          <div className="brand-text">
            <span className="brand-name">
              Safe<span className="brand-name__accent">Step</span>
            </span>
            <small className="brand-sub">{t('brand.subtitle')}</small>
          </div>
        </a>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            data-testid="theme-toggle"
            aria-label={themeToggleLabel(theme)}
            title={themeToggleLabel(theme)}
            onClick={toggleTheme}
          >
            <Icon name={themeToggleIcon(theme)} />
          </button>
          <LocaleSwitcher />
        </div>
      </header>

      {/* Segmented Navigation Bar */}
      <nav className="site-nav" aria-label={t('nav.label')}>
        <div className="site-nav__container">
          {(['client', 'operator', 'analytics', 'demo'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`nav-item ${view === value ? 'nav-item--active' : ''}`}
              aria-current={view === value ? 'page' : undefined}
              onClick={() => setView(value)}
            >
              <span className="nav-item__icon">
                <Icon name={icons[value]} />
              </span>
              <span className="nav-item__label">{t(`nav.${value}`)}</span>
              {view === value && <span className="nav-item__indicator" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Workspace Area */}
      <main className="workspace">
        {view === 'client' && (
          <>
            {/* Striking Modern Hero Section */}
            <section className="hero">
              <div className="hero__background-glow" aria-hidden="true" />
              <div className="hero__grid-pattern" aria-hidden="true" />

              <div className="hero__content">
                <div className="hero-eyebrow-badge">
                  <Icon name="zap" />
                  <span>{t('client.eyebrow')}</span>
                </div>
                <h1 className="hero-title">{t('client.title')}</h1>
                <p className="hero-description">{t('client.intro')}</p>

                <div className="hero-tag-pills">
                  <span className="hero-tag">
                    <Icon name="shield" />
                    {t('client.protected')}
                  </span>
                  <span className="hero-tag hero-tag--subtle">
                    <Icon name="activity" />
                    Real-time Behavioral Risk Engine
                  </span>
                </div>
              </div>

              <div className="hero-art" aria-hidden="true">
                <div className="shield-orbit-wrapper">
                  <div className="shield-orbit-ring shield-orbit-ring--outer" />
                  <div className="shield-orbit-ring shield-orbit-ring--inner" />
                  <div className="shield-orbit">
                    <Icon name="shield" />
                  </div>
                </div>

                <div className="art-chip art-chip--one">
                  <span className="art-chip__dot art-chip__dot--green" />
                  <Icon name="check-circle" />
                  <span>SafeStep Active</span>
                </div>

                <div className="art-chip art-chip--two">
                  <span className="art-chip__dot art-chip__dot--amber" />
                  <Icon name="lock" />
                  <span>{t('app.loop.confirm')} → {t('app.loop.hold')}</span>
                </div>

                <div className="art-chip art-chip--three">
                  <span className="art-chip__dot art-chip__dot--cyan" />
                  <Icon name="activity" />
                  <span>0.4s AI Latency</span>
                </div>
              </div>
            </section>

            {/* Client Mobile Banking & Aside Layout */}
            <div className="client-layout">
              <div className="client-layout__primary">
                <div className="section-label-header">
                  <span className="section-label-badge">
                    <Icon name="smartphone" />
                    <span>Customer Device Sandbox</span>
                  </span>
                </div>
                <MobileBankingPage key="client" />
              </div>

              <aside className="stack client-aside">
                {/* Security Flow Explainer */}
                <section className="card explainer-card">
                  <div className="explainer-card__top">
                    <span className="section-icon">
                      <Icon name="lock" />
                    </span>
                    <div>
                      <h2>{t('client.check')}</h2>
                      <span className="muted explainer-subtitle">{t('client.flow')}</span>
                    </div>
                  </div>
                  <p className="explainer-desc">{t('client.checkText')}</p>

                  <ol className="flow-stepper">
                    {([1, 2, 3] as const).map((number) => (
                      <li key={number} className="flow-step">
                        <span className="flow-step__number">{number}</span>
                        <div className="flow-step__content">
                          <strong>{t(`client.flow${number}`)}</strong>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Safety Warning Card */}
                <section className="safety-card">
                  <div className="safety-card__accent-bar" />
                  <div className="safety-card__header">
                    <span className="safety-card__icon">
                      <Icon name="alert-triangle" />
                    </span>
                    <h2>{t('client.tip1')}</h2>
                  </div>
                  <p className="safety-card__text">{t('client.tip1Text')}</p>
                </section>
              </aside>
            </div>

            {/* Educational Tips Grid */}
            <section className="tips-grid">
              {([2, 3] as const).map((number) => (
                <article className="card tip-card" key={number}>
                  <div className="tip-card__icon-wrap">
                    <Icon name={number === 2 ? 'lock' : 'clock'} />
                  </div>
                  <div className="tip-card__body">
                    <h2>{t(`client.tip${number}`)}</h2>
                    <p className="muted">{t(`client.tip${number}Text`)}</p>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {view === 'operator' && (
          <div className="view-container">
            <div className="page-heading">
              <span className="eyebrow">SAFE STEP / THREAT MONITORING &amp; DISPATCH</span>
              <h1>{t('operator.title')}</h1>
              <p>{t('operator.intro')}</p>
              <div className="demo-pill">
                <span className="live-pulse" />
                <span>{t('operator.demo')}</span>
              </div>
            </div>
            <ContactCentrePage />
          </div>
        )}

        {view === 'analytics' && <AnalyticsPage />}

        {view === 'demo' && (
          <div className="view-container">
            <div className="page-heading">
              <span className="eyebrow">SAFE STEP / DUAL PERSPECTIVE LAB</span>
              <h1>{t('demo.title')}</h1>
              <p>{t('demo.text')}</p>
              <div className="demo-sync-badge">
                <Icon name="zap" />
                <span>Real-Time Bi-Directional WebSocket Bridge Simulator</span>
              </div>
            </div>

            <div className="demo-layout">
              <section className="demo-pane demo-pane--customer">
                <div className="pane-header">
                  <span className="pane-header__badge">CLIENT PANE</span>
                  <h2 className="pane-title">{t('app.pane.customer')}</h2>
                </div>
                <MobileBankingPage key="demo" demo />
              </section>

              <section className="demo-pane demo-pane--bank">
                <div className="pane-header">
                  <span className="pane-header__badge">OPERATIONS PANE</span>
                  <h2 className="pane-title">{t('app.pane.bank')}</h2>
                </div>
                <ContactCentrePage />
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Luxury Modern Footer */}
      <footer className="site-footer">
        <div className="site-footer__brand">
          <strong>SafeStep</strong>
          <span className="footer-status-pill">
            <span className="live-pulse" />
            Security Core v2.4 Active
          </span>
        </div>
        <p className="site-footer__disclaimer">{t('demo.disclaimer')}</p>
        <div className="site-footer__meta">
          <span>© 2026 SafeStep</span>
          <span className="footer-dot">·</span>
          <span>SIS 10–11 Architecture</span>
        </div>
      </footer>
    </div>
  )
}
