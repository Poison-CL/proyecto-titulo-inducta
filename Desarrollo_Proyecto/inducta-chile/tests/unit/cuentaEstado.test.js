import assert from 'node:assert/strict'
import { CUENTA, esCuentaDeshabilitada, esCuentaTemporal, puedeGestionarEquipo } from '../../src/lib/cuentaEstado.js'

assert.equal(esCuentaTemporal(CUENTA.TEMPORAL), true)
assert.equal(esCuentaTemporal(CUENTA.PENDIENTE), true)
assert.equal(esCuentaTemporal(CUENTA.VERIFICADA), false)
assert.equal(esCuentaDeshabilitada(CUENTA.DESHABILITADA), true)
assert.equal(puedeGestionarEquipo(CUENTA.TEMPORAL), false)
assert.equal(puedeGestionarEquipo(CUENTA.VERIFICADA), true)
assert.equal(puedeGestionarEquipo(null), true)

console.log('cuentaEstado.test.js ok')
