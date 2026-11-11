import assert from 'node:assert/strict'
import { evidence, demoURL, openBrowser, saveResults } from './browser.mjs'

const app = demoURL(process.env.APP_URL ?? 'http://localhost:13000')
const api = demoURL(process.env.API_URL ?? 'http://localhost:18001')
const browser = await openBrowser()
const cases = []
const errors = []
const stamp = Date.now().toString()
const payee = `KZ99 QA ${stamp}`
const result = { phase: 'updated-product', timestamp: new Date().toISOString(), browser: 'Firefox headless', app_url: app, api_url: api, cases, page_errors: errors }

async function check(name, run) {
  try {
    await run()
    cases.push({ name, status: 'PASS' })
    console.log(`PASS ${name}`)
  } catch (error) {
    cases.push({ name, status: 'FAIL', error: String(error) })
    throw error
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(app)
  const nav = name => page.getByRole('button', { name, exact: true })
  await check('Customer workspace hides technical demo controls', async () => {
    await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).waitFor()
    assert.equal(await page.getByLabel('Вход с устройства', { exact: true }).count(), 0)
    assert.equal(await page.getByLabel('Неверные SMS-коды', { exact: true }).count(), 0)
    await page.screenshot({ path: `${evidence}/after-customer.png`, fullPage: true })
  })
  await check('Routine payment is sent', async () => {
    const response = page.waitForResponse(r => r.url().endsWith('/api/payments/confirm') && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).click()
    const payment = await (await response).json()
    assert.equal(payment.status, 'SENT')
    await page.getByRole('button', { name: 'Новый перевод', exact: true }).click()
  })
  let paymentId
  await check('Risky payment is held and survives reload', async () => {
    await page.getByLabel('Получатель', { exact: true }).fill(payee)
    await page.getByLabel('Сумма в ₸ · только демонстрация', { exact: true }).fill('900000')
    const response = page.waitForResponse(r => r.url().endsWith('/api/payments/confirm') && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Подтвердить перевод', exact: true }).click()
    const payment = await (await response).json()
    assert.equal(payment.status, 'HELD')
    paymentId = payment.id
    await page.locator('.hold').waitFor()
    await page.reload()
    await page.locator('.hold').waitFor()
    assert.ok((await page.locator('.hold').innerText()).includes(payee))
    await page.screenshot({ path: `${evidence}/after-refresh-restored.png`, fullPage: true })
  })
  await check('Warning GET failure offers Retry; recovery sends no decision', async () => {
    let decisions = 0
    const countDecision = request => { if (request.method() === 'POST') decisions++ }
    page.on('request', countDecision)
    await page.route('**/warning*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"QA injected warning failure"}' }))
    await page.reload()
    await page.getByText('Предупреждение не загрузилось. Повторите запрос, чтобы увидеть инструкции и действия.', { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-warning-error.png`, fullPage: true })
    await page.unroute('**/warning*')
    await page.getByRole('button', { name: 'Повторить', exact: true }).click()
    await page.locator('.hold').waitFor()
    assert.equal(decisions, 0)
    page.off('request', countDecision)
    await page.screenshot({ path: `${evidence}/after-warning-recovered.png`, fullPage: true })
  })
  await nav('Оператору').click()
  const search = page.getByLabel(/Поиск/)
  const status = page.getByLabel('Статус перевода', { exact: true })
  await check('CR-01 starts Held; whole-field prefix and no-match work', async () => {
    await search.waitFor()
    assert.equal(await status.inputValue(), 'HELD')
    await status.selectOption('ALL')
    await search.fill('  AIG  ')
    await page.getByText(payee, { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-prefix-positive.png`, fullPage: true })
    await search.fill('ge')
    await page.getByText('По выбранным условиям ничего не найдено.', { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-prefix-negative.png`, fullPage: true })
    await search.fill('Mother')
    await page.getByText('По выбранным условиям ничего не найдено.', { exact: true }).waitFor()
    await search.fill('KZ12')
    await page.getByText('KZ12 Mother', { exact: true }).first().waitFor()
  })
  await check('CR-01 Clear Filters resets query and selects All', async () => {
    await status.selectOption('CANCELLED')
    await page.getByRole('button', { name: 'Очистить фильтры', exact: true }).click()
    assert.equal(await search.inputValue(), '')
    assert.equal(await status.inputValue(), 'ALL')
    await search.fill(payee)
    await page.getByText(payee, { exact: true }).waitFor()
  })
  await check('Blank operator reason blocked; typed reason appears in audit', async () => {
    const reason = page.getByLabel('Причина решения (обязательно)', { exact: true })
    await reason.waitFor()
    await reason.fill('   ')
    await page.getByRole('button', { name: 'Отпустить платёж', exact: true }).click()
    await page.getByText('Укажите непустую причину решения и имя оператора.', { exact: true }).waitFor()
    const unchanged = await (await page.request.get(`${api}/api/payments/${paymentId}`)).json()
    assert.equal(unchanged.status, 'HELD')
    await reason.fill(`QA explicit reason ${stamp}`)
    const response = page.waitForResponse(r => r.url().includes(`/holds/${paymentId}/release`) && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Отпустить платёж', exact: true }).click()
    assert.equal((await response).status(), 200)
    const events = await (await page.request.get(`${api}/api/audit/${paymentId}`)).json()
    assert.equal(events.at(-1).details.reason, `QA explicit reason ${stamp}`)
    await page.screenshot({ path: `${evidence}/after-operator.png`, fullPage: true })
  })
  await check('CR-01 query/status retained through a real polling response', async () => {
    await status.selectOption('RELEASED')
    await page.waitForResponse(r => r.url().endsWith('/api/agent/payments') && r.status() === 200)
    assert.equal(await search.inputValue(), payee)
    assert.equal(await status.inputValue(), 'RELEASED')
    await page.getByText(payee, { exact: true }).waitFor()
  })
  await check('Visible audit controls expose the explicit operator reason', async () => {
    await page.getByRole('button', { name: 'Журнал', exact: true }).click()
    await page.locator('.timeline').waitFor()
    assert.ok((await page.locator('.timeline').innerText()).includes(`QA explicit reason ${stamp}`))
    await page.screenshot({ path: `${evidence}/after-audit.png`, fullPage: true })
  })
  await check('Operator cancellation and combined prefix/status filtering work in UI', async () => {
    const cancelledPayee = `KZ77 QA cancel ${stamp}`
    const created = await page.request.post(`${api}/api/payments/confirm`, { data: { customer_id: 'aigerim', payee: cancelledPayee, amount: 900000, device_id: 'iphone-aigerim', failed_otp: 0 } })
    assert.equal((await created.json()).status, 'HELD')
    await search.fill(cancelledPayee)
    await status.selectOption('HELD')
    await page.getByText(cancelledPayee, { exact: true }).waitFor()
    await page.getByLabel('Причина решения (обязательно)', { exact: true }).fill(`QA simulated cancellation ${stamp}`)
    const response = page.waitForResponse(r => r.url().includes('/cancel') && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Отменить как мошенничество', exact: true }).click()
    assert.equal((await response).status(), 200)
    await status.selectOption('CANCELLED')
    await search.fill('KZ77')
    await page.getByText(cancelledPayee, { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-combined-filter.png`, fullPage: true })
    await search.fill('')
    for (const value of ['HELD', 'SENT', 'RELEASED', 'CANCELLED', 'ALL']) {
      await status.selectOption(value)
      const classes = await page.locator('table .badge').evaluateAll(elements => elements.map(element => element.className))
      if (value !== 'ALL') assert.ok(classes.every(name => name.includes(`badge--${value.toLowerCase()}`)))
    }
  })
  await check('Kazakh search/status/Clear controls work without changing filter semantics', async () => {
    await search.fill('aig')
    await status.selectOption('CANCELLED')
    await page.getByRole('button', { name: 'ҚАЗ', exact: true }).click()
    assert.equal(await page.getByLabel('Төлемдерді іздеу', { exact: true }).inputValue(), 'aig')
    assert.equal(await page.getByLabel('Аударым мәртебесі', { exact: true }).inputValue(), 'CANCELLED')
    await page.getByRole('button', { name: 'Сүзгілерді тазалау', exact: true }).click()
    assert.equal(await page.getByLabel('Төлемдерді іздеу', { exact: true }).inputValue(), '')
    assert.equal(await page.getByLabel('Аударым мәртебесі', { exact: true }).inputValue(), 'ALL')
    await page.screenshot({ path: `${evidence}/after-kazakh-operator.png`, fullPage: true })
    await page.getByRole('button', { name: 'РУС', exact: true }).click()
  })
  await check('Analytics uses real API; errors recover', async () => {
    await nav('Аналитика').click()
    await page.locator('.metrics-grid').getByText('Всего переводов', { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-analytics.png`, fullPage: true })
    await page.getByLabel('Начало периода (UTC)', { exact: true }).fill('2000-01-02')
    await page.getByLabel('Конец периода (UTC)', { exact: true }).fill('2000-01-01')
    await page.getByRole('button', { name: 'Показать', exact: true }).click()
    await page.getByText('Выберите корректный период: от 1 до 366 дней включительно.', { exact: true }).waitFor()
    await page.getByLabel('Начало периода (UTC)', { exact: true }).fill('2000-01-01')
    await page.getByRole('button', { name: 'Показать', exact: true }).click()
    await page.getByText('За этот период учебных переводов нет. Создайте перевод или измените даты.', { exact: true }).waitFor()
    await nav('Клиенту').click()
    await page.route('**/api/agent/analytics*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"QA injected analytics failure"}' }))
    await nav('Аналитика').click()
    await page.getByRole('button', { name: 'Повторить', exact: true }).waitFor()
    await page.unroute('**/api/agent/analytics*')
    await page.getByRole('button', { name: 'Повторить', exact: true }).click()
    await page.locator('.metrics-grid').getByText('Всего переводов', { exact: true }).waitFor()
  })
  await check('Demo mode keeps four scenarios and technical parameters', async () => {
    await nav('Демо-сценарии').click()
    // Client state may restore the already resolved payment; explicitly start again.
    const newTransfer = page.getByRole('button', { name: 'Новый перевод', exact: true })
    if (await newTransfer.count()) await newTransfer.click()
    await page.getByRole('button', { name: 'Захват аккаунта', exact: true }).waitFor()
    assert.equal(await page.locator('.scenario').count(), 4)
    await page.getByLabel('Вход с устройства', { exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-demo.png`, fullPage: true })
  })
  await check('Customer mobile layout fits 375px; Kazakh navigation works', async () => {
    await nav('Клиенту').click()
    await page.setViewportSize({ width: 375, height: 812 })
    await page.screenshot({ path: `${evidence}/after-mobile.png`, fullPage: true })
    const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }))
    assert.ok(dimensions.document <= dimensions.viewport + 1, JSON.stringify(dimensions))
    await page.getByRole('button', { name: 'ҚАЗ', exact: true }).click()
    await page.getByRole('button', { name: 'Клиентке', exact: true }).waitFor()
    await page.screenshot({ path: `${evidence}/after-kazakh-mobile.png`, fullPage: true })
  })
  await check('Stale saved payment is cleared after authoritative server 404', async () => {
    const stale = await browser.newPage()
    await stale.addInitScript(() => sessionStorage.setItem('safestep.payment.client', 'qa-payment-no-longer-exists'))
    await stale.goto(app)
    await stale.getByText('Сохранённый перевод больше не найден. Возможно, учебная база была сброшена. Можно создать новый.', { exact: true }).waitFor()
    await stale.getByRole('button', { name: 'Подтвердить перевод', exact: true }).waitFor()
    await stale.close()
  })
  assert.deepEqual(errors, [], 'No unhandled page errors in updated product')
  result.status = 'PASS'
} catch (error) {
  result.status = 'FAIL'
  result.error = String(error)
  process.exitCode = 1
} finally {
  await saveResults('after-browser-results', result)
  await browser.close()
}
