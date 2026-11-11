import { firefox } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const evidence = fileURLToPath(new URL('../SIS 10-11/evidence/', import.meta.url))

export function localURL(value) {
  const url = new URL(value)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Browser verification only permits a local demonstration server.')
  }
  return url.toString().replace(/\/$/, '')
}

export function demoURL(value) {
  const url = new URL(value)
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Use a plain deployment origin, without credentials, path, query or fragment.')
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return localURL(value)
  if (process.env.ALLOW_REMOTE_DEMO !== '1' || url.protocol !== 'https:') {
    throw new Error('Hosted verification requires HTTPS and ALLOW_REMOTE_DEMO=1 for your own demo deployment.')
  }
  return url.origin
}

export async function openBrowser() {
  await mkdir(evidence, { recursive: true })
  return firefox.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE }
      : {}),
  })
}

export async function saveResults(name, data) {
  await writeFile(`${evidence}/${name}.json`, `${JSON.stringify(data, null, 2)}\n`)
  console.log(JSON.stringify(data, null, 2))
}
