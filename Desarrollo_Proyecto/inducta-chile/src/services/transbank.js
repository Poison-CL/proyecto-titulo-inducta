import { supabasePublico as supabase } from '../lib/supabase'

export const iniciarPagoTransbank = async (datosPago) => {
  const { data, error } = await supabase.functions.invoke('tbk-iniciar', {
    body: datosPago,
  })

  // 409 / 400 suelen venir en data.error aunque invoke marque error
  if (data?.error) {
    throw new Error(String(data.error))
  }

  if (error) {
    console.error('Error en Edge Function:', error)
    throw new Error('Error al conectar con el servidor de pagos')
  }

  if (!data?.token || !data?.url) {
    throw new Error('Respuesta inválida desde Transbank')
  }

  return data
}
