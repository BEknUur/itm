import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { deploymentConfig } from '../scripts/configure-vercel.mjs'

const template = JSON.parse(await readFile(new URL('../vercel.template.json', import.meta.url), 'utf8'))
test('Vercel forwards the full API path and disables API caching', () => {
  const config = deploymentConfig(template, 'https://demo.up.railway.app')
  assert.equal(config.rewrites[0].source, '/api/:path*')
  assert.equal(config.rewrites[0].destination, 'https://demo.up.railway.app/api/:path*')
  assert.ok(config.headers[0].headers.some(header => header.key === 'Cache-Control' && header.value === 'no-store'))
  assert.equal(config.outputDirectory, 'dist')
})
test('Vercel SPA fallback never captures API paths', () => {
  const pattern = new RegExp(`^${template.rewrites[1].source}$`)
  assert.equal(pattern.test('/api/health'), false)
  assert.equal(pattern.test('/api'), false)
  assert.equal(pattern.test('/operator'), true)
})
test('Vercel config rejects credentials, non-HTTPS and API path URLs', () => {
  for (const url of ['http://demo.up.railway.app', 'https://user:secret@demo.up.railway.app', 'https://demo.up.railway.app/api', 'https://demo.up.railway.app?secret=x', 'https://demo.up.railway.app#x']) {
    assert.throws(() => deploymentConfig(template, url))
  }
})
test('Vercel config does not mutate its template', () => {
  deploymentConfig(template, 'https://demo.up.railway.app/')
  assert.equal(template.rewrites[0].destination, '__BACKEND_ORIGIN__/api/:path*')
})
