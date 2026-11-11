import assert from 'node:assert/strict'
import {
  PLANES,
  brandingCertificado,
  cuposDisponibles,
  cuposEvaluacionesDisponibles,
  estadoPlan,
  getPlan,
  montoPlan,
  puedeCrearEvaluacion,
  puedeInvitar,
  precioFinalClp,
  uf,
} from '../../src/lib/planes.js'

assert.equal(PLANES.length, 4, 'hay 4 planes')
assert.deepEqual(
  PLANES.map((p) => p.id),
  ['demo', 'basico', 'plus', 'plusplus'],
)

const demo = getPlan('demo')
const basico = getPlan('basico')
const plus = getPlan('plus')
const plusplus = getPlan('plusplus')

// --- Catálogo: límites y contratabilidad ---
const matriz = [
  { plan: demo, colaboradores: 5, evaluaciones: 1, contratable: false, ufM: 0, ufA: 0 },
  { plan: basico, colaboradores: 50, evaluaciones: 5, contratable: true, ufM: 1.5, ufA: 15 },
  { plan: plus, colaboradores: 250, evaluaciones: null, contratable: true, ufM: 4.5, ufA: 45 },
  { plan: plusplus, colaboradores: null, evaluaciones: null, contratable: true, ufM: 10, ufA: 100 },
]

for (const row of matriz) {
  const { plan, colaboradores, evaluaciones, contratable, ufM, ufA } = row
  assert.ok(plan, `plan ${row.plan?.id} existe`)
  assert.equal(plan.maxColaboradores, colaboradores, `${plan.id} maxColaboradores`)
  assert.equal(plan.maxEvaluaciones, evaluaciones, `${plan.id} maxEvaluaciones`)
  assert.equal(plan.contratable, contratable, `${plan.id} contratable`)
  assert.equal(plan.ufMensual, ufM, `${plan.id} ufMensual`)
  assert.equal(plan.ufAnual, ufA, `${plan.id} ufAnual`)
  if (ufM > 0) assert.equal(ufA, ufM * 10, `${plan.id}: anual = 10 meses`)
  assert.equal(montoPlan(plan, 'mensual'), ufM)
  assert.equal(montoPlan(plan, 'anual'), ufA)
}

// --- Cupos colaboradores ---
assert.equal(cuposDisponibles(demo, 0, 0), 5)
assert.equal(cuposDisponibles(demo, 2, 0), 3)
assert.equal(puedeInvitar(demo, 2, 0), true)
assert.equal(cuposDisponibles(demo, 2, 3), 0)
assert.equal(puedeInvitar(demo, 2, 3), false)
assert.equal(puedeInvitar(demo, 5, 0), false)
assert.equal(puedeInvitar(demo, 4, 0), true)

assert.equal(cuposDisponibles(basico, 50, 0), 0)
assert.equal(puedeInvitar(basico, 49, 0), true)
assert.equal(puedeInvitar(basico, 50, 0), false)
assert.equal(puedeInvitar(basico, 40, 10), false)

assert.equal(cuposDisponibles(plus, 250, 0), 0)
assert.equal(puedeInvitar(plus, 249, 0), true)
assert.equal(puedeInvitar(plus, 250, 0), false)

assert.equal(cuposDisponibles(plusplus, 9999, 100), null)
assert.equal(puedeInvitar(plusplus, 9999, 100), true)

// --- Cupos evaluaciones (HU-16) ---
assert.equal(cuposEvaluacionesDisponibles(demo, 0), 1)
assert.equal(puedeCrearEvaluacion(demo, 0), true)
assert.equal(cuposEvaluacionesDisponibles(demo, 1), 0)
assert.equal(puedeCrearEvaluacion(demo, 1), false)

assert.equal(cuposEvaluacionesDisponibles(basico, 4), 1)
assert.equal(puedeCrearEvaluacion(basico, 4), true)
assert.equal(cuposEvaluacionesDisponibles(basico, 5), 0)
assert.equal(puedeCrearEvaluacion(basico, 5), false)

assert.equal(cuposEvaluacionesDisponibles(plus, 0), null)
assert.equal(puedeCrearEvaluacion(plus, 50), true)
assert.equal(cuposEvaluacionesDisponibles(plusplus, 100), null)
assert.equal(puedeCrearEvaluacion(plusplus, 100), true)

// --- Branding certificados (HU-17) ---
const brandDemo = brandingCertificado(demo)
assert.equal(brandDemo.modo, 'marca_inducta')
assert.equal(brandDemo.identidadCorporativa, false)

for (const p of [basico, plus, plusplus]) {
  const b = brandingCertificado(p)
  assert.equal(b.modo, 'identidad_empresa', `${p.id} branding`)
  assert.equal(b.identidadCorporativa, true, `${p.id} identidad`)
}
assert.equal(brandingCertificado(null).modo, 'marca_inducta')

// --- Precios / IVA ---
assert.equal(precioFinalClp(1, 10000), 11900)
assert.equal(
  precioFinalClp(1.5, 38000),
  Math.round(1.5 * 38000) + Math.round(1.5 * 38000 * 0.19),
)
assert.equal(uf(1.5), '1,5 UF')

// --- Vencimiento ---
const hoy = new Date('2026-10-16T12:00:00')
assert.equal(estadoPlan(null, hoy).estado, 'sin_fecha')
assert.equal(estadoPlan('2026-10-01', hoy).estado, 'vencido')
assert.equal(estadoPlan('2026-10-16', hoy).estado, 'por_vencer')
assert.equal(estadoPlan('2026-10-20', hoy).estado, 'por_vencer')
assert.equal(estadoPlan('2026-11-20', hoy).estado, 'vigente')
assert.equal(estadoPlan('2026-10-30', hoy).dias, 14)

console.log('ok: matriz completa demo/basico/plus/plusplus · cupos · branding · UF · vencimiento')
