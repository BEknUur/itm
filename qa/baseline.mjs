import assert from 'node:assert/strict'
import { evidence, localURL, openBrowser, saveResults } from './browser.mjs'

const url = localURL(process.env.BASELINE_URL ?? 'http://localhost:4173')
const browser = await openBrowser()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
  await page.goto(url)
  await page.getByRole('button', { name: 'Обычный перевод', exact: true }).waitFor()
  await page.screenshot({ path: `${evidence}/before-desktop.png`, fullPage: true })
  await page.getByRole('button', { name: 'Звонок «службы безопасности»', exact: true }).click()
  await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).click()
  await page.locator('.hold').waitFor()
  await page.screenshot({ path: `${evidence}/before-hold.png`, fullPage: true })
  await page.reload()
  await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).waitFor()
  assert.equal(await page.locator('.hold').count(), 0, 'Old client loses its active hold after reload')
  await page.screenshot({ path: `${evidence}/before-refresh-lost.png`, fullPage: true })
  await page.route('**/warning*', route => route.fulfill({
    status: 503, contentType: 'application/json', body: '{"detail":"QA injected warning failure"}',
  }))
  await page.getByRole('button', { name: 'Звонок «службы безопасности»', exact: true }).click()
  await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).click()
  await page.getByText('Загрузка…', { exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: /Повторить|Retry/ }).count(), 0)
  await page.screenshot({ path: `${evidence}/before-warning-failure.png`, fullPage: true })
  await saveResults('baseline-browser-results', {
    phase: 'baseline', source_commit: '2115a8c', timestamp: new Date().toISOString(),
    browser: 'Firefox headless', base_url: url,
    refresh: { held_before_reload: 1, held_lost_after_reload: true },
    warning_failure: { method: 'Playwright intercept warning GET with HTTP503', loading_visible: true, retry_buttons: 0 },
    note: 'Isolated checkout of the original source. Simulated payments; QA-injected failure, not a real bank outage.',
  })
} finally {
  await browser.close()
}
