/**
 * Servicio de Programas, Evaluaciones y Avances de Trabajadores.
 * Integra Supabase con fallback local por tenant (id_empresa) para garantizar
 * que la demo y el funcionamiento en vivo sean 100% resilientes y confiables.
 * Respalda HU-08, HU-10, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16, HU-17 y HU-18.
 */

const STORAGE_PREFIX_TESTS = 'inducta_evaluaciones_'
const STORAGE_PREFIX_AVANCES = 'inducta_avances_'

export const EVALUACION_ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
}

export const AVANCE_ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en_curso',
  APROBADA: 'aprobada',
  REPROBADA: 'reprobada',
}

// Plantilla de inducción base lista para usar
export const EVALUACION_SEMILLA_DEFAULT = {
  titulo: 'Inducción General de Seguridad y Salud en el Trabajo',
  porcentaje_aprobacion: 75,
  estado: 'activo',
  preguntas: [
    {
      enunciado: '¿Cuál es el primer paso ante un accidente o emergencia dentro de las instalaciones?',
      opciones: [
        { texto_opcion: 'Avisar de inmediato a la jefatura directa o encargado de seguridad y activar el protocolo', es_correcta: true },
        { texto_opcion: 'Retirarse de las instalaciones sin dar aviso', es_correcta: false },
        { texto_opcion: 'Esperar a que termine la jornada para informar', es_correcta: false },
      ],
    },
    {
      enunciado: '¿Quién es el responsable de utilizar los Elementos de Protección Personal (EPP)?',
      opciones: [
        { texto_opcion: 'Solo el personal externo contratista', es_correcta: false },
        { texto_opcion: 'Cada colaborador asignado a las áreas que lo requieran', es_correcta: true },
        { texto_opcion: 'Únicamente el comité paritario', es_correcta: false },
      ],
    },
    {
      enunciado: '¿Dónde se encuentran identificadas las vías de evacuación y zonas de seguridad?',
      opciones: [
        { texto_opcion: 'En la señalética visible distribuida en los planos de cada piso y pasillos', es_correcta: true },
        { texto_opcion: 'Solo en la oficina de administración', es_correcta: false },
        { texto_opcion: 'No es necesario señalizarlas', es_correcta: false },
      ],
    },
    {
      enunciado: 'En caso de identificar una condición insegura en el puesto de trabajo, usted debe:',
      opciones: [
        { texto_opcion: 'Continuar trabajando si no le afecta directamente', es_correcta: false },
        { texto_opcion: 'Reportarla oportunamente para que sea corregida antes de iniciar la labor', es_correcta: true },
        { texto_opcion: 'Intentar reparar maquinaria compleja sin autorización', es_correcta: false },
      ],
    },
  ],
}

function getLocalTests(id_empresa) {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_TESTS}${id_empresa}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalTests(id_empresa, tests) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_PREFIX_TESTS}${id_empresa}`, JSON.stringify(tests))
  } catch (e) {
    console.warn('Error guardando evaluaciones locales:', e)
  }
}

function getLocalAvances(id_empresa) {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_AVANCES}${id_empresa}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalAvances(id_empresa, avances) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_PREFIX_AVANCES}${id_empresa}`, JSON.stringify(avances))
  } catch (e) {
    console.warn('Error guardando avances locales:', e)
  }
}

/**
 * Obtiene todas las evaluaciones de la empresa.
 * Intenta Supabase primero; si no hay o falla, combina con caché local.
 */
export async function getEvaluacionesEmpresa(supabase, id_empresa) {
  if (!id_empresa) return []

  const locales = getLocalTests(id_empresa)

  try {
    if (supabase) {
      const { data: dbTests, error } = await supabase
        .from('test_induccion')
        .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado')
        .eq('id_empresa', id_empresa)
        .order('id_test', { ascending: false })

      if (!error && Array.isArray(dbTests)) {
        // Enriquecer cada test con su conteo de preguntas
        const enriched = await Promise.all(
          dbTests.map(async (t) => {
            const { count } = await supabase
              .from('pregunta')
              .select('id_pregunta', { count: 'exact', head: true })
              .eq('id_test', t.id_test)

            const localMatch = locales.find((l) => Number(l.id_test) === Number(t.id_test))
            return {
              ...t,
              total_preguntas: count || localMatch?.preguntas?.length || 0,
              preguntas: localMatch?.preguntas || [],
            }
          }),
        )

        // Combinar con cualquier evaluación local recién creada que aún no esté en BD
        const idsDb = new Set(enriched.map((e) => Number(e.id_test)))
        const extrasLocales = locales.filter((l) => !idsDb.has(Number(l.id_test)))
        const finalResults = [...enriched, ...extrasLocales]
        setLocalTests(id_empresa, finalResults)
        return finalResults
      }
    }
  } catch (e) {
    console.warn('Supabase getEvaluacionesEmpresa aviso:', e?.message)
  }

  return locales
}

/**
 * Obtiene el detalle completo de un test con sus preguntas y opciones.
 */
export async function getEvaluacionConPreguntas(supabase, id_test, id_empresa) {
  if (!id_test) return null
  const numId = Number(id_test)
  const locales = getLocalTests(id_empresa)
  const localMatch = locales.find((t) => Number(t.id_test) === numId)

  try {
    if (supabase) {
      const { data: testData, error: errT } = await supabase
        .from('test_induccion')
        .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado')
        .eq('id_test', numId)
        .maybeSingle()

      if (!errT && testData) {
        const { data: preguntasData, error: errP } = await supabase
          .from('pregunta')
          .select('id_pregunta, enunciado')
          .eq('id_test', numId)

        if (!errP && Array.isArray(preguntasData) && preguntasData.length > 0) {
          const preguntasConOpciones = await Promise.all(
            preguntasData.map(async (p) => {
              const { data: opcionesData } = await supabase
                .from('opcion_respuesta')
                .select('id_opcion, texto_opcion, es_correcta')
                .eq('id_pregunta', p.id_pregunta)

              return {
                id_pregunta: p.id_pregunta,
                enunciado: p.enunciado,
                opciones: opcionesData || [],
              }
            }),
          )

          return {
            ...testData,
            preguntas: preguntasConOpciones,
            total_preguntas: preguntasConOpciones.length,
          }
        }
      }
    }
  } catch (e) {
    console.warn('Supabase getEvaluacionConPreguntas aviso:', e?.message)
  }

  return localMatch || null
}

/**
 * Crea una nueva evaluación con sus preguntas y opciones.
 * HU-08, HU-11.
 */
export async function crearEvaluacion(supabase, { id_empresa, titulo, porcentaje_aprobacion, estado = 'activo', preguntas = [] }) {
  if (!id_empresa) throw new Error('Falta el identificador de la empresa')
  if (!titulo?.trim()) throw new Error('El título de la evaluación es requerido')
  if (!preguntas || preguntas.length === 0) throw new Error('La evaluación debe incluir al menos una pregunta')

  const parsedPorcentaje = Math.min(100, Math.max(1, Number(porcentaje_aprobacion) || 70))
  let idTestGenerado = Date.now() % 10000000

  // 1. Intentar inserción en Supabase
  let guardadoEnDb = false
  try {
    if (supabase) {
      const { data: testCreado, error: errTest } = await supabase
        .from('test_induccion')
        .insert({
          id_empresa,
          titulo: titulo.trim(),
          porcentaje_aprobacion: parsedPorcentaje,
          estado,
        })
        .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado')
        .single()

      if (!errTest && testCreado?.id_test) {
        idTestGenerado = testCreado.id_test
        guardadoEnDb = true

        // Insertar cada pregunta y sus opciones en Supabase
        for (const preg of preguntas) {
          const { data: pregCreada, error: errPreg } = await supabase
            .from('pregunta')
            .insert({
              id_test: idTestGenerado,
              id_empresa,
              enunciado: preg.enunciado.trim(),
            })
            .select('id_pregunta')
            .single()

          if (!errPreg && pregCreada?.id_pregunta && Array.isArray(preg.opciones)) {
            const opcionesPayload = preg.opciones.map((opt) => ({
              id_pregunta: pregCreada.id_pregunta,
              id_empresa,
              texto_opcion: opt.texto_opcion.trim(),
              es_correcta: Boolean(opt.es_correcta),
            }))

            await supabase.from('opcion_respuesta').insert(opcionesPayload)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Supabase crearEvaluacion aviso (usando fallback sincronizado):', e?.message)
  }

  // 2. Persistir siempre en el estado local de la empresa
  const nuevaEvaluacion = {
    id_test: idTestGenerado,
    id_empresa,
    titulo: titulo.trim(),
    porcentaje_aprobacion: parsedPorcentaje,
    estado,
    total_preguntas: preguntas.length,
    preguntas: preguntas.map((p, idx) => ({
      id_pregunta: p.id_pregunta || idTestGenerado * 100 + (idx + 1),
      enunciado: p.enunciado.trim(),
      opciones: (p.opciones || []).map((o, oIdx) => ({
        id_opcion: o.id_opcion || idTestGenerado * 1000 + (idx + 1) * 10 + (oIdx + 1),
        texto_opcion: o.texto_opcion.trim(),
        es_correcta: Boolean(o.es_correcta),
      })),
    })),
  }

  const actuales = getLocalTests(id_empresa)
  const actualizados = [nuevaEvaluacion, ...actuales.filter((t) => Number(t.id_test) !== Number(idTestGenerado))]
  setLocalTests(id_empresa, actualizados)

  return {
    ok: true,
    evaluacion: nuevaEvaluacion,
    guardadoEnDb,
  }
}

/**
 * Actualiza el estado de una evaluación (activo / inactivo).
 */
export async function actualizarEstadoEvaluacion(supabase, id_test, id_empresa, nuevoEstado) {
  const numId = Number(id_test)
  try {
    if (supabase) {
      await supabase
        .from('test_induccion')
        .update({ estado: nuevoEstado })
        .eq('id_test', numId)
        .eq('id_empresa', id_empresa)
    }
  } catch (e) {
    console.warn('Supabase actualizarEstadoEvaluacion aviso:', e?.message)
  }

  const actuales = getLocalTests(id_empresa)
  const actualizados = actuales.map((t) =>
    Number(t.id_test) === numId ? { ...t, estado: nuevoEstado } : t,
  )
  setLocalTests(id_empresa, actualizados)
  return { ok: true }
}

/**
 * Elimina una evaluación de la empresa.
 */
export async function eliminarEvaluacion(supabase, id_test, id_empresa) {
  const numId = Number(id_test)
  try {
    if (supabase) {
      // Eliminar cascada manual en Supabase por si FK no está en cascade
      const { data: pregs } = await supabase.from('pregunta').select('id_pregunta').eq('id_test', numId)
      if (Array.isArray(pregs) && pregs.length > 0) {
        const pIds = pregs.map((p) => p.id_pregunta)
        await supabase.from('opcion_respuesta').delete().in('id_pregunta', pIds)
        await supabase.from('pregunta').delete().eq('id_test', numId)
      }
      await supabase.from('avance_trabajador').delete().eq('id_test', numId)
      await supabase.from('test_induccion').delete().eq('id_test', numId).eq('id_empresa', id_empresa)
    }
  } catch (e) {
    console.warn('Supabase eliminarEvaluacion aviso:', e?.message)
  }

  const actuales = getLocalTests(id_empresa)
  const filtrados = actuales.filter((t) => Number(t.id_test) !== numId)
  setLocalTests(id_empresa, filtrados)

  const avances = getLocalAvances(id_empresa)
  const avancesFiltrados = avances.filter((a) => Number(a.id_test) !== numId)
  setLocalAvances(id_empresa, avancesFiltrados)

  return { ok: true }
}

/**
 * Consulta todos los avances de la empresa (para la vista Administrador - HU-14, HU-15).
 */
export async function getAvancesEmpresa(supabase, id_empresa) {
  if (!id_empresa) return []
  const locales = getLocalAvances(id_empresa)

  try {
    if (supabase) {
      const { data: dbAvances, error } = await supabase
        .from('avance_trabajador')
        .select('id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion')
        .eq('id_empresa', id_empresa)
        .order('id_avance', { ascending: false })

      if (!error && Array.isArray(dbAvances) && dbAvances.length > 0) {
        // Combinar datos locales que tengan puntajes o nombres
        const mapLocal = new Map(locales.map((l) => [`${l.id_test}_${l.id_usuario}`, l]))
        const merged = dbAvances.map((dbA) => {
          const extra = mapLocal.get(`${dbA.id_test}_${dbA.id_usuario}`) || {}
          return {
            ...extra,
            ...dbA,
          }
        })
        setLocalAvances(id_empresa, merged)
        return merged
      }
    }
  } catch (e) {
    console.warn('Supabase getAvancesEmpresa aviso:', e?.message)
  }

  return locales
}

/**
 * Consulta los avances de un colaborador en la empresa (para la vista Trabajador - HU-10, HU-13).
 */
export async function getAvancesEmpleado(supabase, id_empresa, id_usuario) {
  if (!id_empresa || !id_usuario) return []
  const locales = getLocalAvances(id_empresa).filter((a) => a.id_usuario === id_usuario)

  try {
    if (supabase) {
      const { data: dbAvances, error } = await supabase
        .from('avance_trabajador')
        .select('id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion')
        .eq('id_empresa', id_empresa)
        .eq('id_usuario', id_usuario)

      if (!error && Array.isArray(dbAvances)) {
        const mapLocal = new Map(locales.map((l) => [Number(l.id_test), l]))
        const merged = dbAvances.map((dbA) => {
          const extra = mapLocal.get(Number(dbA.id_test)) || {}
          return { ...extra, ...dbA }
        })
        return merged.length > 0 ? merged : locales
      }
    }
  } catch (e) {
    console.warn('Supabase getAvancesEmpleado aviso:', e?.message)
  }

  return locales
}

/**
 * Inicia una evaluación (pasa estado a 'en_curso' si estaba pendiente - HU-12).
 */
export async function iniciarEvaluacion(supabase, { id_test, id_empresa, id_usuario, test_titulo = '', nombre_usuario = '' }) {
  const numTest = Number(id_test)
  const ahora = new Date().toISOString()

  let avanceActual = null
  const locales = getLocalAvances(id_empresa)
  const matchIdx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)

  if (matchIdx >= 0) {
    avanceActual = locales[matchIdx]
    if (avanceActual.estado === AVANCE_ESTADOS.PENDIENTE) {
      locales[matchIdx] = { ...avanceActual, estado: AVANCE_ESTADOS.EN_CURSO }
      setLocalAvances(id_empresa, locales)
    }
  } else {
    avanceActual = {
      id_avance: Date.now() % 10000000,
      id_test: numTest,
      id_empresa,
      id_usuario,
      estado: AVANCE_ESTADOS.EN_CURSO,
      fecha_evaluacion: ahora,
      test_titulo,
      nombre_usuario,
      puntaje: 0,
      intentos: 1,
    }
    setLocalAvances(id_empresa, [avanceActual, ...locales])
  }

  try {
    if (supabase) {
      const { data: existente } = await supabase
        .from('avance_trabajador')
        .select('id_avance, estado')
        .eq('id_test', numTest)
        .eq('id_empresa', id_empresa)
        .eq('id_usuario', id_usuario)
        .maybeSingle()

      if (existente?.id_avance) {
        if (existente.estado === AVANCE_ESTADOS.PENDIENTE) {
          await supabase
            .from('avance_trabajador')
            .update({ estado: AVANCE_ESTADOS.EN_CURSO })
            .eq('id_avance', existente.id_avance)
        }
      } else {
        await supabase.from('avance_trabajador').insert({
          id_test: numTest,
          id_empresa,
          id_usuario,
          estado: AVANCE_ESTADOS.EN_CURSO,
          fecha_evaluacion: ahora,
        })
      }
    }
  } catch (e) {
    console.warn('Supabase iniciarEvaluacion aviso:', e?.message)
  }

  return { ok: true, avance: avanceActual }
}

/**
 * Califica las respuestas del trabajador, calcula puntaje y actualiza estado (HU-12, HU-17).
 */
export async function responderEvaluacion(
  supabase,
  { id_test, id_empresa, id_usuario, respuestasSeleccionadas, preguntas, test_titulo = '', nombre_usuario = '', porcentaje_minimo = 70 },
) {
  const numTest = Number(id_test)
  const ahora = new Date().toISOString()

  let correctas = 0
  const total = preguntas.length

  preguntas.forEach((p) => {
    const seleccionadaId = respuestasSeleccionadas[p.id_pregunta]
    const opcionCorrecta = p.opciones.find((o) => o.es_correcta)
    if (opcionCorrecta && Number(opcionCorrecta.id_opcion) === Number(seleccionadaId)) {
      correctas += 1
    }
  })

  const porcentajeObtenido = total > 0 ? Math.round((correctas / total) * 100) : 0
  const aprobada = porcentajeObtenido >= porcentaje_minimo
  const nuevoEstado = aprobada ? AVANCE_ESTADOS.APROBADA : AVANCE_ESTADOS.REPROBADA

  // Persistir en local
  const locales = getLocalAvances(id_empresa)
  const matchIdx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)

  const registroAvance = {
    id_avance: matchIdx >= 0 ? locales[matchIdx].id_avance : (Date.now() % 10000000),
    id_test: numTest,
    id_empresa,
    id_usuario,
    estado: nuevoEstado,
    fecha_evaluacion: ahora,
    test_titulo,
    nombre_usuario,
    puntaje: porcentajeObtenido,
    aciertos: correctas,
    total_preguntas: total,
    porcentaje_minimo,
    intentos: (matchIdx >= 0 ? (locales[matchIdx].intentos || 0) : 0) + 1,
  }

  if (matchIdx >= 0) {
    locales[matchIdx] = registroAvance
  } else {
    locales.unshift(registroAvance)
  }
  setLocalAvances(id_empresa, locales)

  // Persistir en Supabase
  try {
    if (supabase) {
      const { data: existente } = await supabase
        .from('avance_trabajador')
        .select('id_avance')
        .eq('id_test', numTest)
        .eq('id_empresa', id_empresa)
        .eq('id_usuario', id_usuario)
        .maybeSingle()

      if (existente?.id_avance) {
        await supabase
          .from('avance_trabajador')
          .update({
            estado: nuevoEstado,
            fecha_evaluacion: ahora,
          })
          .eq('id_avance', existente.id_avance)
      } else {
        await supabase.from('avance_trabajador').insert({
          id_test: numTest,
          id_empresa,
          id_usuario,
          estado: nuevoEstado,
          fecha_evaluacion: ahora,
        })
      }
    }
  } catch (e) {
    console.warn('Supabase responderEvaluacion aviso:', e?.message)
  }

  return {
    ok: true,
    aprobada,
    porcentajeObtenido,
    correctas,
    total,
    porcentaje_minimo,
    avance: registroAvance,
  }
}
