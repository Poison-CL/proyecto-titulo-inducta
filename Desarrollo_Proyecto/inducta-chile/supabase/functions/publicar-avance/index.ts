/**
 * Califica y publica un avance en el servidor.
 * Body: { id_test, respuestas: { [id_pregunta]: id_opcion } }
 * Ignora estado/puntaje/id_usuario del cliente.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { AuthError, requireClerkAuth } from '../_shared/clerkAuth.ts'
import { corsHeaders, jsonResponse, optionsResponse } from '../_shared/cors.ts'

type Modulo = {
  lecciones?: Array<{ items?: Array<{ id?: string }> }>
  items?: Array<{ id?: string }>
}

function idsItemsModulos(modulos: Modulo[] | null | undefined): string[] {
  const out: string[] = []
  for (const n of modulos || []) {
    if (Array.isArray(n.lecciones)) {
      for (const l of n.lecciones) {
        for (const it of l.items || []) {
          if (it?.id != null) out.push(String(it.id))
        }
      }
    } else if (Array.isArray(n.items)) {
      for (const it of n.items) {
        if (it?.id != null) out.push(String(it.id))
      }
    }
  }
  return out
}

function estudioCompleto(modulos: Modulo[] | null | undefined, progreso: { completados?: string[] } | null) {
  const ids = idsItemsModulos(modulos)
  if (!ids.length) return true
  const done = new Set((progreso?.completados || []).map(String))
  return ids.every((id) => done.has(id))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  try {
    const auth = await requireClerkAuth(req, { requireOrg: true })
    const body = await req.json().catch(() => ({}))
    const id_test = Number(body.id_test)
    const respuestas = body.respuestas && typeof body.respuestas === 'object' ? body.respuestas : null

    if (!id_test || !respuestas) {
      return jsonResponse({ error: 'Envíe id_test y respuestas' }, 400, req)
    }

    const orgId = auth.orgId!
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: test, error: testErr } = await supabaseAdmin
      .from('test_induccion')
      .select(
        'id_test, id_empresa, titulo, porcentaje_aprobacion, estado, modulos, pregunta(id_pregunta, opcion_respuesta(id_opcion, es_correcta))',
      )
      .eq('id_test', id_test)
      .maybeSingle()

    if (testErr) return jsonResponse({ error: testErr.message }, 500, req)
    if (!test) return jsonResponse({ error: 'Evaluación no encontrada' }, 404, req)
    if (String(test.id_empresa) !== orgId) {
      return jsonResponse({ error: 'La evaluación no pertenece a su organización' }, 403, req)
    }
    if (test.estado !== 'activo') {
      return jsonResponse({ error: 'La evaluación no está publicada' }, 403, req)
    }

    const { data: avancePrev } = await supabaseAdmin
      .from('avance_trabajador')
      .select('id_avance, intentos, progreso_modulos, nombre_usuario')
      .eq('id_empresa', orgId)
      .eq('id_test', id_test)
      .eq('id_usuario', auth.userId)
      .maybeSingle()

    if (!estudioCompleto(test.modulos, avancePrev?.progreso_modulos)) {
      return jsonResponse({ error: 'Debe completar el estudio antes de rendir', code: 'ESTUDIO_INCOMPLETO' }, 403, req)
    }

    const preguntas = Array.isArray(test.pregunta) ? test.pregunta : []
    let correctas = 0
    for (const p of preguntas) {
      const seleccion = Number(respuestas[p.id_pregunta] ?? respuestas[String(p.id_pregunta)])
      const correcta = (p.opcion_respuesta || []).find((o: { es_correcta?: boolean }) => o.es_correcta)
      if (correcta && Number(correcta.id_opcion) === seleccion) correctas += 1
    }
    const total = preguntas.length
    const porcentaje_minimo = Number(test.porcentaje_aprobacion) || 70
    const puntaje = total > 0 ? Math.round((correctas / total) * 100) : 0
    const estado = puntaje >= porcentaje_minimo ? 'aprobada' : 'reprobada'
    const fecha_evaluacion = new Date().toISOString()
    const intentos = (Number(avancePrev?.intentos) || 0) + 1

    const row = {
      id_test,
      id_empresa: orgId,
      id_usuario: auth.userId,
      estado,
      fecha_evaluacion,
      puntaje,
      intentos,
      test_titulo: test.titulo,
      nombre_usuario: avancePrev?.nombre_usuario || null,
      progreso_modulos: avancePrev?.progreso_modulos || { completados: [] },
    }

    let id_avance = avancePrev?.id_avance
    if (id_avance) {
      const { error } = await supabaseAdmin.from('avance_trabajador').update(row).eq('id_avance', id_avance)
      if (error) return jsonResponse({ error: error.message }, 500, req)
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from('avance_trabajador')
        .insert(row)
        .select('id_avance')
        .maybeSingle()
      if (error) return jsonResponse({ error: error.message }, 500, req)
      id_avance = inserted?.id_avance
    }

    let folio: string | null = null
    let cert_error: string | null = null
    if (estado === 'aprobada' && id_avance) {
      // Solo inserta si no existe (no pisar rol/rut de filas previas)
      const { error: usrEnsureErr } = await supabaseAdmin.from('usuario').upsert(
        {
          id_usuario: auth.userId,
          id_empresa: orgId,
          rut: 'CLERK-' + String(auth.userId).slice(-8),
          nombre_completo: avancePrev?.nombre_usuario || 'Colaborador',
          rol: 'trabajador',
          activo: true,
        },
        { onConflict: 'id_usuario', ignoreDuplicates: true },
      )
      if (usrEnsureErr) console.error('usuario ensure:', usrEnsureErr.message)

      const { data: cert, error: certErr } = await supabaseAdmin
        .from('certificado_emitido')
        .upsert(
          {
            id_avance,
            id_empresa: orgId,
            id_usuario: auth.userId,
            id_test,
            puntaje,
            porcentaje_minimo,
            test_titulo: test.titulo,
            archivo_pdf_url: null,
          },
          { onConflict: 'id_avance' },
        )
        .select('folio')
        .maybeSingle()

      if (certErr) {
        console.error('certificado_emitido:', certErr.message)
        cert_error = certErr.message
      } else {
        folio = cert?.folio ?? null
      }
    }

    return jsonResponse(
      {
        ok: true,
        id_avance,
        aprobada: estado === 'aprobada',
        estado,
        puntaje,
        correctas,
        total,
        porcentaje_minimo,
        folio,
        ...(cert_error ? { cert_error } : {}),
        avance: { ...row, id_avance },
      },
      200,
      req,
    )
  } catch (e) {
    if (e instanceof AuthError) return jsonResponse({ error: e.message }, e.status, req)
    return jsonResponse({ error: (e as Error)?.message || 'Error al publicar avance' }, 500, req)
  }
})
