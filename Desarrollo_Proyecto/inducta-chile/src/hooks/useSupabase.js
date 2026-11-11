import { useAuth, useOrganization } from '@clerk/clerk-react'
import { useMemo, useRef } from 'react'
import { createSupabaseClient } from '../lib/supabase'

export function useSupabase() {
  const { getToken } = useAuth()
  const { organization } = useOrganization()
  const orgIdRef = useRef(organization?.id || null)
  orgIdRef.current = organization?.id || null

  return useMemo(
    () => createSupabaseClient(getToken, () => orgIdRef.current),
    [getToken, organization?.id],
  )
}
