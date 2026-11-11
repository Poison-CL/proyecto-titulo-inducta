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
  const resolveClerkToken = async (organizationId) => {
    const orgId = organizationId || (typeof getOrgId === 'function' ? getOrgId() : null)
    return getToken({
      template: 'supabase',
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

  // Usado por programasService para edge functions (publicar-avance)
  client.__getClerkToken = resolveClerkToken
  return client
}
