import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const FRONTEND = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

function redirect(path: string, qs = '') {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${FRONTEND}${path}${qs}`,
      'Cache-Control': 'no-store',
    },
  })
}

async function provisionarCuentaTemporal(pago: Record<string, unknown>) {
  const base = Deno.env.get('SUPABASE_URL')
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const secret = Deno.env.get('INTERNAL_FUNCTION_SECRET') || service
  if (!base || !service) return { error: 'sin secrets' }

  const res = await fetch(`${base}/functions/v1/provisionar-cuenta-temporal`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json',
      'x-inducta-secret': secret || '',
    },
    body: JSON.stringify({
      id_pago: pago.id_pago,
      orden_compra: pago.orden_compra,
      token_transbank: pago.token_transbank,
      nombre_comercial: pago.nombre_comercial,
      email_contacto: pago.email_contacto,
      plan_solicitado: pago.plan_solicitado,
      periodo: pago.periodo,
      monto: pago.monto,
    }),
    signal: AbortSignal.timeout(25000),
  })
  return res.json().catch(() => ({ error: 'provisionar sin json' }))
}

serve(async (req) => {
  try {
    const url = new URL(req.url)
    let token_ws: string | null = url.searchParams.get('token_ws')
    let tbkTokenAbort: string | null = url.searchParams.get('TBK_TOKEN')
    let ordenAbort: string | null = url.searchParams.get('TBK_ORDEN_COMPRA')

    if (req.method === 'POST') {
      try {
        const formData = await req.formData()
        token_ws = (formData.get('token_ws') as string) || token_ws
        tbkTokenAbort = (formData.get('TBK_TOKEN') as string) || tbkTokenAbort
        ordenAbort = (formData.get('TBK_ORDEN_COMPRA') as string) || ordenAbort
      } catch {
        // body vacío
      }
    }

    if (!token_ws || token_ws === 'null') token_ws = null
    if (!tbkTokenAbort || tbkTokenAbort === 'null') tbkTokenAbort = null

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (tbkTokenAbort) {
      if (ordenAbort) {
        await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('orden_compra', ordenAbort)
      } else {
        await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('token_transbank', tbkTokenAbort)
      }
      const qs = ordenAbort ? `?orden=${encodeURIComponent(ordenAbort)}` : ''
      return redirect('/pago/anulado', qs)
    }

    if (!token_ws) return redirect('/pago/anulado')

    const tbkResponse = await fetch(
      `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`,
      {
        method: 'PUT',
        headers: {
          'Tbk-Api-Key-Id': '597055555532',
          'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      },
    )
    const tbkData = await tbkResponse.json()

    const orden = tbkData.buy_order ? String(tbkData.buy_order) : ''
    const monto = tbkData.amount != null ? String(tbkData.amount) : ''
    let qs = `?orden=${encodeURIComponent(orden)}&monto=${encodeURIComponent(monto)}`

    if (tbkData.status === 'AUTHORIZED') {
      await supabaseAdmin
        .from('pagos_transbank')
        .update({ estado: 'pagado', fecha_pago: new Date().toISOString() })
        .eq('token_transbank', token_ws)

      const { data: pago } = await supabaseAdmin
        .from('pagos_transbank')
        .select(
          'id_pago, plan_solicitado, periodo, id_empresa, email_contacto, nombre_comercial, orden_compra, token_transbank, monto',
        )
        .eq('token_transbank', token_ws)
        .maybeSingle()

      if (pago?.id_empresa && pago.plan_solicitado) {
        const dias = pago.periodo === 'anual' ? 365 : 30
        const vence = new Date()
        vence.setDate(vence.getDate() + dias)
        await supabaseAdmin
          .from('empresa')
          .update({
            plan: pago.plan_solicitado,
            periodo: pago.periodo === 'anual' ? 'anual' : 'mensual',
            plan_vence_en: vence.toISOString().slice(0, 10),
          })
          .eq('id_empresa', pago.id_empresa)
      } else if (pago?.email_contacto && pago?.nombre_comercial) {
        // Checkout nuevo: crear cuenta temporal + correo con credenciales
        try {
          const prov = await provisionarCuentaTemporal(pago)
          if (prov?.ok) qs += '&cuenta=temporal'
          else console.error('provisionar falló:', prov)
        } catch (e) {
          console.error('provisionar exception:', e)
        }
      }

      return redirect('/pago/exitoso', qs)
    }

    if (tbkData.status === 'ABORTED' || tbkData.status === 'INITIALIZED' || tbkData.error_message) {
      await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('token_transbank', token_ws)
      return redirect('/pago/anulado', qs)
    }

    await supabaseAdmin.from('pagos_transbank').update({ estado: 'rechazado' }).eq('token_transbank', token_ws)
    return redirect('/pago/rechazado', qs)
  } catch (error) {
    console.error('tbk-confirmar:', error)
    return redirect('/pago/rechazado', '?error=servidor')
  }
})
