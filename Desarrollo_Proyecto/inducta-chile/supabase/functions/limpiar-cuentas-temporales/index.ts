import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import nodemailer from 'npm:nodemailer@6.9.16'

/**
 * Cron diario:
 * - > 1 día en temporal/pendiente → deshabilitar (Clerk ban + estado deshabilitada)
 * - > 1 día deshabilitada → borrar fila empresa en Supabase (+ usuario) y borrar org/user Clerk
 *
 * Body `{ "force": true }` (mismo secret): borra YA todas las temporal/pendiente/deshabilitada.
 * Body `{ "reenviar_acceso": { "id_empresa", "email" } }`: nueva clave + mail.
 */
function claveAleatoria(largo = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%'
  const bytes = crypto.getRandomValues(new Uint8Array(largo))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

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

async function borrarEmpresa(
  supabase: ReturnType<typeof createClient>,
  e: { id_empresa: string; clerk_user_id?: string | null },
  resumen: { borradas: number; errores: string[] },
) {
  try {
    await supabase.from('pagos_transbank').update({ id_empresa: null }).eq('id_empresa', e.id_empresa)
    // Dependencias típicas de una org de prueba
    await supabase.from('certificado_emitido').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('avance_trabajador').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('opcion_respuesta').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('pregunta').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('test_induccion').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('usuario').delete().eq('id_empresa', e.id_empresa)
    await supabase.from('empresa').delete().eq('id_empresa', e.id_empresa)
    resumen.borradas++
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

serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET') || Deno.env.get('INTERNAL_FUNCTION_SECRET')
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Falta CRON_SECRET' }), { status: 500 })
  }
  if (req.headers.get('x-inducta-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }

  let force = false
  let deleteClerkEmail = ''
  let reenviar: { id_empresa?: string; email?: string } | null = null
  try {
    if (req.method !== 'GET') {
      const body = await req.json().catch(() => ({}))
      force = Boolean(body?.force)
      deleteClerkEmail = String(body?.delete_clerk_email || '')
        .trim()
        .toLowerCase()
      if (body?.reenviar_acceso) reenviar = body.reenviar_acceso
    }
  } catch {
    force = false
  }

  if (reenviar?.id_empresa && reenviar?.email) {
    const email = String(reenviar.email).trim().toLowerCase()
    const idEmpresa = String(reenviar.id_empresa)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    try {
      const { data: emp, error: empErr } = await supabase
        .from('empresa')
        .select('id_empresa, clerk_user_id, nombre_comercial, email_contacto, plan, id_pago_origen')
        .eq('id_empresa', idEmpresa)
        .maybeSingle()
      if (empErr || !emp?.clerk_user_id) {
        return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), { status: 404 })
      }

      const password = claveAleatoria(16)
      await clerk(`/users/${emp.clerk_user_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ password }),
      })

      try {
        const created = await clerk('/email_addresses', {
          method: 'POST',
          body: JSON.stringify({
            user_id: emp.clerk_user_id,
            email_address: email,
            verified: true,
            primary: true,
          }),
        })
        if (created?.id) {
          await clerk(`/users/${emp.clerk_user_id}`, {
            method: 'PATCH',
            body: JSON.stringify({ primary_email_address_id: created.id }),
          })
        }
      } catch (e) {
        // Si el correo ya está en este user, sigue; si está en otro, falla.
        const msg = (e as Error).message || ''
        if (!/taken|already|exists/i.test(msg)) throw e
      }

      await supabase.from('empresa').update({ email_contacto: email }).eq('id_empresa', idEmpresa)

      let orden = idEmpresa
      let monto: number | string = ''
      let plan = emp.plan || ''
      if (emp.id_pago_origen) {
        const { data: pago } = await supabase
          .from('pagos_transbank')
          .select('orden_compra, monto, plan_solicitado')
          .eq('id_pago', emp.id_pago_origen)
          .maybeSingle()
        if (pago) {
          orden = pago.orden_compra || orden
          monto = pago.monto ?? ''
          plan = pago.plan_solicitado || plan
        }
      }

      const frontend =
        String(Deno.env.get('FRONTEND_URL') ?? 'https://inducta-chile.onrender.com')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)[0] || 'https://inducta-chile.onrender.com'

      const host = Deno.env.get('SMTP_HOST')?.trim()
      const port = Number(Deno.env.get('SMTP_PORT')?.trim())
      const user = Deno.env.get('SMTP_USER')?.trim()
      const pass = Deno.env.get('SMTP_PASS')
      const from = Deno.env.get('SMTP_FROM')?.trim()
      if (!host || !port || !user || !pass || !from) {
        throw new Error('Faltan secrets SMTP')
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
      const info = await transporter.sendMail({
        from,
        to: email,
        subject: 'Inducta Chile — acceso temporal (reenvío)',
        html: `
          <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d">
            <h1 style="color:#1b22a7;font-size:22px">Acceso temporal</h1>
            <p>Orden <strong>${orden}</strong>${monto !== '' ? ` — $${Number(monto).toLocaleString('es-CL')}` : ''}
            ${plan ? ` (plan <strong>${plan}</strong>)` : ''}.</p>
            <ul>
              <li>Empresa: ${emp.nombre_comercial || ''}</li>
              <li>Correo de acceso: <code>${email}</code></li>
              <li>Contraseña: <code>${password}</code></li>
            </ul>
            <p><a href="${frontend}/entrar?rol=empresa">${frontend}/entrar?rol=empresa</a></p>
          </div>`,
      })

      return new Response(
        JSON.stringify({
          ok: true,
          email,
          id_empresa: idEmpresa,
          mail: { messageId: info.messageId, accepted: info.accepted },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Escape hatch: borrar un user Clerk por email (pruebas / email tomado).
  if (deleteClerkEmail) {
    try {
      const found = await clerk(`/users?email_address=${encodeURIComponent(deleteClerkEmail)}`)
      const user = Array.isArray(found) ? found[0] : found?.data?.[0]
      if (!user?.id) {
        return new Response(JSON.stringify({ ok: true, deleted: false, reason: 'not_found' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
      // Borrar memberships/orgs creadas por este user si existen
      try {
        const orgs = await clerk(`/users/${user.id}/organization_memberships`)
        const list = Array.isArray(orgs) ? orgs : orgs?.data || []
        for (const m of list) {
          const orgId = m?.organization?.id
          if (orgId) {
            try {
              await clerk(`/organizations/${orgId}`, { method: 'DELETE' })
            } catch {
              /* org compartida u otra */
            }
          }
        }
      } catch {
        /* ignore */
      }
      await clerk(`/users/${user.id}`, { method: 'DELETE' })
      return new Response(JSON.stringify({ ok: true, deleted: true, user_id: user.id }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const ahora = Date.now()
  const diaMs = 24 * 60 * 60 * 1000
  const resumen = { force, deshabilitadas: 0, borradas: 0, errores: [] as string[] }

  if (force) {
    const { data: todas } = await supabase
      .from('empresa')
      .select('id_empresa, clerk_user_id, cuenta_estado')
      .in('cuenta_estado', ['temporal', 'pendiente_verificacion', 'deshabilitada'])

    for (const e of todas || []) {
      await borrarEmpresa(supabase, e, resumen)
    }
    return new Response(JSON.stringify({ ok: true, ...resumen }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

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
    await borrarEmpresa(supabase, e, resumen)
  }

  return new Response(JSON.stringify({ ok: true, ...resumen }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
