import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import nodemailer from 'npm:nodemailer@6.9.16'
import { LOGO_AZUL_OSCURO_PNG_BASE64 } from './logoBase64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-inducta-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function claveAleatoria(largo = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%'
  const bytes = crypto.getRandomValues(new Uint8Array(largo))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function emailTemporal(orden: string) {
  const limpio = String(orden).toLowerCase().replace(/[^a-z0-9]/g, '').slice(-10) || 'pago'
  const suf = crypto.randomUUID().slice(0, 6)
  return `tmp.${limpio}.${suf}@tmp.inductachile.cl`
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
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.long_message || data?.message || `Clerk ${res.status}`)
  }
  return data
}

/**
 * Envío post-pago.
 * Antes: Resend HTTP (RESEND_API_KEY + EMAIL_FROM) — ya no se llama a api.resend.com.
 * Ahora: SMTP cPanel (happymax / correo propio) vía nodemailer.
 */
async function enviarResend(opts: {
  to: string
  orden: string
  monto: number | string
  plan: string
  emailTemp: string
  password: string
  nombre: string
  frontend: string
}) {
  const host = Deno.env.get('SMTP_HOST')?.trim()
  const portRaw = Deno.env.get('SMTP_PORT')?.trim()
  const user = Deno.env.get('SMTP_USER')?.trim()
  const pass = Deno.env.get('SMTP_PASS')
  const from = Deno.env.get('SMTP_FROM')?.trim()

  const faltantes = [
    !host && 'SMTP_HOST',
    !portRaw && 'SMTP_PORT',
    !user && 'SMTP_USER',
    !pass && 'SMTP_PASS',
    !from && 'SMTP_FROM',
  ].filter(Boolean) as string[]

  if (faltantes.length) {
    throw new Error(
      `Faltan variables SMTP en secrets: ${faltantes.join(', ')}. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM.`,
    )
  }

  const port = Number(portRaw)
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`SMTP_PORT inválido: ${portRaw}`)
  }

  // Logo incrustado (public/logo-azul-oscuro.png → base64); no depende de FRONTEND_URL
  const logoSrc = `data:image/png;base64,${LOGO_AZUL_OSCURO_PNG_BASE64}`

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d0d0d">
      <div style="text-align:center;padding:8px 0 20px">
        <img src="${logoSrc}" alt="Inducta Chile" width="160" height="auto"
          style="display:inline-block;max-width:160px;height:auto;border:0;outline:none" />
      </div>
      <h1 style="color:#1b22a7;font-size:22px">Pago exitoso</h1>
      <p>Recibimos su pago de <strong>$${Number(opts.monto).toLocaleString('es-CL')}</strong>
      (orden <strong>${opts.orden}</strong>) para el plan <strong>${opts.plan}</strong>.</p>
      <p><strong>Esta cuenta es temporal.</strong> Debe reemplazar el correo y la contraseña
      en el panel en menos de 24 horas. Si no lo hace, la cuenta se deshabilitará y luego se eliminará.</p>
      <h2 style="font-size:16px;margin-top:24px">Credenciales temporales</h2>
      <ul>
        <li>Empresa: ${opts.nombre}</li>
        <li>Correo de acceso: <code>${opts.emailTemp}</code></li>
        <li>Contraseña: <code>${opts.password}</code></li>
      </ul>
      <p>Ingrese aquí: <a href="${opts.frontend}/entrar?rol=empresa">${opts.frontend}/entrar?rol=empresa</a></p>
      <p style="color:#666;font-size:13px">Los datos del pago quedan solo como referencia histórica.
      Al primer acceso verá un aviso obligatorio para completar sus datos reales.</p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: 'Inducta Chile — pago exitoso y acceso temporal',
    html,
  })

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const auth = req.headers.get('Authorization') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!auth.includes(serviceKey) && auth !== `Bearer ${serviceKey}`) {
      // Solo el backend (tbk-confirmar) o service role puede provisionar
      const internal = Deno.env.get('INTERNAL_FUNCTION_SECRET')
      if (!internal || req.headers.get('x-inducta-secret') !== internal) {
        return json({ error: 'No autorizado' }, 401)
      }
    }

    const body = await req.json()
    const {
      orden_compra,
      token_transbank,
      nombre_comercial,
      email_contacto,
      plan_solicitado,
      periodo,
      monto,
      id_pago,
    } = body

    if (!orden_compra || !email_contacto || !nombre_comercial) {
      return json({ error: 'Faltan datos del pago' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Idempotencia: si el pago ya tiene empresa, no recrear
    if (id_pago) {
      const { data: ya } = await supabase
        .from('empresa')
        .select('id_empresa, email_temporal, cuenta_estado')
        .eq('id_pago_origen', id_pago)
        .maybeSingle()
      if (ya) return json({ ok: true, already: true, id_empresa: ya.id_empresa })
    }

    const password = claveAleatoria(14)
    const emailTemp = emailTemporal(orden_compra)
    const frontend = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'
    const adminRole = Deno.env.get('CLERK_ORG_ADMIN_ROLE') || 'org:administrador_inducta'
    const planDias = periodo === 'anual' ? 365 : 30
    const planVence = new Date()
    planVence.setDate(planVence.getDate() + planDias)

    const user = await clerk('/users', {
      method: 'POST',
      body: JSON.stringify({
        email_address: [emailTemp],
        password,
        skip_password_checks: true,
        public_metadata: { rol: 'empresa', cuenta_temporal: true },
        first_name: 'Acceso',
        last_name: 'Temporal',
      }),
    })

    // created_by ya deja al usuario como admin de la org; no re-crear membership
    const org = await clerk('/organizations', {
      method: 'POST',
      body: JSON.stringify({
        name: nombre_comercial.slice(0, 80),
        created_by: user.id,
        public_metadata: { plan: plan_solicitado || 'basico' },
      }),
    })

    // Opcional: alinear rol custom si existe en la instancia
    try {
      await clerk(`/organizations/${org.id}/memberships/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: adminRole }),
      })
    } catch {
      // Si el rol custom no existe, el membership por defecto (org:admin) basta
    }

    const { data: empresa, error: empErr } = await supabase
      .from('empresa')
      .insert({
        id_empresa: org.id,
        nombre_comercial,
        email_contacto,
        email_temporal: emailTemp,
        clerk_user_id: user.id,
        plan: plan_solicitado || 'basico',
        periodo: periodo === 'anual' ? 'anual' : 'mensual',
        plan_vence_en: planVence.toISOString().slice(0, 10),
        cuenta_estado: 'temporal',
        cuenta_temporal_creada_en: new Date().toISOString(),
        modal_temporal_visto: false,
        id_pago_origen: id_pago ?? null,
      })
      .select('id_empresa')
      .single()

    if (empErr) throw empErr

    if (token_transbank) {
      await supabase
        .from('pagos_transbank')
        .update({ id_empresa: org.id })
        .eq('token_transbank', token_transbank)
    } else if (orden_compra) {
      await supabase.from('pagos_transbank').update({ id_empresa: org.id }).eq('orden_compra', orden_compra)
    }

    // rut es NOT NULL en schema; placeholder hasta verificar cuenta
    const { error: usrErr } = await supabase.from('usuario').upsert(
      {
        id_usuario: user.id,
        id_empresa: org.id,
        rut: 'TEMP-' + user.id.slice(-8),
        nombre_completo: 'Acceso Temporal',
        rol: 'admin',
        activo: true,
      },
      { onConflict: 'id_usuario' },
    )
    if (usrErr) console.error('usuario upsert:', usrErr.message)

    let emailResult: Record<string, unknown> = {}
    try {
      emailResult = (await enviarResend({
        to: email_contacto,
        orden: orden_compra,
        monto: monto ?? 0,
        plan: plan_solicitado || 'basico',
        emailTemp,
        password,
        nombre: nombre_comercial,
        frontend,
      })) as Record<string, unknown>
    } catch (mailErr) {
      // Cuenta ya creada: no revertir por fallo de correo
      console.error('Resend falló:', (mailErr as Error).message)
      emailResult = { error: (mailErr as Error).message }
    }

    return json({
      ok: true,
      id_empresa: empresa.id_empresa,
      email_temporal: emailTemp,
      email: emailResult,
      // La contraseña solo viaja por correo; no la devolvemos al cliente público.
    })
  } catch (error) {
    console.error('provisionar-cuenta-temporal:', error)
    return json({ error: error.message || String(error) }, 400)
  }
})
