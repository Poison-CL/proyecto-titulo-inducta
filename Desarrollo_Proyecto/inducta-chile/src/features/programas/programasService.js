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

/** Canon app: aprobada/reprobada/en_curso. Acepta variantes legacy de BD. */
export function normalizarEstadoAvance(estado) {
  const e = String(estado || '')
    .toLowerCase()
    .trim()
  if (e === 'aprobado' || e === 'aprobada') return AVANCE_ESTADOS.APROBADA
  if (e === 'reprobado' || e === 'reprobada') return AVANCE_ESTADOS.REPROBADA
  if (e === 'en_proceso' || e === 'en_curso') return AVANCE_ESTADOS.EN_CURSO
  if (e === 'pendiente') return AVANCE_ESTADOS.PENDIENTE
  return e
}

function esEstadoFinal(estado) {
  const e = normalizarEstadoAvance(estado)
  return e === AVANCE_ESTADOS.APROBADA || e === AVANCE_ESTADOS.REPROBADA
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

  if (!supabase) return locales

  // 1 sola query: tests + ids de preguntas (+ modulos si existe la columna)
  let dbTests = null
  let error = null
  ;({ data: dbTests, error } = await supabase
    .from('test_induccion')
    .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado, modulos, pregunta(id_pregunta)')
    .eq('id_empresa', id_empresa)
    .order('id_test', { ascending: false }))

  if (error) {
    ;({ data: dbTests, error } = await supabase
      .from('test_induccion')
      .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado, pregunta(id_pregunta)')
      .eq('id_empresa', id_empresa)
      .order('id_test', { ascending: false }))
  }

  if (error) {
    console.warn('Supabase getEvaluacionesEmpresa:', error.message)
    const err = new Error(error.message)
    err.locales = locales
    err.code = error.code
    throw err
  }

  const enriched = (dbTests || []).map((t) => {
    const localMatch = locales.find((l) => Number(l.id_test) === Number(t.id_test))
    const preguntasIds = Array.isArray(t.pregunta) ? t.pregunta : []
    const { pregunta: _p, ...rest } = t
    return {
      ...rest,
      modulos: Array.isArray(t.modulos) ? t.modulos : localMatch?.modulos || [],
      total_preguntas: preguntasIds.length || localMatch?.preguntas?.length || 0,
      preguntas: localMatch?.preguntas || [],
    }
  })

  setLocalTests(id_empresa, enriched)
  return enriched
}

/**
 * Publica en Supabase evaluaciones que solo quedaron en localStorage (invisible para empleados).
 */
export async function publicarEvaluacionesLocalesPendientes(_supabase, _id_empresa) {
  // ponytail: no recrear tests en BD por coincidencia de título (evita revivir evaluaciones borradas)
  return { publicados: 0 }
}

/**
 * Obtiene el detalle completo de un test con sus preguntas y opciones.
 */
/** @param {{ incluirCorrectas?: boolean }} [opts] incluirCorrectas: admin vía RPC (no expone columna al trabajador) */
export async function getEvaluacionConPreguntas(supabase, id_test, id_empresa, opts = {}) {
  if (!id_test) return null
  const numId = Number(id_test)
  const locales = getLocalTests(id_empresa)
  const localMatch = locales.find((t) => Number(t.id_test) === numId)

  try {
    if (supabase) {
      let testData = null
      let errT = null
      ;({ data: testData, error: errT } = await supabase
        .from('test_induccion')
        .select(
          'id_test, id_empresa, titulo, porcentaje_aprobacion, estado, modulos, pregunta(id_pregunta, enunciado, opcion_respuesta(id_opcion, texto_opcion))',
        )
        .eq('id_test', numId)
        .maybeSingle())

      if (errT) {
        ;({ data: testData, error: errT } = await supabase
          .from('test_induccion')
          .select(
            'id_test, id_empresa, titulo, porcentaje_aprobacion, estado, pregunta(id_pregunta, enunciado, opcion_respuesta(id_opcion, texto_opcion))',
          )
          .eq('id_test', numId)
          .maybeSingle())
      }

      if (!errT && testData) {
        const preguntasRaw = Array.isArray(testData.pregunta) ? testData.pregunta : []
        let preguntasConOpciones = preguntasRaw.map((p) => ({
          id_pregunta: p.id_pregunta,
          enunciado: p.enunciado,
          opciones: Array.isArray(p.opcion_respuesta) ? p.opcion_respuesta : [],
        }))

        if (opts.incluirCorrectas) {
          const { data: conCorrecta, error: rpcErr } = await supabase.rpc('opciones_con_correcta', {
            p_id_test: numId,
          })
          if (!rpcErr && Array.isArray(conCorrecta)) {
            const byPregunta = new Map()
            for (const o of conCorrecta) {
              if (!byPregunta.has(o.id_pregunta)) byPregunta.set(o.id_pregunta, [])
              byPregunta.get(o.id_pregunta).push(o)
            }
            preguntasConOpciones = preguntasConOpciones.map((p) => ({
              ...p,
              opciones: byPregunta.get(p.id_pregunta) || p.opciones,
            }))
          }
        }

        const { pregunta: _p, ...rest } = testData
        if (preguntasConOpciones.length > 0 || localMatch) {
          return {
            ...rest,
            modulos: Array.isArray(testData.modulos)
              ? testData.modulos
              : localMatch?.modulos || [],
            preguntas:
              preguntasConOpciones.length > 0 ? preguntasConOpciones : localMatch?.preguntas || [],
            total_preguntas:
              preguntasConOpciones.length || localMatch?.preguntas?.length || 0,
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
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'youtu.be'])

function hostYouTubePermitido(hostname) {
  const h = String(hostname || '').toLowerCase()
  if (h === 'www.youtube.com') return 'youtube.com'
  return YOUTUBE_HOSTS.has(h) ? h : null
}

/** Extrae id de video YouTube (11 caracteres) solo desde hosts oficiales. */
export function youtubeEmbedId(url) {
  const raw = String(url || '').trim()
  if (!raw) return null
  try {
    const u = new URL(raw)
    const host = hostYouTubePermitido(u.hostname)
    if (!host) return null
    let id = null
    if (host === 'youtu.be') {
      id = u.pathname.replace(/^\//, '').split(/[/?#&]/)[0]
    } else if (u.pathname.startsWith('/embed/')) {
      id = u.pathname.split('/')[2]
    } else if (u.pathname === '/watch' || u.pathname.startsWith('/watch/')) {
      id = u.searchParams.get('v')
    }
    if (!id || !YOUTUBE_ID_RE.test(id)) return null
    return id
  } catch {
    return null
  }
}

/**
 * Normaliza a Nivel → Lección → ítems.
 * Compat: niveles viejos con `items` planos pasan a una lección "Contenidos".
 */
export function normalizarModulos(modulos = []) {
  return (modulos || []).map((n, ni) => {
    const id = n.id || `n_${ni}`
    if (Array.isArray(n.lecciones)) {
      return {
        id,
        titulo: n.titulo || `Nivel ${ni + 1}`,
        lecciones: n.lecciones.map((l, li) => ({
          id: l.id || `${id}_l${li}`,
          titulo: l.titulo || `Lección ${li + 1}`,
          items: Array.isArray(l.items) ? l.items : [],
        })),
      }
    }
    return {
      id,
      titulo: n.titulo || `Nivel ${ni + 1}`,
      lecciones: [
        {
          id: `${id}_lec`,
          titulo: 'Contenidos',
          items: Array.isArray(n.items) ? n.items : [],
        },
      ],
    }
  })
}

export function idsItemsModulos(modulos = []) {
  return normalizarModulos(modulos).flatMap((n) =>
    (n.lecciones || []).flatMap((l) => (l.items || []).map((i) => String(i.id))),
  )
}

export function modulosCompletos(modulos = [], progreso = null) {
  const ids = idsItemsModulos(modulos)
  if (ids.length === 0) return true
  const done = new Set((progreso?.completados || []).map(String))
  return ids.every((id) => done.has(id))
}

/** Gate duro: sin completar estudio no se puede iniciar/enviar el cuestionario. */
export function assertEstudioCompletoParaRendir(modulos = [], progreso = null) {
  if (modulosCompletos(modulos, progreso)) return true
  const err = new Error('Debe completar el estudio antes de rendir la evaluación')
  err.code = 'ESTUDIO_INCOMPLETO'
  throw err
}

export function progresoModulosPct(modulos = [], progreso = null) {
  const ids = idsItemsModulos(modulos)
  if (ids.length === 0) return 100
  const done = new Set((progreso?.completados || []).map(String))
  const n = ids.filter((id) => done.has(id)).length
  return Math.round((n / ids.length) * 100)
}

export function nivelCompleto(nivel, progreso = null) {
  const ids = (nivel?.lecciones || []).flatMap((l) => (l.items || []).map((i) => String(i.id)))
  if (ids.length === 0) return true
  const done = new Set((progreso?.completados || []).map(String))
  return ids.every((id) => done.has(id))
}

/**
 * Marca un ítem de estudio como visto. Local-first + 1 update a la nube.
 */
export async function marcarItemModuloCompletado(
  supabase,
  { id_test, id_empresa, id_usuario, itemId, test_titulo = '', nombre_usuario = '', progresoActual = null },
) {
  const numTest = Number(id_test)
  const item = String(itemId)
  const locales = getLocalAvances(id_empresa)
  const idx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)
  const prev = idx >= 0 ? locales[idx] : null
  const prevProg = prev?.progreso_modulos || progresoActual || { completados: [] }
  const completados = Array.from(new Set([...(prevProg.completados || []).map(String), item]))
  const progreso_modulos = { completados }

  const registro = {
    id_avance: prev?.id_avance || Date.now() % 10000000,
    id_test: numTest,
    id_empresa,
    id_usuario,
    estado: normalizarEstadoAvance(prev?.estado) || AVANCE_ESTADOS.EN_CURSO,
    fecha_evaluacion: prev?.fecha_evaluacion || new Date().toISOString(),
    test_titulo: prev?.test_titulo || test_titulo,
    nombre_usuario: prev?.nombre_usuario || nombre_usuario,
    puntaje: prev?.puntaje ?? null,
    intentos: prev?.intentos ?? 0,
    progreso_modulos,
  }

  if (idx >= 0) locales[idx] = { ...prev, ...registro }
  else locales.unshift(registro)
  setLocalAvances(id_empresa, locales)

  if (supabase) {
    await upsertAvanceTrabajador(supabase, registro)
  }
  return { ok: true, avance: registro, progreso_modulos }
}

export async function crearEvaluacion(supabase, { id_empresa, titulo, porcentaje_aprobacion, estado = 'activo', preguntas = [], modulos = [] }) {
  if (!id_empresa) throw new Error('Falta el identificador de la empresa')
  if (!titulo?.trim()) throw new Error('El título de la evaluación es requerido')
  if (!preguntas || preguntas.length === 0) throw new Error('La evaluación debe incluir al menos una pregunta')
  if (!supabase) throw new Error('Sin cliente Supabase: no se puede publicar la evaluación al equipo')

  const parsedPorcentaje = Math.min(100, Math.max(1, Number(porcentaje_aprobacion) || 70))
  const modulosNorm = Array.isArray(modulos) ? modulos : []

  // RPC: evita RLS cuando el JWT Clerk no trae org_role (caso frecuente).
  let testCreado = null
  let errTest = null
  ;({ data: testCreado, error: errTest } = await supabase.rpc('admin_insertar_test_induccion', {
    p_id_empresa: id_empresa,
    p_titulo: titulo.trim(),
    p_porcentaje_aprobacion: parsedPorcentaje,
    p_estado: estado,
    p_modulos: modulosNorm,
  }))

  if (errTest || !testCreado?.id_test) {
    // Fallback insert directo (por si la RPC aún no está desplegada)
    ;({ data: testCreado, error: errTest } = await supabase
      .from('test_induccion')
      .insert({
        id_empresa,
        titulo: titulo.trim(),
        porcentaje_aprobacion: parsedPorcentaje,
        estado,
        modulos: modulosNorm,
      })
      .select('id_test, id_empresa, titulo, porcentaje_aprobacion, estado, modulos')
      .single())
  }

  if (errTest || !testCreado?.id_test) {
    throw new Error(
      errTest?.message ||
        'No se pudo guardar la evaluación en Supabase (revise RLS / JWT org_id). El empleado no la verá si solo queda en este navegador.',
    )
  }

  const idTestGenerado = testCreado.id_test
  const preguntasGuardadas = []

  for (const preg of preguntas) {
    let pregCreada = null
    let errPreg = null
    ;({ data: pregCreada, error: errPreg } = await supabase.rpc('admin_insertar_pregunta', {
      p_id_empresa: id_empresa,
      p_id_test: idTestGenerado,
      p_enunciado: preg.enunciado.trim(),
    }))
    if (errPreg || !pregCreada?.id_pregunta) {
      ;({ data: pregCreada, error: errPreg } = await supabase
        .from('pregunta')
        .insert({
          id_test: idTestGenerado,
          id_empresa,
          enunciado: preg.enunciado.trim(),
        })
        .select('id_pregunta')
        .single())
    }

    if (errPreg || !pregCreada?.id_pregunta) {
      throw new Error(errPreg?.message || 'No se pudieron guardar las preguntas de la evaluación')
    }

    const opcionesPayload = (preg.opciones || []).map((opt) => ({
      id_pregunta: pregCreada.id_pregunta,
      id_empresa,
      texto_opcion: opt.texto_opcion.trim(),
      es_correcta: Boolean(opt.es_correcta),
    }))

    if (opcionesPayload.length) {
      // es_correcta sin SELECT para authenticated (mig 024): insert directo puede fallar.
      const { error: errOpt } = await supabase.rpc('admin_insertar_opciones', {
        p_rows: opcionesPayload,
      })
      if (errOpt) {
        const { error: errOpt2 } = await supabase.from('opcion_respuesta').insert(opcionesPayload)
        if (errOpt2) throw new Error(errOpt.message || errOpt2.message)
      }
    }

    preguntasGuardadas.push({
      id_pregunta: pregCreada.id_pregunta,
      enunciado: preg.enunciado.trim(),
      opciones: (preg.opciones || []).map((o, oIdx) => ({
        id_opcion: o.id_opcion || idTestGenerado * 1000 + preguntasGuardadas.length * 10 + (oIdx + 1),
        texto_opcion: o.texto_opcion.trim(),
        es_correcta: Boolean(o.es_correcta),
      })),
    })
  }

  const nuevaEvaluacion = {
    id_test: idTestGenerado,
    id_empresa,
    titulo: titulo.trim(),
    porcentaje_aprobacion: parsedPorcentaje,
    estado,
    modulos: testCreado.modulos || modulosNorm,
    total_preguntas: preguntasGuardadas.length,
    preguntas: preguntasGuardadas,
  }

  const actuales = getLocalTests(id_empresa)
  const actualizados = [nuevaEvaluacion, ...actuales.filter((t) => Number(t.id_test) !== Number(idTestGenerado))]
  setLocalTests(id_empresa, actualizados)

  return {
    ok: true,
    evaluacion: nuevaEvaluacion,
    guardadoEnDb: true,
  }
}

/**
 * Actualiza solo los módulos de estudio de una evaluación (1 request).
 */
export async function actualizarModulosEvaluacion(supabase, id_test, id_empresa, modulos = []) {
  if (!supabase) throw new Error('Sin cliente Supabase')
  const numId = Number(id_test)
  const payload = Array.isArray(modulos) ? modulos : []

  const { data, error } = await supabase
    .from('test_induccion')
    .update({ modulos: payload })
    .eq('id_test', numId)
    .eq('id_empresa', id_empresa)
    .select('id_test, modulos')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data?.id_test) throw new Error('No se pudieron guardar los niveles de estudio')

  const locales = getLocalTests(id_empresa).map((t) =>
    Number(t.id_test) === numId ? { ...t, modulos: data.modulos || payload } : t,
  )
  setLocalTests(id_empresa, locales)
  return { ok: true, modulos: data.modulos || payload }
}

/**
 * Actualiza el estado de una evaluación (activo / inactivo).
 */
export async function actualizarEstadoEvaluacion(supabase, id_test, id_empresa, nuevoEstado) {
  const numId = Number(id_test)

  if (supabase) {
    const { data, error } = await supabase
      .from('test_induccion')
      .update({ estado: nuevoEstado })
      .eq('id_test', numId)
      .eq('id_empresa', id_empresa)
      .select('id_test, estado')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data?.id_test) {
      throw new Error('No se actualizó el estado en Supabase (revise permisos / RLS).')
    }
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
 * Conserva avances/certificados (evidencia histórica del colaborador).
 */
export async function eliminarEvaluacion(supabase, id_test, id_empresa) {
  const numId = Number(id_test)
  try {
    if (supabase) {
      // Snapshot del título en avances antes de que el FK deje id_test en null
      const { data: testRow } = await supabase
        .from('test_induccion')
        .select('titulo')
        .eq('id_test', numId)
        .eq('id_empresa', id_empresa)
        .maybeSingle()

      if (testRow?.titulo) {
        await supabase
          .from('avance_trabajador')
          .update({ test_titulo: testRow.titulo })
          .eq('id_test', numId)
          .eq('id_empresa', id_empresa)
      }

      const { data: pregs } = await supabase.from('pregunta').select('id_pregunta').eq('id_test', numId)
      if (Array.isArray(pregs) && pregs.length > 0) {
        const pIds = pregs.map((p) => p.id_pregunta)
        await supabase.from('opcion_respuesta').delete().in('id_pregunta', pIds)
        await supabase.from('pregunta').delete().eq('id_test', numId)
      }
      // No borrar avance_trabajador: ON DELETE SET NULL conserva notas/constancias
      const { error } = await supabase
        .from('test_induccion')
        .delete()
        .eq('id_test', numId)
        .eq('id_empresa', id_empresa)
      if (error) throw new Error(error.message)
    }
  } catch (e) {
    console.warn('Supabase eliminarEvaluacion aviso:', e?.message)
    throw e
  }

  const actuales = getLocalTests(id_empresa)
  const testLocal = actuales.find((t) => Number(t.id_test) === numId)
  setLocalTests(
    id_empresa,
    actuales.filter((t) => Number(t.id_test) !== numId),
  )

  // Conservar avances locales; solo asegura título para certificados
  if (testLocal?.titulo) {
    const avances = getLocalAvances(id_empresa).map((a) =>
      Number(a.id_test) === numId
        ? { ...a, test_titulo: a.test_titulo || testLocal.titulo }
        : a,
    )
    setLocalAvances(id_empresa, avances)
  }

  return { ok: true }
}

async function publicarAvanceViaEdge(supabase, row) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!baseUrl || !anon || !row?.id_empresa || !row?.id_usuario) {
    return { ok: false, error: 'Sin config para edge publicar-avance' }
  }

  let clerkToken = null
  try {
    if (typeof supabase?.__getClerkToken === 'function') {
      clerkToken = await supabase.__getClerkToken(row.id_empresa)
    }
  } catch (e) {
    console.warn('publicarAvanceViaEdge token:', e?.message)
  }
  if (!clerkToken) return { ok: false, error: 'Sin JWT Clerk para publicar avance' }

  const res = await fetch(`${baseUrl}/functions/v1/publicar-avance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anon,
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({
      id_test: Number(row.id_test),
      id_empresa: row.id_empresa,
      id_usuario: row.id_usuario,
      estado: row.estado,
      fecha_evaluacion: row.fecha_evaluacion || new Date().toISOString(),
      puntaje: row.puntaje ?? null,
      intentos: row.intentos ?? 1,
      nombre_usuario: row.nombre_usuario || null,
      test_titulo: row.test_titulo || null,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body?.ok) {
    return { ok: false, error: body?.error || `Edge publicar-avance ${res.status}` }
  }
  return { ok: true, id_avance: body.id_avance }
}

/**
 * Upsert de avance en Supabase. Devuelve { ok, error? }.
 * Camino barato primero (tabla); edge solo como último recurso.
 */
async function upsertAvanceTrabajador(supabase, row) {
  if (!supabase) return { ok: false, error: 'Sin cliente Supabase' }

  const base = {
    id_test: Number(row.id_test),
    id_empresa: row.id_empresa,
    id_usuario: row.id_usuario,
    estado: normalizarEstadoAvance(row.estado),
    fecha_evaluacion: row.fecha_evaluacion || new Date().toISOString(),
  }
  const full = {
    ...base,
    puntaje: row.puntaje ?? null,
    intentos: row.intentos ?? 1,
    nombre_usuario: row.nombre_usuario || null,
    test_titulo: row.test_titulo || null,
  }
  if (row.progreso_modulos != null) full.progreso_modulos = row.progreso_modulos

  // 1) upsert / update / insert directo (1–2 requests)
  let { data, error } = await supabase
    .from('avance_trabajador')
    .upsert(full, { onConflict: 'id_empresa,id_test,id_usuario' })
    .select('id_avance')
    .maybeSingle()

  if (!error && data?.id_avance) return { ok: true, id_avance: data.id_avance }

  if (error) console.warn('upsertAvanceTrabajador upsert:', error.message)

  const { data: existente, error: errFind } = await supabase
    .from('avance_trabajador')
    .select('id_avance')
    .eq('id_test', base.id_test)
    .eq('id_empresa', base.id_empresa)
    .eq('id_usuario', base.id_usuario)
    .maybeSingle()

  if (!errFind && existente?.id_avance) {
    ;({ error } = await supabase.from('avance_trabajador').update(full).eq('id_avance', existente.id_avance))
    if (error) {
      ;({ error } = await supabase.from('avance_trabajador').update(base).eq('id_avance', existente.id_avance))
    }
    if (!error) return { ok: true, id_avance: existente.id_avance }
  } else if (!errFind) {
    ;({ data, error } = await supabase.from('avance_trabajador').insert(full).select('id_avance').maybeSingle())
    if (error) {
      ;({ data, error } = await supabase.from('avance_trabajador').insert(base).select('id_avance').maybeSingle())
    }
    if (!error) return { ok: true, id_avance: data?.id_avance }
  }

  // 2) RPC (1 request)
  try {
    const { data: rpcId, error: rpcErr } = await supabase.rpc('upsert_avance_trabajador', {
      p_id_test: full.id_test,
      p_id_empresa: full.id_empresa,
      p_id_usuario: full.id_usuario,
      p_estado: full.estado,
      p_fecha_evaluacion: full.fecha_evaluacion,
      p_puntaje: full.puntaje,
      p_intentos: full.intentos,
      p_nombre_usuario: full.nombre_usuario,
      p_test_titulo: full.test_titulo,
    })
    if (!rpcErr && rpcId != null) return { ok: true, id_avance: rpcId }
    if (rpcErr) console.warn('upsertAvanceTrabajador rpc:', rpcErr.message)
  } catch (e) {
    console.warn('upsertAvanceTrabajador rpc:', e?.message)
  }

  // 3) Edge solo si todo lo anterior falló
  try {
    const edge = await publicarAvanceViaEdge(supabase, full)
    if (edge.ok) return edge
    return {
      ok: false,
      error: edge.error || error?.message || errFind?.message || 'No se pudo publicar el avance',
    }
  } catch (e) {
    return {
      ok: false,
      error: e?.message || error?.message || errFind?.message || 'No se pudo publicar el avance',
    }
  }
}

/**
 * Consulta todos los avances de la empresa (para la vista Administrador - HU-14, HU-15).
 * Fuente de verdad: Supabase. localStorage solo aporta título/nombre si faltan en DB.
 */
export async function getAvancesEmpresa(supabase, id_empresa) {
  if (!id_empresa) return []
  const locales = getLocalAvances(id_empresa)

  if (!supabase) return locales

  try {
    let dbAvances = null
    let error = null

    ;({ data: dbAvances, error } = await supabase
      .from('avance_trabajador')
      .select(
        'id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion, puntaje, intentos, nombre_usuario, test_titulo, progreso_modulos, test_induccion ( titulo, porcentaje_aprobacion )',
      )
      .eq('id_empresa', id_empresa)
      .order('id_avance', { ascending: false }))

    if (error) {
      ;({ data: dbAvances, error } = await supabase
        .from('avance_trabajador')
        .select(
          'id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion, puntaje, intentos, test_induccion ( titulo, porcentaje_aprobacion )',
        )
        .eq('id_empresa', id_empresa)
        .order('id_avance', { ascending: false }))
    }

    if (error) {
      console.warn('Supabase getAvancesEmpresa error:', error.message)
      return locales
    }

    if (!Array.isArray(dbAvances)) return locales

    // Títulos vienen del embed; el listado de tests ya se carga en paralelo en la página
    const mapLocal = new Map(locales.map((l) => [`${l.id_test}_${l.id_usuario}`, l]))
    const merged = dbAvances.map((dbA) => {
      const key = `${dbA.id_test}_${dbA.id_usuario}`
      const extra = mapLocal.get(key) || {}
      const embed = dbA.test_induccion || {}
      return {
        ...extra,
        ...dbA,
        test_induccion: undefined,
        estado: normalizarEstadoAvance(dbA.estado || extra.estado),
        puntaje: dbA.puntaje ?? extra.puntaje ?? null,
        intentos: dbA.intentos ?? extra.intentos ?? 0,
        progreso_modulos: dbA.progreso_modulos || extra.progreso_modulos || { completados: [] },
        test_titulo:
          embed.titulo || dbA.test_titulo || extra.test_titulo || `Evaluación #${dbA.id_test}`,
        porcentaje_minimo:
          embed.porcentaje_aprobacion ?? extra.porcentaje_minimo ?? 70,
        nombre_usuario: extra.nombre_usuario || dbA.nombre_usuario || null,
      }
    })

    // No pisar DB con solo-local del admin (otro navegador): DB gana.
    // Sí conservar solo-local si aún no hay fila en DB (edge case).
    for (const loc of locales) {
      const key = `${loc.id_test}_${loc.id_usuario}`
      if (!merged.some((m) => `${m.id_test}_${m.id_usuario}` === key)) {
        merged.push(loc)
      }
    }

    return merged
  } catch (e) {
    console.warn('Supabase getAvancesEmpresa aviso:', e?.message)
    return locales
  }
}

// Evita sync concurrente duplicado (Strict Mode / doble carga)
const syncAvancesInflights = new Map()

/**
 * Sube a Supabase avances que solo quedaron en localStorage (para que el admin los vea).
 */
export async function publicarAvancesLocalesPendientes(supabase, id_empresa, id_usuario) {
  if (!supabase || !id_empresa || !id_usuario) return { publicados: 0, fallidos: 0, pendientesLocales: 0 }

  const inflightKey = `${id_empresa}:${id_usuario}`
  if (syncAvancesInflights.has(inflightKey)) {
    return syncAvancesInflights.get(inflightKey)
  }

  const job = (async () => {
    const locales = getLocalAvances(id_empresa).filter((a) => a.id_usuario === id_usuario)
    if (locales.length === 0) return { publicados: 0, fallidos: 0, pendientesLocales: 0 }

    const { data: dbAvances } = await supabase
      .from('avance_trabajador')
      .select('id_avance, id_test, estado, puntaje')
      .eq('id_empresa', id_empresa)
      .eq('id_usuario', id_usuario)

    const enDb = new Map(
      (dbAvances || [])
        .filter((a) => a.id_test != null)
        .map((a) => [Number(a.id_test), a]),
    )

    let publicados = 0
    let fallidos = 0
    let ultimoError = null

    for (const loc of locales) {
      if (!esEstadoFinal(loc.estado)) continue
      const estado = normalizarEstadoAvance(loc.estado)
      const existente = enDb.get(Number(loc.id_test))
      // Ya está en la nube con el mismo resultado → no re-publicar ni toast
      if (
        existente &&
        normalizarEstadoAvance(existente.estado) === estado &&
        Number(existente.puntaje ?? -1) === Number(loc.puntaje ?? -1)
      ) {
        continue
      }

      const res = await upsertAvanceTrabajador(supabase, {
        id_test: loc.id_test,
        id_empresa,
        id_usuario,
        estado,
        fecha_evaluacion: loc.fecha_evaluacion,
        puntaje: loc.puntaje,
        intentos: loc.intentos,
        nombre_usuario: loc.nombre_usuario,
        test_titulo: loc.test_titulo,
      })
      if (res.ok) {
        publicados += 1
        enDb.set(Number(loc.id_test), { estado, puntaje: loc.puntaje })
      } else {
        fallidos += 1
        ultimoError = res.error || ultimoError
        console.warn('publicarAvancesLocalesPendientes:', res.error)
      }
    }

    return { publicados, fallidos, pendientesLocales: locales.length, error: ultimoError }
  })()

  syncAvancesInflights.set(inflightKey, job)
  try {
    return await job
  } finally {
    syncAvancesInflights.delete(inflightKey)
  }
}

/**
 * Consulta los avances de un colaborador en la empresa (para la vista Trabajador - HU-10, HU-13).
 */
export async function getAvancesEmpleado(supabase, id_empresa, id_usuario, { skipSync = false } = {}) {
  if (!id_empresa || !id_usuario) return []
  const locales = getLocalAvances(id_empresa).filter((a) => a.id_usuario === id_usuario)

  try {
    if (supabase) {
      // Empuja huérfanos locales → DB para que el dueño de la empresa los vea
      if (!skipSync) {
        try {
          await publicarAvancesLocalesPendientes(supabase, id_empresa, id_usuario)
        } catch (syncErr) {
          console.warn('Sync avances local→DB:', syncErr?.message)
        }
      }

      let dbAvances = null
      let error = null
      ;({ data: dbAvances, error } = await supabase
        .from('avance_trabajador')
        .select(
          'id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion, puntaje, intentos, progreso_modulos, test_induccion ( titulo, porcentaje_aprobacion )',
        )
        .eq('id_empresa', id_empresa)
        .eq('id_usuario', id_usuario))

      if (error) {
        ;({ data: dbAvances, error } = await supabase
          .from('avance_trabajador')
          .select(
            'id_avance, id_test, id_empresa, id_usuario, estado, fecha_evaluacion, puntaje, intentos, test_induccion ( titulo, porcentaje_aprobacion )',
          )
          .eq('id_empresa', id_empresa)
          .eq('id_usuario', id_usuario))
      }

      if (!error && Array.isArray(dbAvances)) {
        const mapLocal = new Map(locales.map((l) => [Number(l.id_test), l]))
        const merged = dbAvances.map((dbA) => {
          const extra = mapLocal.get(Number(dbA.id_test)) || {}
          const embed = dbA.test_induccion || {}
          return {
            ...extra,
            ...dbA,
            test_induccion: undefined,
            estado: normalizarEstadoAvance(dbA.estado || extra.estado),
            puntaje: dbA.puntaje ?? extra.puntaje ?? null,
            intentos: dbA.intentos ?? extra.intentos ?? 0,
            progreso_modulos: dbA.progreso_modulos || extra.progreso_modulos || { completados: [] },
            test_titulo: embed.titulo || extra.test_titulo || dbA.test_titulo,
            porcentaje_minimo:
              embed.porcentaje_aprobacion ?? extra.porcentaje_minimo ?? 70,
            nombre_usuario: extra.nombre_usuario || dbA.nombre_usuario,
          }
        })
        for (const loc of locales) {
          if (!merged.some((m) => Number(m.id_test) === Number(loc.id_test))) merged.push(loc)
        }
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
export async function iniciarEvaluacion(
  supabase,
  { id_test, id_empresa, id_usuario, test_titulo = '', nombre_usuario = '', modulos = null },
) {
  const numTest = Number(id_test)
  const ahora = new Date().toISOString()

  let avanceActual = null
  const locales = getLocalAvances(id_empresa)
  const matchIdx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)

  if (matchIdx >= 0) {
    avanceActual = locales[matchIdx]
  }

  const testLocal = getLocalTests(id_empresa).find((t) => Number(t.id_test) === numTest)
  const modulosGate = Array.isArray(modulos) ? modulos : testLocal?.modulos || []
  assertEstudioCompletoParaRendir(modulosGate, avanceActual?.progreso_modulos)

  if (matchIdx >= 0) {
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
      progreso_modulos: { completados: [] },
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
  {
    id_test,
    id_empresa,
    id_usuario,
    respuestasSeleccionadas,
    preguntas,
    test_titulo = '',
    nombre_usuario = '',
    porcentaje_minimo = 70,
    modulos = null,
  },
) {
  const numTest = Number(id_test)
  const localesPrev = getLocalAvances(id_empresa)
  const prevAvance = localesPrev.find((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)
  const testLocal = getLocalTests(id_empresa).find((t) => Number(t.id_test) === numTest)
  assertEstudioCompletoParaRendir(
    Array.isArray(modulos) ? modulos : testLocal?.modulos || [],
    prevAvance?.progreso_modulos,
  )

  if (supabase) {
    const { data, error } = await supabase.functions.invoke('publicar-avance', {
      body: { id_test: numTest, respuestas: respuestasSeleccionadas },
    })
    if (error || !data?.ok) {
      if (data?.code === 'ESTUDIO_INCOMPLETO') {
        const err = new Error(data.error || 'Debe completar el estudio antes de rendir la evaluación')
        err.code = 'ESTUDIO_INCOMPLETO'
        throw err
      }
      const errorNube = error?.message || data?.error || 'No se pudo publicar el avance en el servidor'
      console.warn('responderEvaluacion publicar-avance:', errorNube)
      return { ok: false, persistidoEnNube: false, errorNube }
    }

    const aprobada = Boolean(data.aprobada)
    const porcentajeObtenido = Number(data.puntaje)
    const correctas = Number(data.correctas)
    const total = Number(data.total)
    const minimo = Number(data.porcentaje_minimo ?? porcentaje_minimo)
    const av = data.avance || {}
    const locales = getLocalAvances(id_empresa)
    const matchIdx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)

    const registroAvance = {
      id_avance: av.id_avance ?? (matchIdx >= 0 ? locales[matchIdx].id_avance : Date.now() % 10000000),
      id_test: numTest,
      id_empresa: av.id_empresa ?? id_empresa,
      id_usuario: av.id_usuario ?? id_usuario,
      estado: normalizarEstadoAvance(av.estado ?? data.estado),
      fecha_evaluacion: av.fecha_evaluacion || new Date().toISOString(),
      test_titulo: av.test_titulo || test_titulo,
      nombre_usuario: av.nombre_usuario || nombre_usuario,
      puntaje: porcentajeObtenido,
      aciertos: correctas,
      total_preguntas: total,
      porcentaje_minimo: minimo,
      intentos: av.intentos ?? (matchIdx >= 0 ? (locales[matchIdx].intentos || 0) : 0) + 1,
      progreso_modulos:
        av.progreso_modulos ||
        (matchIdx >= 0 ? locales[matchIdx].progreso_modulos : null) ||
        prevAvance?.progreso_modulos ||
        { completados: [] },
    }

    if (matchIdx >= 0) locales[matchIdx] = registroAvance
    else locales.unshift(registroAvance)
    setLocalAvances(id_empresa, locales)

    return {
      ok: true,
      aprobada,
      porcentajeObtenido,
      correctas,
      total,
      porcentaje_minimo: minimo,
      avance: registroAvance,
      persistidoEnNube: true,
      errorNube: null,
      folio: data.folio ?? null,
    }
  }

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

  const locales = getLocalAvances(id_empresa)
  const matchIdx = locales.findIndex((a) => Number(a.id_test) === numTest && a.id_usuario === id_usuario)

  const registroAvance = {
    id_avance: matchIdx >= 0 ? locales[matchIdx].id_avance : Date.now() % 10000000,
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
    progreso_modulos:
      (matchIdx >= 0 ? locales[matchIdx].progreso_modulos : null) ||
      prevAvance?.progreso_modulos ||
      { completados: [] },
  }

  if (matchIdx >= 0) locales[matchIdx] = registroAvance
  else locales.unshift(registroAvance)
  setLocalAvances(id_empresa, locales)

  return {
    ok: true,
    aprobada,
    porcentajeObtenido,
    correctas,
    total,
    porcentaje_minimo,
    avance: registroAvance,
    persistidoEnNube: false,
    errorNube: null,
  }
}
