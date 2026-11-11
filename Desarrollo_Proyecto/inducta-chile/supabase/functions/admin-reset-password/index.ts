import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AuthError, requireClerkAuth } from '../_shared/clerkAuth.ts'
import { jsonResponse, optionsResponse } from '../_shared/cors.ts'

const ORG_INDUCTA = Deno.env.get('ORG_INDUCTA_ID') || 'org_3Kmnph0KjXr140vNE2SdpxPMYk9'

serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  try {
    const clerkKey = Deno.env.get('CLERK_SECRET_KEY')
    if (!clerkKey) return jsonResponse({ error: 'Falta CLERK_SECRET_KEY' }, 500, req)

    const auth = await requireClerkAuth(req, { requireOrg: true })
    if (auth.orgId !== ORG_INDUCTA) {
      return jsonResponse({ error: 'No autorizado' }, 403, req)
    }
    if (auth.orgRole !== 'org:administrador_inducta' && auth.orgRole !== 'org:admin') {
      // Confirmar membresía admin en la org Inducta vía API
      const memRes = await fetch(
        `https://api.clerk.com/v1/organizations/${ORG_INDUCTA}/memberships?user_id=${encodeURIComponent(auth.userId)}`,
        { headers: { Authorization: `Bearer ${clerkKey}` } },
      )
      const memData = await memRes.json().catch(() => ({}))
      const role = memData?.data?.[0]?.role || ''
      if (!memRes.ok || (role !== 'org:administrador_inducta' && role !== 'org:admin')) {
        return jsonResponse({ error: 'No autorizado' }, 403, req)
      }
    }

    const body = await req.json()
    const targetId = String(body.user_id || '').trim()
    const password = String(body.password || '')
    if (!targetId || password.length < 15) {
      return jsonResponse({ error: 'Faltan datos (mín. 15 caracteres)' }, 400, req)
    }

    // No resetear a miembros de la org Inducta
    const targetMem = await fetch(
      `https://api.clerk.com/v1/organizations/${ORG_INDUCTA}/memberships?user_id=${encodeURIComponent(targetId)}`,
      { headers: { Authorization: `Bearer ${clerkKey}` } },
    )
    const targetData = await targetMem.json().catch(() => ({}))
    if ((targetData?.data || []).length > 0) {
      return jsonResponse({ error: 'No se puede resetear usuarios de la org Inducta' }, 403, req)
    }

    const patch = await fetch(`https://api.clerk.com/v1/users/${targetId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${clerkKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
    const data = await patch.json().catch(() => ({}))
    if (!patch.ok) {
      return jsonResponse(
        { error: data?.errors?.[0]?.long_message || data?.message || 'Clerk error' },
        400,
        req,
      )
    }

    return jsonResponse({ ok: true, user_id: targetId }, 200, req)
  } catch (e) {
    if (e instanceof AuthError) return jsonResponse({ error: e.message }, e.status, req)
    return jsonResponse({ error: (e as Error).message }, 400, req)
  }
})
