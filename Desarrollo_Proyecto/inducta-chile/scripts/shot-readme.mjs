import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('../../assets/screenshots')
const base = process.env.SHOT_BASE || 'http://localhost:5174'
const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'inducta-shots')

await mkdir(outDir, { recursive: true })
await mkdir(destDesktop, { recursive: true })

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
})
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
})

async function shot(name, url, before) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(800)
  if (before) await before(page)
  await page.waitForTimeout(400)
  const file = `${name}.png`
  const buf = await page.screenshot({ type: 'png' })
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path.join(outDir, file), buf)
  await writeFile(path.join(destDesktop, file), buf)
  console.log('ok', file)
}

await shot('home', `${base}/`)
await shot('docs', `${base}/recursos`)
await shot('precios', `${base}/precios`)
await shot('panel', `${base}/`, async (p) => {
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('h2')].find((h) =>
      h.textContent?.includes('necesita hoy'),
    )
    el?.scrollIntoView({ block: 'center' })
  })
})
await shot('como-funciona', `${base}/`, async (p) => {
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('h2')].find((h) =>
      h.textContent?.includes('Inducción bajo control'),
    )
    el?.scrollIntoView({ block: 'start' })
  })
})
await shot('entrar', `${base}/entrar?rol=empresa`)

await browser.close()
