/**
 * Documenta que JWT con alg "none" no deben confiarse sin verifyToken (clerkAuth).
 * node tests/unit/clerkJwtFake.test.js
 */
import assert from 'node:assert/strict'

/** Heurística mínima: forma JWS y cabecera alg none → rechazar antes de atob del payload. */
export function debeRechazarJwtInseguro(token) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return true
  if (!parts[0] || !parts[1] || !parts[2]) return true
  let header
  try {
    const b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    header = JSON.parse(Buffer.from(b64 + pad, 'base64').toString('utf8'))
  } catch {
    return true
  }
  const alg = String(header.alg ?? '').toLowerCase()
  return alg === 'none' || alg === ''
}

// eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0 = {"alg":"none","typ":"JWT"}
const algNone = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzEyMyJ9.'
assert.equal(debeRechazarJwtInseguro(algNone), true, 'alg:none debe rechazarse')
assert.equal(debeRechazarJwtInseguro('foo.bar'), true, 'JWS incompleto')
assert.equal(debeRechazarJwtInseguro('a.b.c'), true, 'cabecera no JSON válido')

console.log('clerkJwtFake.test.js OK')
