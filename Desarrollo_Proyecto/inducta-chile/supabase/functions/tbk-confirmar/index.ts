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

function tbkHeaders() {
  return {
    'Tbk-Api-Key-Id': Deno.env.get('TBK_COMMERCE_CODE') || '597055555532',
    'Tbk-Api-Key-Secret':
      Deno.env.get('TBK_API_KEY') || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
    'Content-Type': 'application/json',
  }
}

function tbkBase() {
  return (
    Deno.env.get('TBK_BASE_URL') ||
    'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2'
  )
}

async function provisionarCuentaTemporal(pago: Record<string, unknown>) {
  const base = Deno.env.get('SUPABASE_URL')
  const secret = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  if (!base) return { error: 'sin SUPABASE_URL' }
  if (!secret) return { error: 'sin INTERNAL_FUNCTION_SECRET' }

  const res = await fetch(`${base}/functions/v1/provisionar-cuenta-temporal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-inducta-secret': secret,
    },
    body: JSON.stringify({ id_pago: pago.id_pago }),
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
    let sesionAbort: string | null = url.searchParams.get('TBK_ID_SESION')

    if (req.method === 'POST') {
      try {
        const formData = await req.formData()
        token_ws = (formData.get('token_ws') as string) || token_ws
        tbkTokenAbort = (formData.get('TBK_TOKEN') as string) || tbkTokenAbort
        ordenAbort = (formData.get('TBK_ORDEN_COMPRA') as string) || ordenAbort
        sesionAbort = (formData.get('TBK_ID_SESION') as string) || sesionAbort
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

    // Timeout Webpay: solo orden (+ sesión), sin token
    if (!token_ws && !tbkTokenAbort && ordenAbort) {
      await supabaseAdmin
        .from('pagos_transbank')
        .update({ estado: 'anulado' })
        .eq('orden_compra', ordenAbort)
        .eq('estado', 'pendiente')
      return redirect('/pago/anulado', `?orden=${encodeURIComponent(ordenAbort)}`)
    }

    // Aborto con TBK_TOKEN
    if (tbkTokenAbort) {
      if (ordenAbort) {
        const { data: pagoAbort } = await supabaseAdmin
          .from('pagos_transbank')
          .select('token_transbank, estado')
          .eq('orden_compra', ordenAbort)
          .maybeSingle()
        if (pagoAbort?.estado === 'pendiente' && pagoAbort.token_transbank === tbkTokenAbort) {
          await supabaseAdmin
            .from('pagos_transbank')
            .update({ estado: 'anulado' })
            .eq('orden_compra', ordenAbort)
            .eq('estado', 'pendiente')
        }
      } else {
        await supabaseAdmin
          .from('pagos_transbank')
          .update({ estado: 'anulado' })
          .eq('token_transbank', tbkTokenAbort)
          .eq('estado', 'pendiente')
      }
      const qs = ordenAbort ? `?orden=${encodeURIComponent(ordenAbort)}` : ''
      return redirect('/pago/anulado', qs)
    }

    if (!token_ws) return redirect('/pago/anulado')

    // Idempotencia: si ya no está pendiente, no re-commitear en Transbank
    const { data: pagoPrev } = await supabaseAdmin
      .from('pagos_transbank')
      .select(
        'id_pago, estado, monto, orden_compra, plan_solicitado, periodo, id_empresa, email_contacto, nombre_comercial, token_transbank',
      )
      .eq('token_transbank', token_ws)
      .maybeSingle()

    if (pagoPrev && pagoPrev.estado !== 'pendiente') {
      if (pagoPrev.estado === 'pagado') {
        return redirect(
          '/pago/exitoso',
          `?orden=${encodeURIComponent(pagoPrev.orden_compra || '')}&monto=${encodeURIComponent(String(pagoPrev.monto ?? ''))}`,
        )
      }
      if (pagoPrev.estado === 'anulado') {
        return redirect('/pago/anulado', `?orden=${encodeURIComponent(pagoPrev.orden_compra || '')}`)
      }
      return redirect('/pago/rechazado', `?orden=${encodeURIComponent(pagoPrev.orden_compra || '')}`)
    }

    let tbkData: Record<string, unknown>
    try {
      const tbkResponse = await fetch(`${tbkBase()}/transactions/${token_ws}`, {
        method: 'PUT',
        headers: tbkHeaders(),
        signal: AbortSignal.timeout(15000),
      })
      tbkData = await tbkResponse.json()
    } catch (netErr) {
      // Ante error de red, consultar estado en vez de marcar rechazado a ciegas
      try {
        const getRes = await fetch(`${tbkBase()}/transactions/${token_ws}`, {
          method: 'GET',
          headers: tbkHeaders(),
          signal: AbortSignal.timeout(10000),
        })
        tbkData = await getRes.json()
      } catch {
        console.error('tbk-confirmar red:', netErr)
        return redirect('/pago/rechazado', '?error=red')
      }
    }

    const orden = tbkData.buy_order ? String(tbkData.buy_order) : pagoPrev?.orden_compra || ''
    const montoTbk = tbkData.amount != null ? Number(tbkData.amount) : null
    let qs = `?orden=${encodeURIComponent(orden)}&monto=${encodeURIComponent(String(montoTbk ?? ''))}`

    const autorizado =
      tbkData.status === 'AUTHORIZED' &&
      (tbkData.response_code === 0 || tbkData.response_code === '0') &&
      (pagoPrev?.monto == null || Number(pagoPrev.monto) === montoTbk) &&
      (!pagoPrev?.orden_compra || pagoPrev.orden_compra === orden)

    if (autorizado) {
      const { data: marcado } = await supabaseAdmin
        .from('pagos_transbank')
        .update({ estado: 'pagado', fecha_pago: new Date().toISOString() })
        .eq('token_transbank', token_ws)
        .eq('estado', 'pendiente')
        .select(
          'id_pago, plan_solicitado, periodo, id_empresa, email_contacto, nombre_comercial, orden_compra, token_transbank, monto',
        )
        .maybeSingle()

      const pago = marcado || pagoPrev

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
      } else if (pago?.email_contacto && pago?.nombre_comercial && marcado) {
        try {
          const prov = await provisionarCuentaTemporal(pago)
          if (prov?.ok) qs += '&cuenta=temporal'
          else {
            console.error('provisionar falló:', prov)
            qs += '&cuenta=error'
          }
        } catch (e) {
          console.error('provisionar exception:', e)
          qs += '&cuenta=error'
        }
      }

      return redirect('/pago/exitoso', qs)
    }

    if (tbkData.status === 'ABORTED' || tbkData.status === 'INITIALIZED' || tbkData.error_message) {
      await supabaseAdmin
        .from('pagos_transbank')
        .update({ estado: 'anulado' })
        .eq('token_transbank', token_ws)
        .eq('estado', 'pendiente')
      return redirect('/pago/anulado', qs)
    }

    await supabaseAdmin
      .from('pagos_transbank')
      .update({ estado: 'rechazado' })
      .eq('token_transbank', token_ws)
      .eq('estado', 'pendiente')
    return redirect('/pago/rechazado', qs)
  } catch (error) {
    console.error('tbk-confirmar:', error)
    return redirect('/pago/rechazado', '?error=servidor')
  }
})
