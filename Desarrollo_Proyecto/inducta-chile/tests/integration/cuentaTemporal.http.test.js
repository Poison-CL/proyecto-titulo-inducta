/**
 * Smoke HTTP contra Edge Functions desplegadas.
 * No crea usuarios Clerk reales (faltan secrets en local).
 * Run: node tests/integration/cuentaTemporal.http.test.js
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const envPath = path.join(root, '.env')
if (!fs.existsSync(envPath)) {
  console.log('SKIP: sin .env')
  process.exit(0)
}
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
assert.ok(url && anon, 'faltan VITE_SUPABASE_*')

const h = { Authorization: `Bearer ${anon}`, apikey: anon, 'Content-Type': 'application/json' }

const lim = await fetch(`${url}/functions/v1/limpiar-cuentas-temporales`, { method: 'POST', headers: h })
assert.equal(lim.status, 200)
const limJ = await lim.json()
assert.equal(limJ.ok, true)

const prov = await fetch(`${url}/functions/v1/provisionar-cuenta-temporal`, {
  method: 'POST',
  headers: h,
  body: JSON.stringify({ orden_compra: 'T', email_contacto: 'a@b.cl', nombre_comercial: 'X' }),
})
assert.equal(prov.status, 401, 'provisionar exige service/internal secret')

const comp = await fetch(`${url}/functions/v1/completar-cuenta-temporal`, {
  method: 'POST',
  headers: h,
  body: '{}',
})
assert.equal(comp.status, 401, 'completar exige JWT Clerk')

const tbk = await fetch(`${url}/functions/v1/tbk-confirmar`, { method: 'GET', redirect: 'manual' })
assert.equal(tbk.status, 303)
assert.match(tbk.headers.get('location') || '', /pago\/anulado/)

console.log('cuentaTemporal.http.test.js ok')
