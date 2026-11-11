/**
 * Flujo completo capacitación: niveles + YouTube + texto → estudio → gate → cuestionario.
 * node tests/programasModulos.check.js
 */
import assert from 'node:assert/strict'
import {
  assertEstudioCompletoParaRendir,
  idsItemsModulos,
  iniciarEvaluacion,
  marcarItemModuloCompletado,
  modulosCompletos,
  nivelCompleto,
  normalizarModulos,
  progresoModulosPct,
  responderEvaluacion,
  youtubeEmbedId,
} from '../src/features/programas/programasService.js'

// localStorage mínimo para marcarItemModuloCompletado (local-first)
const mem = new Map()
globalThis.window = globalThis
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
}

// --- YouTube embed ---
assert.equal(youtubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
assert.equal(youtubeEmbedId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
assert.equal(youtubeEmbedId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
assert.equal(youtubeEmbedId('https://www.youtube.com/watch?v=abc123&t=30'), null)
assert.equal(youtubeEmbedId('https://m.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
assert.equal(youtubeEmbedId(''), null)
assert.equal(youtubeEmbedId('https://vimeo.com/123'), null)

// --- Compat legacy items planos → lección Contenidos ---
const legacy = [{ id: 'n1', titulo: 'Nivel 1', items: [{ id: 't1', tipo: 'texto', cuerpo: 'x' }] }]
const normLegacy = normalizarModulos(legacy)
assert.equal(normLegacy[0].lecciones.length, 1)
assert.equal(normLegacy[0].lecciones[0].titulo, 'Contenidos')
assert.equal(normLegacy[0].lecciones[0].items[0].id, 't1')

// --- Evaluación tipo Capacítate: 2 niveles, texto + YouTube ---
const modulos = [
  {
    id: 'n1',
    titulo: 'Nivel 1 · Introducción',
    lecciones: [
      {
        id: 'l1',
        titulo: 'Bienvenida',
        items: [
          {
            id: 't1',
            tipo: 'texto',
            titulo: 'Política SST',
            cuerpo: 'Lea la política de seguridad de la empresa.',
          },
          {
            id: 'v1',
            tipo: 'youtube',
            titulo: 'Video inducción',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            descripcion: 'Video introductorio',
          },
        ],
      },
    ],
  },
  {
    id: 'n2',
    titulo: 'Nivel 2 · EPP',
    lecciones: [
      {
        id: 'l2',
        titulo: 'Uso de EPP',
        items: [
          {
            id: 'v2',
            tipo: 'youtube',
            titulo: 'Cómo usar el casco',
            url: 'https://youtu.be/jNQXAC9IVRw',
          },
          {
            id: 't2',
            tipo: 'texto',
            titulo: 'Checklist EPP',
            cuerpo: 'Verifique casco, guantes y calzado antes de ingresar.',
          },
        ],
      },
    ],
  },
]

const ids = idsItemsModulos(modulos)
assert.deepEqual(ids, ['t1', 'v1', 'v2', 't2'])
assert.equal(youtubeEmbedId(modulos[0].lecciones[0].items[1].url), 'dQw4w9WgXcQ')
assert.equal(youtubeEmbedId(modulos[1].lecciones[0].items[0].url), 'jNQXAC9IVRw')

// Gate: sin estudio no se desbloquea el cuestionario
assert.equal(modulosCompletos(modulos, { completados: [] }), false)
assert.equal(progresoModulosPct(modulos, { completados: [] }), 0)
assert.equal(nivelCompleto(modulos[0], { completados: [] }), false)
assert.equal(nivelCompleto(modulos[1], { completados: ['t1', 'v1'] }), false) // nivel 2 bloqueado conceptualmente

assert.throws(
  () => assertEstudioCompletoParaRendir(modulos, { completados: [] }),
  (e) => e?.code === 'ESTUDIO_INCOMPLETO',
)
assert.throws(
  () => assertEstudioCompletoParaRendir(modulos, { completados: ['t1', 'v1'] }),
  (e) => e?.code === 'ESTUDIO_INCOMPLETO',
)
assert.equal(assertEstudioCompletoParaRendir([], null), true)
assert.equal(assertEstudioCompletoParaRendir(modulos, { completados: ['t1', 'v1', 'v2', 't2'] }), true)

// iniciarEvaluacion debe fallar si hay módulos sin completar
await assert.rejects(
  () =>
    iniciarEvaluacion(null, {
      id_test: 99,
      id_empresa: 'org_gate',
      id_usuario: 'user_gate',
      modulos,
    }),
  (e) => e?.code === 'ESTUDIO_INCOMPLETO',
)
await assert.rejects(
  () =>
    responderEvaluacion(null, {
      id_test: 99,
      id_empresa: 'org_gate',
      id_usuario: 'user_gate',
      respuestasSeleccionadas: {},
      preguntas: [],
      modulos,
    }),
  (e) => e?.code === 'ESTUDIO_INCOMPLETO',
)

// Empleado completa ítems uno a uno (local-first, sin Supabase)
const org = 'org_flujo_cap'
const user = 'user_empleado_1'
let progreso = { completados: [] }

for (const itemId of ids) {
  assert.equal(modulosCompletos(modulos, progreso), false, `aún no listo antes de ${itemId}`)
  const res = await marcarItemModuloCompletado(null, {
    id_test: 42,
    id_empresa: org,
    id_usuario: user,
    itemId,
    test_titulo: 'Capacitación SST con video',
    nombre_usuario: 'Empleado Demo',
    progresoActual: progreso,
  })
  assert.equal(res.ok, true)
  progreso = res.progreso_modulos
  assert.ok(progreso.completados.includes(itemId))
}

assert.equal(progresoModulosPct(modulos, progreso), 100)
assert.equal(modulosCompletos(modulos, progreso), true)
assert.equal(nivelCompleto(modulos[0], progreso), true)
assert.equal(nivelCompleto(modulos[1], progreso), true)

// Sin módulos → cuestionario libre
assert.equal(modulosCompletos([], null), true)
assert.equal(progresoModulosPct([], null), 100)

// Cuestionario tras estudio completo (HU-12)
const preguntas = [
  {
    id_pregunta: 1,
    enunciado: '¿Cuándo usar EPP?',
    opciones: [
      { id_opcion: 10, texto_opcion: 'Siempre que el área lo exija', es_correcta: true },
      { id_opcion: 11, texto_opcion: 'Solo si llueve', es_correcta: false },
    ],
  },
  {
    id_pregunta: 2,
    enunciado: '¿Qué hacer ante condición insegura?',
    opciones: [
      { id_opcion: 20, texto_opcion: 'Ignorarla', es_correcta: false },
      { id_opcion: 21, texto_opcion: 'Reportarla antes de trabajar', es_correcta: true },
    ],
  },
]

assert.equal(modulosCompletos(modulos, progreso), true, 'gate abierto antes de rendir')

const aprobado = await responderEvaluacion(null, {
  id_test: 42,
  id_empresa: org,
  id_usuario: user,
  respuestasSeleccionadas: { 1: 10, 2: 21 },
  preguntas,
  porcentaje_minimo: 75,
  test_titulo: 'Capacitación SST con video',
  nombre_usuario: 'Empleado Demo',
  modulos,
})
assert.equal(aprobado.aprobada, true)
assert.equal(aprobado.porcentajeObtenido, 100)
assert.equal(aprobado.avance.estado, 'aprobada')

const reprobado = await responderEvaluacion(null, {
  id_test: 42,
  id_empresa: org,
  id_usuario: user,
  respuestasSeleccionadas: { 1: 11, 2: 20 },
  preguntas,
  porcentaje_minimo: 75,
  modulos,
})
assert.equal(reprobado.aprobada, false)
assert.equal(reprobado.avance.estado, 'reprobada')

const inicioOk = await iniciarEvaluacion(null, {
  id_test: 42,
  id_empresa: org,
  id_usuario: user,
  modulos,
})
assert.ok(inicioOk)

console.log('ok programasModulos.check · youtube + estudio + gate + cuestionario')
