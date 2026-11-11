import assert from 'node:assert/strict'
import { demoURL, saveResults } from './browser.mjs'
import { mkdir } from 'node:fs/promises'
import { evidence } from './browser.mjs'

const api = demoURL(process.env.API_URL ?? 'http://localhost:18001')
await mkdir(evidence, { recursive: true })
const cases = []
const result = { phase: 'updated-api', timestamp: new Date().toISOString(), base_url: api, cases }

async function request(path, body) {
  const response = await fetch(`${api}/api${path}`, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const text = await response.text()
  return { status: response.status, data: response.headers.get('content-type')?.includes('json') ? JSON.parse(text) : text }
}

async function check(name, test) {
  try { await test(); cases.push({ name, status: 'PASS' }); console.log(`PASS ${name}`) }
  catch (error) { cases.push({ name, status: 'FAIL', error: String(error) }); throw error }
}

const fraud = { customer_id: 'aigerim', payee: 'KZ99 QA simulated account', amount: 900000, device_id: 'unknown-android', failed_otp: 2 }
async function hold() {
  const response = await request('/payments/confirm', fraud)
  assert.equal(response.status, 200)
  assert.equal(response.data.status, 'HELD')
  return response.data
}

try {
  await check('Routine transfer: score zero, SENT, no hold deadline', async () => {
    const response = await request('/payments/confirm', { ...fraud, payee: 'KZ12 Mother', amount: 20000, device_id: 'iphone-aigerim', failed_otp: 0 })
    assert.equal(response.status, 200)
    assert.equal(response.data.status, 'SENT')
    assert.equal(response.data.score, 0)
    assert.equal(response.data.hold_until, null)
  })
  await check('Risky payment held; four warning languages; present in queue', async () => {
    const payment = await hold()
    assert.ok(payment.score >= 50)
    assert.ok(payment.hold_until)
    for (const language of ['ru', 'kk', 'uz', 'ky']) {
      const warning = await request(`/payments/${payment.id}/warning?lang=${language}`)
      assert.equal(warning.status, 200)
      assert.equal(warning.data.language, language)
      assert.equal(warning.data.reasons.length, payment.signals.length)
    }
    assert.ok((await request('/agent/holds')).data.some(row => row.id === payment.id))
  })
  await check('Unknown device rejected three times; trusted attempt then locked', async () => {
    const payment = await hold()
    for (let attempt = 0; attempt < 3; attempt++) {
      assert.equal((await request(`/payments/${payment.id}/step-up/approve`, { device_id: 'unknown-android' })).status, 403)
    }
    assert.equal((await request(`/payments/${payment.id}/step-up/approve`, { device_id: 'iphone-aigerim' })).status, 423)
    assert.equal((await request(`/payments/${payment.id}`)).data.status, 'HELD')
  })
  await check('Simulated trusted-device approval releases a fresh hold', async () => {
    const payment = await hold()
    const response = await request(`/payments/${payment.id}/step-up/approve`, { device_id: 'iphone-aigerim' })
    assert.equal(response.status, 200)
    assert.equal(response.data.status, 'RELEASED')
  })
  await check('Customer denial cancels and writes mock incident plus audit chain', async () => {
    const payment = await hold()
    assert.equal((await request(`/payments/${payment.id}/step-up/deny`, {})).data.status, 'CANCELLED')
    assert.ok((await request('/nafc/incidents')).data.some(row => row.payment_id === payment.id))
    assert.deepEqual((await request(`/audit/${payment.id}`)).data.map(event => event.action), ['SCORED', 'HELD', 'CANCELLED', 'NAFC_REPORTED'])
  })
  for (const action of ['release', 'cancel']) {
    for (const invalidReason of ['', ' ', '\t\n', '   \t  ']) {
      await check(`ISS-06 ${action}: reject ${JSON.stringify(invalidReason)} without state/audit/outbox mutation`, async () => {
        const payment = await hold()
        const beforePayment = (await request(`/payments/${payment.id}`)).data
        const beforeAudit = (await request(`/audit/${payment.id}`)).data
        const beforeIncidents = (await request('/nafc/incidents')).data.filter(row => row.payment_id === payment.id)
        const response = await request(`/agent/holds/${payment.id}/${action}`, { agent: 'QA operator', reason: invalidReason })
        assert.equal(response.status, 422)
        assert.deepEqual((await request(`/payments/${payment.id}`)).data, beforePayment)
        assert.deepEqual((await request(`/audit/${payment.id}`)).data, beforeAudit)
        assert.deepEqual((await request('/nafc/incidents')).data.filter(row => row.payment_id === payment.id), beforeIncidents)
      })
    }
  }
  for (const action of ['release', 'cancel']) {
    await check(`ISS-06 ${action}: preserve trimmed operator reason and reject double decision`, async () => {
      const payment = await hold()
      const response = await request(`/agent/holds/${payment.id}/${action}`, { agent: 'QA operator', reason: '  Explicit simulated review  ' })
      assert.equal(response.status, 200)
      assert.equal(response.data.status, action === 'release' ? 'RELEASED' : 'CANCELLED')
      const events = (await request(`/audit/${payment.id}`)).data
      const decision = events.find(event => event.action === (action === 'release' ? 'RELEASED' : 'CANCELLED'))
      assert.equal(decision.actor, 'agent:QA operator')
      assert.equal(decision.details.reason, 'Explicit simulated review')
      assert.equal((await request(`/agent/holds/${payment.id}/${action}`, { agent: 'QA operator', reason: 'Second decision' })).status, 409)
    })
  }
  await check('Audit CSV export and unknown-payment 404', async () => {
    const exported = await request('/audit/export.csv')
    assert.equal(exported.status, 200)
    assert.ok(exported.data.startsWith('created_at,payment_id'))
    assert.ok(exported.data.includes('Explicit simulated review'))
    assert.equal((await request('/payments/qa-id-that-does-not-exist')).status, 404)
  })
  result.status = 'PASS'
} catch (error) {
  result.status = 'FAIL'
  result.error = String(error)
  process.exitCode = 1
} finally {
  await saveResults('after-api-results', result)
}
