import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const png = fs.readFileSync(path.join(root, 'public/logo-azul-oscuro.png'))
const b64 = png.toString('base64')
const out = path.join(root, 'supabase/functions/provisionar-cuenta-temporal/logoBase64.ts')
fs.writeFileSync(out, `export const LOGO_AZUL_OSCURO_PNG_BASE64 = ${JSON.stringify(b64)}\n`)
console.log('ok', out, b64.length)
