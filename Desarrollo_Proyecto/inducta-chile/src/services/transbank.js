import { supabasePublico as supabase } from '../lib/supabase'

async function mensajeDesdeInvoke(data, error) {
  if (data?.error) return String(data.error)
  const ctx = error?.context
  if (!ctx || typeof ctx.json !== 'function') return null
  try {
    const body = await ctx.json()
    if (body?.error) return String(body.error)
  } catch {
    // cuerpo no JSON
  }
  return null
}

export const iniciarPagoTransbank = async (datosPago) => {
  const { data, error } = await supabase.functions.invoke('tbk-iniciar', {
    body: datosPago,
  })

  const msgNegocio = await mensajeDesdeInvoke(data, error)
  if (msgNegocio) {
    const err = new Error(msgNegocio)
    err.code = data?.code || undefined
    throw err
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
