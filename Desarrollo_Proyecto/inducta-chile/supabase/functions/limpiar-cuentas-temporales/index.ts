import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

/**
 * Cron diario:
 * - > 1 día en temporal/pendiente → deshabilitar (Clerk ban + estado deshabilitada)
 * - > 1 día deshabilitada → borrar fila empresa en Supabase (+ usuario) y borrar org/user Clerk
 */
async function clerk(path: string, init: RequestInit = {}) {
  const key = Deno.env.get('CLERK_SECRET_KEY')
  if (!key) throw new Error('Falta CLERK_SECRET_KEY')
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (res.status === 404) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `Clerk ${res.status}`)
  return data
}

serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET') || Deno.env.get('INTERNAL_FUNCTION_SECRET')
  if (secret && req.headers.get('x-inducta-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const ahora = Date.now()
  const diaMs = 24 * 60 * 60 * 1000
  // ponytail: misma regla que src/lib/cuentaTemporalLifecycle.js (deshabilitar ≥1d, borrar ≥1d deshabilitada)
  const resumen = { deshabilitadas: 0, borradas: 0, errores: [] as string[] }

  const { data: temporales } = await supabase
    .from('empresa')
    .select('id_empresa, clerk_user_id, cuenta_temporal_creada_en, cuenta_estado')
    .in('cuenta_estado', ['temporal', 'pendiente_verificacion'])

  for (const e of temporales || []) {
    const creada = e.cuenta_temporal_creada_en ? new Date(e.cuenta_temporal_creada_en).getTime() : 0
    if (!creada || ahora - creada < diaMs) continue
    try {
      if (e.clerk_user_id && Deno.env.get('CLERK_SECRET_KEY')) {
        try {
          await clerk(`/users/${e.clerk_user_id}/ban`, { method: 'POST' })
        } catch (cerr) {
          resumen.errores.push(`clerk-ban ${e.id_empresa}: ${(cerr as Error).message}`)
        }
      }
      await supabase
        .from('empresa')
        .update({
          cuenta_estado: 'deshabilitada',
          cuenta_deshabilitada_en: new Date().toISOString(),
        })
        .eq('id_empresa', e.id_empresa)
      resumen.deshabilitadas++
    } catch (err) {
      resumen.errores.push(`disable ${e.id_empresa}: ${(err as Error).message}`)
    }
  }

  const { data: deshab } = await supabase
    .from('empresa')
    .select('id_empresa, clerk_user_id, cuenta_deshabilitada_en')
    .eq('cuenta_estado', 'deshabilitada')

  for (const e of deshab || []) {
    const desde = e.cuenta_deshabilitada_en ? new Date(e.cuenta_deshabilitada_en).getTime() : 0
    if (!desde || ahora - desde < diaMs) continue
    try {
      // Pago queda como histórico; null antes de borrar empresa
      await supabase.from('pagos_transbank').update({ id_empresa: null }).eq('id_empresa', e.id_empresa)
      await supabase.from('usuario').delete().eq('id_empresa', e.id_empresa)
      await supabase.from('empresa').delete().eq('id_empresa', e.id_empresa)
      resumen.borradas++
      // Clerk opcional: si falta secret, la fila ya quedó borrada en Supabase
      if (Deno.env.get('CLERK_SECRET_KEY')) {
        try {
          if (e.clerk_user_id) await clerk(`/users/${e.clerk_user_id}`, { method: 'DELETE' })
          await clerk(`/organizations/${e.id_empresa}`, { method: 'DELETE' })
        } catch (cerr) {
          resumen.errores.push(`clerk-delete ${e.id_empresa}: ${(cerr as Error).message}`)
        }
      }
    } catch (err) {
      resumen.errores.push(`delete ${e.id_empresa}: ${(err as Error).message}`)
    }
  }

  return new Response(JSON.stringify({ ok: true, ...resumen }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
