/**
 * Regenera logoBase64.ts y envía correo de prueba vía test-smtp.
 * Credenciales SMTP solo desde env / .env local (nunca en el repo).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile() {
  const p = path.join(root, '.env')
  if (!fs.existsSync(p)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      }),
  )
}

const fileEnv = loadEnvFile()
const env = (k) => process.env[k] || fileEnv[k]

const png = fs.readFileSync(path.join(root, 'public/logo-azul-oscuro.png'))
const b64 = png.toString('base64')
const logoPath = path.join(root, 'supabase/functions/provisionar-cuenta-temporal/logoBase64.ts')
fs.writeFileSync(logoPath, `export const LOGO_AZUL_OSCURO_PNG_BASE64 = ${JSON.stringify(b64)}\n`)
console.log('logoBase64.ts written', b64.length)

const required = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]
const missing = required.filter((k) => !env(k))
if (missing.length) {
  console.error('Faltan variables (no hardcodear secretos en el repo):', missing.join(', '))
  process.exit(1)
}

const logoSrc = `data:image/png;base64,${b64}`
const to = env('SMTP_TEST_TO') || env('SMTP_USER')
const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d">
      <div style="text-align:center;padding:8px 0 20px">
        <img src="${logoSrc}" alt="Inducta Chile" width="160" height="auto"
          style="display:inline-block;max-width:160px;height:auto;border:0;outline:none" />
      </div>
      <h1 style="color:#1b22a7;font-size:22px">Pago exitoso</h1>
      <p>Prueba de logo en base64 (sin credenciales reales en el HTML).</p>
    </div>
  `

const payload = {
  SMTP_HOST: env('SMTP_HOST'),
  SMTP_PORT: env('SMTP_PORT'),
  SMTP_USER: env('SMTP_USER'),
  SMTP_PASS: env('SMTP_PASS'),
  SMTP_FROM: env('SMTP_FROM'),
  to,
  subject: 'Inducta Chile — prueba logo base64',
  html,
}

const res = await fetch(`${env('VITE_SUPABASE_URL')}/functions/v1/test-smtp`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env('VITE_SUPABASE_ANON_KEY')}`,
    apikey: env('VITE_SUPABASE_ANON_KEY'),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
console.log(await res.text())
