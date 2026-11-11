import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import nodemailer from 'npm:nodemailer@6.9.16'
import { AuthError, requireClerkAuth } from '../_shared/clerkAuth.ts'
import { jsonResponse, optionsResponse } from '../_shared/cors.ts'

const ORG_INDUCTA = Deno.env.get('ORG_INDUCTA_ID') || 'org_3Kmnph0KjXr140vNE2SdpxPMYk9'

function json(body: unknown, status = 200, req?: Request) {
  return jsonResponse(body, status, req)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nombreDesdeMembership(m: {
  public_user_data?: { first_name?: string; last_name?: string; identifier?: string }
}): string {
  const p = m?.public_user_data
  const nombre = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim()
  return nombre || p?.identifier || 'Agente Inducta'
}

async function assertMiembroInducta(callerId: string) {
  const clerkKey = Deno.env.get('CLERK_SECRET_KEY')
  if (!clerkKey) throw Object.assign(new Error('Falta CLERK_SECRET_KEY'), { status: 500 })

  const memRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(callerId)}/organization_memberships?limit=50`,
    { headers: { Authorization: `Bearer ${clerkKey}` } },
  )
  const memData = await memRes.json().catch(() => ({}))
  if (!memRes.ok) {
    throw Object.assign(
      new Error(memData?.errors?.[0]?.long_message || memData?.message || 'No se pudo validar membresía Clerk'),
      { status: 403 },
    )
  }

  const memberships = memData?.data || []
  const enInducta = memberships.find(
    (m: { organization?: { id?: string } }) => m?.organization?.id === ORG_INDUCTA,
  )
  if (!enInducta) {
    throw Object.assign(
      new Error('No autorizado: su usuario no pertenece a la organización Inducta de soporte.'),
      { status: 403 },
    )
  }
  return { membership: enInducta, displayName: nombreDesdeMembership(enInducta) }
}

function smtpConfig() {
  const host = Deno.env.get('SMTP_HOST')?.trim()
  const portRaw = Deno.env.get('SMTP_PORT')?.trim()
  const user = (Deno.env.get('SMTP_USER') || Deno.env.get('SMTP_USE'))?.trim()
  const pass = Deno.env.get('SMTP_PASS')
  const from = Deno.env.get('SMTP_FROM')?.trim()

  const faltantes = [
    !host && 'SMTP_HOST',
    !portRaw && 'SMTP_PORT',
    !user && 'SMTP_USER',
    !pass && 'SMTP_PASS',
    !from && 'SMTP_FROM',
  ].filter(Boolean) as string[]

  if (faltantes.length) throw new Error(`Faltan secrets SMTP: ${faltantes.join(', ')}`)

  const port = Number(portRaw)
  if (!Number.isFinite(port) || port <= 0) throw new Error(`SMTP_PORT inválido: ${portRaw}`)

  return { host, port, user, pass, from }
}

async function enviarCorreo(opts: {
  to: string
  nombre: string
  motivo: string
  mensajeOriginal: string
  respuesta: string
}) {
  const { host, port, user, pass, from } = smtpConfig()

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d;line-height:1.5">
      <p style="color:#1b22a7;font-weight:600;margin:0 0 16px">Inducta Chile · Soporte</p>
      <p>Hola ${escapeHtml(opts.nombre || '')},</p>
      <div style="white-space:pre-wrap">${escapeHtml(opts.respuesta)}</div>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0" />
      <p style="font-size:12px;color:#666;margin:0 0 8px">Su consulta (${escapeHtml(opts.motivo || 'consulta')}):</p>
      <blockquote style="margin:0;padding:12px 14px;background:#f7f7fb;border-radius:8px;color:#444;white-space:pre-wrap;font-size:13px">
        ${escapeHtml(opts.mensajeOriginal || '')}
      </blockquote>
      <p style="font-size:12px;color:#888;margin-top:24px">Respuesta enviada desde el panel de soporte de Inducta Chile.</p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  })

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    replyTo: from,
    subject: `Inducta Chile · Re: ${opts.motivo || 'su consulta'}`,
    html,
    text: `Hola ${opts.nombre || ''},\n\n${opts.respuesta}\n\n---\nSu consulta:\n${opts.mensajeOriginal || ''}\n`,
  })

  const accepted = (info.accepted || []).map(String)
  const rejected = (info.rejected || []).map(String)
  if (!accepted.length || rejected.includes(opts.to)) {
    throw new Error(
      `El servidor SMTP no aceptó el destinatario ${opts.to}. accepted=${JSON.stringify(accepted)} rejected=${JSON.stringify(rejected)}`,
    )
  }

  return {
    messageId: info.messageId,
    accepted,
    rejected,
    response: info.response,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  try {
    const auth = await requireClerkAuth(req)
    const callerId = auth.userId

    const { displayName } = await assertMiembroInducta(callerId)

    const body = await req.json()
    const contactoId = Number(body.contacto_id)
    const respuesta = String(body.respuesta || body.cuerpo || '').trim()
    // Por defecto NO cierra el ticket; el agente cierra a mano.
    const marcarAtendido = body.marcar_atendido === true
    const enviarEmail = body.enviar_email !== false
    const agente =
      String(body.agente_nombre || '').trim().slice(0, 120) || displayName

    if (!Number.isFinite(contactoId) || contactoId <= 0) {
      return json({ error: 'contacto_id inválido' }, 400)
    }
    if (respuesta.length < 1) return json({ error: 'Escriba un mensaje' }, 400)
    if (respuesta.length > 5000) return json({ error: 'El mensaje es demasiado largo' }, 400)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) return json({ error: 'Falta configuración Supabase' }, 500)

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: ticket, error: errTicket } = await admin
      .from('contactos')
      .select('id, nombre, email, motivo, mensaje, estado')
      .eq('id', contactoId)
      .maybeSingle()

    if (errTicket) return json({ error: errTicket.message }, 400)
    if (!ticket) return json({ error: 'Ticket no encontrado' }, 404)
    if (!ticket.email) return json({ error: 'El ticket no tiene correo' }, 400)

    // Asegurar mensaje inicial del cliente en el hilo
    const { count } = await admin
      .from('soporte_mensajes')
      .select('id', { count: 'exact', head: true })
      .eq('contacto_id', contactoId)
      .eq('autor', 'cliente')

    if (!count) {
      await admin.from('soporte_mensajes').insert({
        contacto_id: contactoId,
        autor: 'cliente',
        cuerpo: ticket.mensaje || '(sin mensaje)',
        email_enviado: false,
      })
    }

    let emailOk = false
    let emailError: string | null = null
    let mailMeta: Record<string, unknown> | null = null

    if (enviarEmail) {
      try {
        mailMeta = await enviarCorreo({
          to: ticket.email,
          nombre: ticket.nombre || '',
          motivo: ticket.motivo || 'consulta',
          mensajeOriginal: ticket.mensaje || '',
          respuesta,
        })
        emailOk = true
      } catch (e) {
        emailError = (e as Error).message
        emailOk = false
      }
    }

    const { data: msg, error: errMsg } = await admin
      .from('soporte_mensajes')
      .insert({
        contacto_id: contactoId,
        autor: 'soporte',
        cuerpo: respuesta,
        email_enviado: emailOk,
        email_error: emailError,
        creado_por: agente,
      })
      .select('id, contacto_id, autor, cuerpo, email_enviado, email_error, creado_por, creado_en')
      .single()

    if (errMsg) return json({ error: `No se guardó el mensaje: ${errMsg.message}`, email_ok: emailOk, email_error: emailError }, 400)

    const patch: Record<string, unknown> = {
      respuesta,
      respondido_en: new Date().toISOString(),
      respondido_por: agente,
    }

    if (marcarAtendido) {
      patch.estado = 'atendido'
      patch.atendido_en = new Date().toISOString()
    } else if ((ticket.estado || 'pendiente') === 'pendiente') {
      patch.estado = 'en_curso'
    }

    await admin.from('contactos').update(patch).eq('id', contactoId)

    if (enviarEmail && !emailOk) {
      return json(
        {
          ok: false,
          mensaje_guardado: true,
          email_ok: false,
          error: emailError || 'No se pudo enviar el correo',
          mensaje: msg,
        },
        502,
      )
    }

    return json({
      ok: true,
      email_ok: emailOk,
      to: ticket.email,
      messageId: mailMeta?.messageId,
      smtp: mailMeta,
      mensaje: msg,
      estado: patch.estado || ticket.estado,
    })
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, req)
    const status = (e as Error & { status?: number }).status || 400
    return json({ error: (e as Error).message || 'Error desconocido' }, status, req)
  }
})
