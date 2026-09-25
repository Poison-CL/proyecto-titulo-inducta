import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { nombre_comercial, email_contacto, monto, plan_solicitado } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const idEmpresa = crypto.randomUUID()
    const buyOrder = `ORDEN-${Math.floor(Math.random() * 1000000)}`

    await supabaseAdmin.from('empresa').insert({
      id_empresa: idEmpresa,
      nombre_comercial: nombre_comercial,
      email_contacto: email_contacto,
      plan: 'demo'
    })

    const tbkResponse = await fetch('https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions', {
      method: 'POST',
      headers: {
        'Tbk-Api-Key-Id': '597055555532',
        'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        buy_order: buyOrder,
        session_id: idEmpresa,
        amount: monto,
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tbk-confirmar`
      })
    })

    const tbkData = await tbkResponse.json()

    await supabaseAdmin.from('pagos_transbank').insert({
      id_empresa: idEmpresa,
      plan_solicitado: plan_solicitado,
      orden_compra: buyOrder,
      token_transbank: tbkData.token,
      monto: monto,
      estado: 'pendiente'
    })

    return new Response(JSON.stringify(tbkData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 400
    })
  }
})