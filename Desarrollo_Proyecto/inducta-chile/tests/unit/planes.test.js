import assert from 'node:assert/strict'
import {
  PLANES,
  cuposDisponibles,
  estadoPlan,
  getPlan,
  montoPlan,
  puedeInvitar,
  precioFinalClp,
} from '../../src/lib/planes.js'

assert.equal(PLANES.length, 4, 'hay 4 planes')

const demo = getPlan('demo')
const basico = getPlan('basico')
const plus = getPlan('plus')
const plusplus = getPlan('plusplus')

assert.equal(demo.maxColaboradores, 5)
assert.equal(basico.maxColaboradores, 50)
assert.equal(plus.maxColaboradores, 250)
assert.equal(plusplus.maxColaboradores, null)

assert.equal(demo.contratable, false)
assert.equal(basico.contratable, true)
assert.equal(plus.contratable, true)
assert.equal(plusplus.contratable, true)

assert.equal(montoPlan(basico, 'mensual'), 1.5)
assert.equal(montoPlan(basico, 'anual'), 15)
assert.equal(montoPlan(plus, 'anual'), 45)
assert.equal(montoPlan(plusplus, 'anual'), 100)

// Inducta TEST: plan demo, 2 miembros → quedan 3 cupos
assert.equal(cuposDisponibles(demo, 2, 0), 3)
assert.equal(puedeInvitar(demo, 2, 0), true)

// Al llegar a 5 (miembros + pendientes) no deja invitar
assert.equal(cuposDisponibles(demo, 2, 3), 0)
assert.equal(puedeInvitar(demo, 2, 3), false)
assert.equal(puedeInvitar(demo, 5, 0), false)
assert.equal(puedeInvitar(demo, 4, 0), true)

// Plus+ sin límite
assert.equal(cuposDisponibles(plusplus, 999, 10), null)
assert.equal(puedeInvitar(plusplus, 999, 10), true)

assert.equal(precioFinalClp(1.5, 38000), Math.round(1.5 * 38000) + Math.round(1.5 * 38000 * 0.19))

const hoy = new Date('2026-10-16T12:00:00')
assert.equal(estadoPlan(null, hoy).estado, 'sin_fecha')
assert.equal(estadoPlan('2026-10-01', hoy).estado, 'vencido')
assert.equal(estadoPlan('2026-10-16', hoy).estado, 'por_vencer')
assert.equal(estadoPlan('2026-10-20', hoy).estado, 'por_vencer')
assert.equal(estadoPlan('2026-11-20', hoy).estado, 'vigente')
assert.equal(estadoPlan('2026-10-30', hoy).dias, 14)

console.log('ok: planes, cupos Inducta TEST (demo=5), montos UF y vencimiento')
