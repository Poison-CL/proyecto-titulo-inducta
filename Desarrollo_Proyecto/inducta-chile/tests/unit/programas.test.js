import assert from 'node:assert/strict'
import {
  responderEvaluacion,
  EVALUACION_SEMILLA_DEFAULT,
} from '../../src/features/programas/programasService.js'
import {
  cuposEvaluacionesDisponibles,
  getPlan,
  puedeCrearEvaluacion,
} from '../../src/lib/planes.js'

// 1. Validar la semilla de inducción por defecto
assert.ok(EVALUACION_SEMILLA_DEFAULT.titulo, 'La semilla tiene título')
assert.ok(EVALUACION_SEMILLA_DEFAULT.preguntas.length >= 3, 'Tiene al menos 3 preguntas')
EVALUACION_SEMILLA_DEFAULT.preguntas.forEach((p, idx) => {
  assert.ok(p.enunciado, `Pregunta ${idx + 1} tiene enunciado`)
  assert.ok(p.opciones.length >= 2, `Pregunta ${idx + 1} tiene al menos 2 opciones`)
  const correctas = p.opciones.filter((o) => o.es_correcta)
  assert.equal(correctas.length, 1, `Pregunta ${idx + 1} tiene exactamente una opción correcta`)
})

// 2. Simular corrección de evaluación (HU-12)
const preguntasMock = [
  {
    id_pregunta: 101,
    enunciado: '¿Pregunta 1?',
    opciones: [
      { id_opcion: 1, texto_opcion: 'Opción A', es_correcta: true },
      { id_opcion: 2, texto_opcion: 'Opción B', es_correcta: false },
    ],
  },
  {
    id_pregunta: 102,
    enunciado: '¿Pregunta 2?',
    opciones: [
      { id_opcion: 3, texto_opcion: 'Opción C', es_correcta: false },
      { id_opcion: 4, texto_opcion: 'Opción D', es_correcta: true },
    ],
  },
  {
    id_pregunta: 103,
    enunciado: '¿Pregunta 3?',
    opciones: [
      { id_opcion: 5, texto_opcion: 'Opción E', es_correcta: true },
      { id_opcion: 6, texto_opcion: 'Opción F', es_correcta: false },
    ],
  },
  {
    id_pregunta: 104,
    enunciado: '¿Pregunta 4?',
    opciones: [
      { id_opcion: 7, texto_opcion: 'Opción G', es_correcta: true },
      { id_opcion: 8, texto_opcion: 'Opción H', es_correcta: false },
    ],
  },
]

// Caso A: Todas correctas (100% -> Aprobada)
const resPerfecto = await responderEvaluacion(null, {
  id_test: 1,
  id_empresa: 'org_test',
  id_usuario: 'user_test',
  respuestasSeleccionadas: {
    101: 1,
    102: 4,
    103: 5,
    104: 7,
  },
  preguntas: preguntasMock,
  porcentaje_minimo: 75,
})
assert.equal(resPerfecto.correctas, 4)
assert.equal(resPerfecto.total, 4)
assert.equal(resPerfecto.porcentajeObtenido, 100)
assert.equal(resPerfecto.aprobada, true)
assert.equal(resPerfecto.avance.estado, 'aprobada')

// Caso B: 2 de 4 correctas (50% < 75% -> Reprobada)
const resFallido = await responderEvaluacion(null, {
  id_test: 1,
  id_empresa: 'org_test',
  id_usuario: 'user_test',
  respuestasSeleccionadas: {
    101: 1, // correcta
    102: 3, // incorrecta
    103: 5, // correcta
    104: 8, // incorrecta
  },
  preguntas: preguntasMock,
  porcentaje_minimo: 75,
})
assert.equal(resFallido.correctas, 2)
assert.equal(resFallido.porcentajeObtenido, 50)
assert.equal(resFallido.aprobada, false)
assert.equal(resFallido.avance.estado, 'reprobada')

// Caso C: 3 de 4 correctas (75% >= 75% -> Aprobada en el umbral)
const resUmbral = await responderEvaluacion(null, {
  id_test: 1,
  id_empresa: 'org_test',
  id_usuario: 'user_test',
  respuestasSeleccionadas: {
    101: 1, // correcta
    102: 4, // correcta
    103: 5, // correcta
    104: 8, // incorrecta
  },
  preguntas: preguntasMock,
  porcentaje_minimo: 75,
})
assert.equal(resUmbral.correctas, 3)
assert.equal(resUmbral.porcentajeObtenido, 75)
assert.equal(resUmbral.aprobada, true)

// 3. Reglas de límite de evaluaciones por plan (HU-16)
const planDemo = getPlan('demo')
const planBasico = getPlan('basico')
const planPlus = getPlan('plus')

assert.equal(puedeCrearEvaluacion(planDemo, 0), true)
assert.equal(puedeCrearEvaluacion(planDemo, 1), false)
assert.equal(cuposEvaluacionesDisponibles(planDemo, 1), 0)

assert.equal(puedeCrearEvaluacion(planBasico, 4), true)
assert.equal(puedeCrearEvaluacion(planBasico, 5), false)

assert.equal(puedeCrearEvaluacion(planPlus, 100), true)
assert.equal(cuposEvaluacionesDisponibles(planPlus, 100), null)

console.log('programas.test.js ok: evaluaciones, calificación HU-12 y topes de plan HU-16')
