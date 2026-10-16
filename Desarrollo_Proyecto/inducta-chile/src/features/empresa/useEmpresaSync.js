import { useOrganization } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'

export function useEmpresaSync() {
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const [synced, setSynced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!organization) return

      const { data } = await supabase
        .from('empresa')
        .select('id_empresa')
        .eq('id_empresa', organization.id)
        .maybeSingle()

      if (!cancelled) setSynced(Boolean(data))
    }

    check()
    return () => {
      cancelled = true
    }
  }, [organization, supabase])

  const sync = useCallback(async () => {
    if (!organization) return
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('empresa').insert([
      {
        id_empresa: organization.id,
        nombre_comercial: organization.name,
      },
    ])

    if (insertError) {
      setError(insertError.message)
      console.error('Error al registrar empresa:', insertError.message)
    } else {
      setSynced(true)
    }

    setLoading(false)
  }, [organization, supabase])

  return {
    organization,
    synced,
    loading,
    error,
    sync,
  }
}
