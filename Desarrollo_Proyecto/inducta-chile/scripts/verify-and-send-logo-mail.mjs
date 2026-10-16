import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const png = fs.readFileSync(path.join(root, 'public/logo-azul-oscuro.png'))
const b64 = png.toString('base64')
const logoPath = path.join(root, 'supabase/functions/provisionar-cuenta-temporal/logoBase64.ts')
fs.writeFileSync(logoPath, `export const LOGO_AZUL_OSCURO_PNG_BASE64 = ${JSON.stringify(b64)}\n`)
console.log('logoBase64.ts written', b64.length)

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const logoSrc = `data:image/png;base64,${b64}`
const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d">
      <div style="text-align:center;padding:8px 0 20px">
        <img src="${logoSrc}" alt="Inducta Chile" width="160" height="auto"
          style="display:inline-block;max-width:160px;height:auto;border:0;outline:none" />
      </div>
      <h1 style="color:#1b22a7;font-size:22px">Pago exitoso</h1>
      <p>Recibimos su pago de <strong>$0</strong>
      (orden <strong>E2E-LOGO-B64</strong>) para el plan <strong>demo</strong>.</p>
      <p><strong>Esta cuenta es temporal.</strong> Debe reemplazar el correo y la contraseña
      en el panel en menos de 24 horas. Si no lo hace, la cuenta se deshabilitará y luego se eliminará.</p>
      <h2 style="font-size:16px;margin-top:24px">Credenciales temporales</h2>
      <ul>
        <li>Empresa: Empresa Demo Temporal</li>
        <li>Correo de acceso: <code>tmp.demo161016.a3f9c2@tmp.inductachile.cl</code></li>
        <li>Contraseña: <code>TmpDemo!9kLx2pQ</code></li>
      </ul>
      <p>Ingrese aquí: <a href="http://localhost:5173/entrar?rol=empresa">http://localhost:5173/entrar?rol=empresa</a></p>
      <p style="color:#666;font-size:13px">Los datos del pago quedan solo como referencia histórica.
      Al primer acceso verá un aviso obligatorio para completar sus datos reales.</p>
    </div>
  `

const payload = {
  SMTP_HOST: 'app.japimax.com',
  SMTP_PORT: '465',
  SMTP_USER: 'indcuta@app.japimax.com',
  SMTP_PASS: 'inductatest@',
  SMTP_FROM: 'Inducta Chile <indcuta@app.japimax.com>',
  to: 'mate.martinez@duocuc.cl',
  subject: 'Inducta Chile — pago exitoso y acceso temporal (logo base64)',
  html,
}

const res = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/test-smtp`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
    apikey: env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
console.log(await res.text())
