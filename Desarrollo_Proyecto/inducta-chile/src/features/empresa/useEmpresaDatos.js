import { useOrganization } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'

const CAMPOS = 'id_empresa, nombre_comercial, email_contacto, plan, periodo, plan_vence_en, fecha_registro'

export function useEmpresaDatos() {
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!organization?.id) {
      setEmpresa(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('empresa')
      .select(CAMPOS)
      .eq('id_empresa', organization.id)
      .maybeSingle()
    if (err) setError(err.message)
    setEmpresa(data)
    setLoading(false)
  }, [organization?.id, supabase])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = useCallback(
    async (campos) => {
      if (!organization?.id) return { ok: false, error: 'Sin organización activa' }
      setSaving(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('empresa')
        .update(campos)
        .eq('id_empresa', organization.id)
        .select(CAMPOS)
        .maybeSingle()
      setSaving(false)
      if (err) {
        setError(err.message)
        return { ok: false, error: err.message }
      }
      setEmpresa(data)
      return { ok: true }
    },
    [organization?.id, supabase],
  )

  return { organization, empresa, loading, saving, error, cargar, guardar }
}
