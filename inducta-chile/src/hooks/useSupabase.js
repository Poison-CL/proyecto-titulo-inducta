import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'

export function useSupabase() {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            fetch: async (url, options = {}) => {
              const token = await getToken({ template: 'supabase' })
              const headers = new Headers(options.headers)
              headers.set('Authorization', `Bearer ${token}`)
              return fetch(url, { ...options, headers })
            },
          },
        },
      ),
    [getToken],
  )
}
