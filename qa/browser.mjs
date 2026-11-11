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
