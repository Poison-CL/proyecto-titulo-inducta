import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabasePublico = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/**
 * Cliente autenticado con JWT Clerk.
 * @param getToken - Clerk getToken
 * @param getOrgId - () => orgId activa (para que el claim org_id / o.id viaje en el token)
 */
export function createSupabaseClient(getToken, getOrgId) {
  const resolveOrgId = (organizationId) =>
    organizationId || (typeof getOrgId === 'function' ? getOrgId() : null)

  // JWT template supabase → PostgREST/RLS
  const resolveClerkToken = async (organizationId) => {
    const orgId = resolveOrgId(organizationId)
    return getToken({
      template: 'supabase',
      skipCache: true,
      ...(orgId ? { organizationId: orgId } : {}),
    })
  }

  // Sesión Clerk (sin template) → Edge Functions con requireClerkAuth (azp + org)
  const resolveClerkSessionToken = async (organizationId) => {
    const orgId = resolveOrgId(organizationId)
    return getToken({
      skipCache: true,
      ...(orgId ? { organizationId: orgId } : {}),
    })
  }

  const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await resolveClerkToken()
        const headers = new Headers(options?.headers)
        if (clerkToken) headers.set('Authorization', `Bearer ${clerkToken}`)
        return fetch(url, { ...options, headers })
      },
    },
  })

  client.__getClerkToken = resolveClerkToken
  client.__getClerkSessionToken = resolveClerkSessionToken
  return client
}
