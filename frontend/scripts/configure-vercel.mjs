import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function deploymentConfig(template, backendURL) {
  const url = new URL(backendURL)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Supply only the public HTTPS backend origin, without credentials, /api, query or fragment.')
  }
  return JSON.parse(JSON.stringify(template).replaceAll('__BACKEND_ORIGIN__', url.origin))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.argv[2]) throw new Error('Usage: npm run configure:vercel -- https://YOUR-BACKEND.up.railway.app')
    const template = JSON.parse(await readFile(new URL('../vercel.template.json', import.meta.url), 'utf8'))
    const config = deploymentConfig(template, process.argv[2])
    await writeFile(new URL('../vercel.json', import.meta.url), `${JSON.stringify(config, null, 2)}\n`)
    console.log(`Wrote frontend/vercel.json for ${new URL(process.argv[2]).origin}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
