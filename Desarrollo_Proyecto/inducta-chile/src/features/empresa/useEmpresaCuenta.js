import { useOrganization } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { CUENTA, esCuentaDeshabilitada, esCuentaTemporal } from '../../lib/cuentaEstado'

const CAMPOS =
  'id_empresa, nombre_comercial, email_contacto, email_temporal, plan, periodo, plan_vence_en, cuenta_estado, cuenta_temporal_creada_en, modal_temporal_visto, clerk_user_id'

export function useEmpresaCuenta() {
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!organization?.id) {
      setEmpresa(null)
      setLoading(false)
      return null
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
    return data
  }, [organization?.id, supabase])

  useEffect(() => {
    cargar()
  }, [cargar])

  const marcarModalVisto = useCallback(async () => {
    if (!organization?.id) return
    await supabase.from('empresa').update({ modal_temporal_visto: true }).eq('id_empresa', organization.id)
    setEmpresa((prev) => (prev ? { ...prev, modal_temporal_visto: true } : prev))
  }, [organization?.id, supabase])

  const estado = empresa?.cuenta_estado || CUENTA.VERIFICADA

  return {
    organization,
    empresa,
    loading,
    error,
    cargar,
    marcarModalVisto,
    estado,
    esTemporal: esCuentaTemporal(estado),
    esDeshabilitada: esCuentaDeshabilitada(estado),
    puedeEquipo: estado === CUENTA.VERIFICADA,
  }
}
