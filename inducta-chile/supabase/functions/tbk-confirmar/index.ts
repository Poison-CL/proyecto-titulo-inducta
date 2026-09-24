import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

serve(async (req) => {
  try {
    const formData = await req.formData()
    const token_ws = formData.get('token_ws')
    let urlRedireccion = 'http://localhost:5173/contratar?error=pago_fallido'

    if (token_ws) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const tbkResponse = await fetch(`https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`, {
        method: 'PUT',
        headers: {
          'Tbk-Api-Key-Id': '597055555532',
          'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
          'Content-Type': 'application/json'
        }
      })
      const tbkData = await tbkResponse.json()

      if (tbkData.status === 'AUTHORIZED') {
        await supabaseAdmin.from('pagos_transbank')
          .update({ estado: 'pagado' })
          .eq('token_transbank', token_ws)

        const { data: pago } = await supabaseAdmin.from('pagos_transbank')
          .select('*').eq('token_transbank', token_ws).single()

        if (pago) {
          await supabaseAdmin.from('empresa')
            .update({ plan: pago.plan_solicitado })
            .eq('id_empresa', pago.id_empresa)
        }
        
        urlRedireccion = `http://localhost:5173/pago-exitoso`
      }
    }
    return Response.redirect(urlRedireccion, 302)
  } catch (error) {
    return Response.redirect('http://localhost:5173/contratar?error=servidor', 302)
  }
})