/**
 * Prueba SMTP vía Edge Function test-smtp.
 * Requiere en el entorno (o .env local, no commitear): SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASS, SMTP_FROM, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { LOGO_AZUL_OSCURO_PNG_BASE64 } from '../supabase/functions/provisionar-cuenta-temporal/logoBase64.ts'

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

const orden = 'E2E-DEMO-LOCAL'
const monto = 0
const plan = 'demo'
const nombre = 'Empresa Demo Temporal'
const emailTemp = 'tmp.demo.local@tmp.inductachile.cl'
const password = 'REDACTED-use-env-or-generate'
const frontend = 'http://localhost:5173'
const vence = new Date(Date.now() + 864e5).toISOString().slice(0, 10)
const logoSrc = `data:image/png;base64,${LOGO_AZUL_OSCURO_PNG_BASE64}`
const to = env('SMTP_TEST_TO') || env('SMTP_USER')

const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d">
      <div style="text-align:center;padding:8px 0 20px">
        <img src="${logoSrc}" alt="Inducta Chile" width="160" height="auto"
          style="display:inline-block;max-width:160px;height:auto;border:0;outline:none" />
      </div>
      <h1 style="color:#1b22a7;font-size:22px">Pago exitoso</h1>
      <p>Recibimos su pago de <strong>$${Number(monto).toLocaleString('es-CL')}</strong>
      (orden <strong>${orden}</strong>) para el plan <strong>${plan}</strong>.</p>
      <p><strong>Esta cuenta es temporal.</strong> Debe reemplazar el correo y la contraseña
      en el panel en menos de 24 horas (vence aprox. <strong>${vence}</strong>).</p>
      <h2 style="font-size:16px;margin-top:24px">Credenciales temporales</h2>
      <ul>
        <li>Empresa: ${nombre}</li>
        <li>Correo de acceso: <code>${emailTemp}</code></li>
        <li>Contraseña: <code>${password}</code></li>
      </ul>
      <p>Ingrese aquí: <a href="${frontend}/entrar?rol=empresa">${frontend}/entrar?rol=empresa</a></p>
    </div>
  `

const payload = {
  SMTP_HOST: env('SMTP_HOST'),
  SMTP_PORT: env('SMTP_PORT'),
  SMTP_USER: env('SMTP_USER'),
  SMTP_PASS: env('SMTP_PASS'),
  SMTP_FROM: env('SMTP_FROM'),
  to,
  subject: 'Inducta Chile — pago exitoso y acceso temporal',
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
