import { useAuth } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

export const useSupabase = () => {
  const { getToken } = useAuth()

  return useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
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
      }
    )
  }, [getToken])
}