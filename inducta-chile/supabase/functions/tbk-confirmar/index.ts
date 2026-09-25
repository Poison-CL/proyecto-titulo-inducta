import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

serve(async (req) => {
  const volver = 'http://localhost:5173/contratar?error=pago_fallido'

  try {
    const url = new URL(req.url)
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
  }
})
