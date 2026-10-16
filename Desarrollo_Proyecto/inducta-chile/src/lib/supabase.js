import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabasePublico = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export function createSupabaseClient(getToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({ template: 'supabase' })
        const headers = new Headers(options?.headers)
        headers.set('Authorization', `Bearer ${clerkToken}`)
        return fetch(url, { ...options, headers })
      },
    },
  })
}
