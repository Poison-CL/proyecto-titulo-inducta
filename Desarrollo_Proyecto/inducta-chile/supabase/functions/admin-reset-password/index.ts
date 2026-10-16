import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ORG_INDUCTA = 'org_3Kmnph0KjXr140vNE2SdpxPMYk9'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function userIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const part = authHeader.slice(7).split('.')[1]
    if (!part) return null
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const clerkKey = Deno.env.get('CLERK_SECRET_KEY')
    if (!clerkKey) return json({ error: 'Falta CLERK_SECRET_KEY' }, 500)

    const callerId = userIdFromJwt(req.headers.get('Authorization'))
    if (!callerId) return json({ error: 'Sin sesión' }, 401)

    const body = await req.json()
    const targetId = String(body.user_id || '').trim()
    const password = String(body.password || '')
    if (!targetId || password.length < 8) return json({ error: 'Faltan datos' }, 400)

    // Caller debe ser miembro admin de la org Inducta
    const memRes = await fetch(
      `https://api.clerk.com/v1/organizations/${ORG_INDUCTA}/memberships?user_id=${encodeURIComponent(callerId)}`,
      { headers: { Authorization: `Bearer ${clerkKey}` } },
    )
    const memData = await memRes.json().catch(() => ({}))
    const memberships = memData?.data || []
    const role = memberships[0]?.role || ''
    const esAdmin =
      role === 'org:administrador_inducta' ||
      role === 'org:admin' ||
      /administrador/i.test(role)
    if (!memRes.ok || !esAdmin) return json({ error: 'No autorizado' }, 403)

    const patch = await fetch(`https://api.clerk.com/v1/users/${targetId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${clerkKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, skip_password_checks: true }),
    })
    const data = await patch.json().catch(() => ({}))
    if (!patch.ok) {
      return json({ error: data?.errors?.[0]?.long_message || data?.message || 'Clerk error' }, 400)
    }

    return json({ ok: true, user_id: targetId })
  } catch (e) {
    return json({ error: (e as Error).message }, 400)
  }
})
