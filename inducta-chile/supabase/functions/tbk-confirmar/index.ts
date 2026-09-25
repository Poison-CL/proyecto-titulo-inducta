import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const FRONTEND = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

function redirect(path: string, qs = '') {
  const url = `${FRONTEND}${path}${qs}`
  return new Response(null, {
    status: 303,
    headers: {
      Location: url,
      'Cache-Control': 'no-store',
    },
  })
}

serve(async (req) => {
  const volver = 'http://localhost:5173/contratar?error=pago_fallido'

  try {
    const url = new URL(req.url)
Mateo-Martinez-Gijon
    let token_ws = url.searchParams.get('token_ws')
    let tbkToken = url.searchParams.get('TBK_TOKEN')
    if (req.method === 'POST') {
      const formData = await req.formData()
      token_ws = token_ws || String(formData.get('token_ws') ?? '')
      tbkToken = tbkToken || String(formData.get('TBK_TOKEN') ?? '')
    }
    if (!token_ws || token_ws === 'null') token_ws = null
    if (!tbkToken || tbkToken === 'null') tbkToken = null

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Anulación o timeout: Webpay manda TBK_TOKEN y no hay que confirmar.
    if (tbkToken) {
      await supabaseAdmin.from('pagos_transbank').delete().eq('token_transbank', String(tbkToken))
      return Response.redirect(volver, 302)
    }

    if (!token_ws) return Response.redirect(volver, 302)

    const tbkResponse = await fetch(`https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`, {
      method: 'PUT',
      headers: {
        'Tbk-Api-Key-Id': '597055555532',
        'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
        'Content-Type': 'application/json'
      }
    })
    const tbkData = await tbkResponse.json()

    if (tbkResponse.ok && tbkData.status === 'AUTHORIZED') {
      await supabaseAdmin.from('pagos_transbank')
        .update({ estado: 'pagado' })
        .eq('token_transbank', token_ws)
      return Response.redirect('http://localhost:5173/pago-exitoso', 302)
    }

    await supabaseAdmin.from('pagos_transbank').delete().eq('token_transbank', token_ws)
    return Response.redirect(volver, 302)
  } catch {
    return Response.redirect('http://localhost:5173/contratar?error=servidor', 302)

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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. EL USUARIO ANULÓ (Ahora solo verificamos que exista TBK_TOKEN, sin importar lo demás)
    if (tbkTokenAbort) {
      if (ordenAbort) {
        await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('orden_compra', ordenAbort)
      } else {
        await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('token_transbank', tbkTokenAbort)
      }
      const qs = ordenAbort ? `?orden=${encodeURIComponent(ordenAbort)}` : ''
      return redirect('/pago/anulado', qs)
    }

    if (!token_ws) {
      return redirect('/pago/anulado')
    }

    // 2. EL PAGO SE PROCESÓ Y DEBEMOS PREGUNTARLE AL BANCO
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
    const qs = `?orden=${encodeURIComponent(orden)}&monto=${encodeURIComponent(monto)}`

    // Si el banco aprobó
    if (tbkData.status === 'AUTHORIZED') {
      await supabaseAdmin.from('pagos_transbank').update({ estado: 'pagado' }).eq('token_transbank', token_ws)
      const { data: pago } = await supabaseAdmin.from('pagos_transbank').select('*').eq('token_transbank', token_ws).single()
      if (pago) {
        await supabaseAdmin.from('empresa').update({ plan: pago.plan_solicitado }).eq('id_empresa', pago.id_empresa)
      }
      return redirect('/pago/exitoso', qs)
    }

    // Si el banco dice explícitamente que fue abortado o hubo un error de sesión
    if (tbkData.status === 'ABORTED' || tbkData.status === 'INITIALIZED' || tbkData.error_message) {
      await supabaseAdmin.from('pagos_transbank').update({ estado: 'anulado' }).eq('token_transbank', token_ws)
      return redirect('/pago/anulado', qs)
    }

    // Si el banco rechazó (ej. sin fondos, tarjeta errónea)
    await supabaseAdmin.from('pagos_transbank').update({ estado: 'rechazado' }).eq('token_transbank', token_ws)
    return redirect('/pago/rechazado', qs)

  } catch (error) {
    console.error('tbk-confirmar:', error)
    return redirect('/pago/rechazado', '?error=servidor')
main
  }
})
