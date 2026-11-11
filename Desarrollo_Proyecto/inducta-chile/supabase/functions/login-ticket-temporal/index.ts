import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, jsonResponse, optionsResponse } from '../_shared/cors.ts'

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
    throw Object.assign(
      new Error(data?.errors?.[0]?.long_message || data?.message || `Clerk ${res.status}`),
      { status: res.status },
    )
  }
  return data
}

function esTemporal(email: string) {
  return email.endsWith('@tmp.inductachile.cl')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  try {
    const body = await req.json()
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return jsonResponse({ error: 'Faltan credenciales' }, 400, req)
    }
    if (!esTemporal(email)) {
      return jsonResponse({ error: 'Solo para cuentas temporales' }, 400, req)
    }

    const found = await clerk(`/users?email_address=${encodeURIComponent(email)}`)
    const user = Array.isArray(found) ? found[0] : found?.data?.[0]
    if (!user?.id) return jsonResponse({ error: 'Cuenta no encontrada' }, 404, req)

    await clerk(`/users/${user.id}/verify_password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    })

    const token = await clerk('/sign_in_tokens', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, expires_in_seconds: 300 }),
    })

    if (!token?.token) {
      return jsonResponse({ error: 'No se pudo crear el ticket' }, 500, req)
    }

    return jsonResponse({ ticket: token.token }, 200, req)
  } catch (e) {
    const err = e as Error & { status?: number }
    const status = err.status === 422 || err.status === 400 ? 401 : 400
    return jsonResponse({ error: err.message || 'Error' }, status, req)
  }
})
