/**
 * Renders scripts/og-template.html to public/og-image.jpg (1200x630).
 *
 * Not part of the build — run it only when the card design changes:
 *   npm i --no-save @playwright/test   (once, if not installed)
 *   node scripts/gen-og.mjs
 *
 * Uses VITE_SITE_URL for the domain line when set (falls back to the
 * default production host, same as src/lib/site.ts).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p) => readFileSync(join(root, p)).toString('base64')

const domain = (process.env.VITE_SITE_URL || 'https://kouci-web.vercel.app').replace(
  /^https?:\/\//,
  '',
)

const html = readFileSync(join(root, 'scripts/og-template.html'), 'utf8')
  .replace(
    '%%SORA%%',
    b64('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2'),
  )
  .replace(
    '%%INTER%%',
    b64('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
  )
  .replace('%%MARK%%', b64('public/brand/kouci-mark-136.png'))
  .replace('%%DOMAIN%%', domain)

const { chromium } = await import('@playwright/test')
const browser = await chromium.launch(
  process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {},
)
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const jpg = await page.screenshot({ type: 'jpeg', quality: 88 })
writeFileSync(join(root, 'public/og-image.jpg'), jpg)
await browser.close()
console.log(`og-image.jpg written (${(jpg.length / 1024).toFixed(0)} KB, domain: ${domain})`)
