import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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

function userIdFromClerkJwt(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.slice(7)
    const part = token.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    const clerkUserId = userIdFromClerkJwt(authHeader)
    if (!clerkUserId) return json({ error: 'Sin sesión' }, 401)

    const body = await req.json()
    const id_empresa = body.id_empresa
    const email_real = (body.email || body.email_real || '').trim().toLowerCase()
    const password_nueva = body.password || body.password_nueva
    const nombre_comercial = (body.nombre_comercial || '').trim()

    if (!id_empresa || !email_real || !password_nueva || !nombre_comercial) {
      return json({ error: 'Faltan datos' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_real)) {
      return json({ error: 'Correo inválido' }, 400)
    }
    if (String(password_nueva).length < 8) {
      return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: empresa, error: empErr } = await supabaseAdmin
      .from('empresa')
      .select('id_empresa, cuenta_estado, clerk_user_id, email_temporal')
      .eq('id_empresa', id_empresa)
      .maybeSingle()

    if (empErr || !empresa) return json({ error: 'Empresa no encontrada' }, 404)
    if (empresa.clerk_user_id !== clerkUserId) {
      return json({ error: 'No autorizado para esta empresa' }, 403)
    }
    if (empresa.cuenta_estado === 'deshabilitada') {
      return json({ error: 'Cuenta deshabilitada' }, 403)
    }
    if (!['temporal', 'pendiente_verificacion'].includes(empresa.cuenta_estado)) {
      return json({ error: 'La cuenta ya está verificada' }, 400)
    }

    await supabaseAdmin
      .from('empresa')
      .update({ cuenta_estado: 'pendiente_verificacion' })
      .eq('id_empresa', id_empresa)

    await clerk(`/users/${empresa.clerk_user_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        password: password_nueva,
        skip_password_checks: true,
        public_metadata: { rol: 'empresa', cuenta_temporal: false },
        first_name: nombre_comercial.split(/\s+/)[0]?.slice(0, 40) || 'Empresa',
        last_name: 'Admin',
      }),
    })

    try {
      const created = await clerk(`/email_addresses`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: empresa.clerk_user_id,
          email_address: email_real,
          verified: true,
          primary: true,
        }),
      })
      if (created?.id) {
        await clerk(`/users/${empresa.clerk_user_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ primary_email_address_id: created.id }),
        })
      }
    } catch (e) {
      console.warn('email Clerk:', (e as Error).message)
    }

    await clerk(`/organizations/${id_empresa}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: nombre_comercial.slice(0, 80) }),
    })

    const { error: upErr } = await supabaseAdmin
      .from('empresa')
      .update({
        nombre_comercial,
        email_contacto: email_real,
        cuenta_estado: 'verificada',
        modal_temporal_visto: true,
      })
      .eq('id_empresa', id_empresa)

    if (upErr) throw upErr

    await supabaseAdmin
      .from('usuario')
      .update({ nombre_completo: nombre_comercial, activo: true })
      .eq('id_usuario', empresa.clerk_user_id)

    return json({ ok: true, cuenta_estado: 'verificada' })
  } catch (error) {
    console.error('completar-cuenta-temporal:', error)
    return json({ error: (error as Error).message || String(error) }, 400)
  }
})
