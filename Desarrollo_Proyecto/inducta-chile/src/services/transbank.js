import { createClient } from '@supabase/supabase-js'
import { env } from '../lib/env'

// Creamos un cliente público para invocar la Edge Function sin depender de Clerk
const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

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