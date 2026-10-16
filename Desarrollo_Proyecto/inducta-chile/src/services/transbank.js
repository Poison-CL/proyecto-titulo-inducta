import { supabasePublico as supabase } from '../lib/supabase'

export const iniciarPagoTransbank = async (datosPago) => {
  const { data, error } = await supabase.functions.invoke('tbk-iniciar', {
    body: datosPago
  })

  if (error) {
    console.error("Error en Edge Function:", error)
    throw new Error('Error al conectar con el servidor de pagos')
  }

  if (!data?.token || !data?.url) {
    console.error("Detalle del rechazo de Transbank:", data) // <-- Añade esta línea
    throw new Error('Respuesta inválida desde Transbank')
  }

  return data
}