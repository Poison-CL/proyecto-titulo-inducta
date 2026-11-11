import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, jsonResponse, optionsResponse } from '../_shared/cors.ts'
import { montoClpConIva, ufHoyClp, ufNeto } from '../_shared/planes.ts'

const PLANES_OK = new Set(['basico', 'plus', 'plusplus'])

serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  try {
    const body = await req.json()
    const nombre_comercial = String(body.nombre_comercial || '').trim()
    const email_contacto = String(body.email_contacto || '').trim().toLowerCase()
    const plan_solicitado = String(body.plan_solicitado || '').trim()
    const periodoPago = body.periodo === 'anual' ? 'anual' : 'mensual'
    // Ignorar monto del cliente (P0-3)

    if (!nombre_comercial || !email_contacto || !PLANES_OK.has(plan_solicitado)) {
      return jsonResponse({ error: 'Datos inválidos (plan/periodo/contacto)' }, 400, req)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
      return jsonResponse({ error: 'Correo de contacto inválido' }, 400, req)
    }

    const ufPlan = ufNeto(plan_solicitado, periodoPago)
    if (ufPlan == null || ufPlan <= 0) {
      return jsonResponse({ error: 'Plan no contratible' }, 400, req)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Evitar pagar si el correo ya es dueño, temporal o usuario (admin/trabajador).
    const estadosCuenta = ['temporal', 'pendiente_verificacion', 'verificada', 'activa']
    const { data: porContacto } = await supabaseAdmin
      .from('empresa')
      .select('id_empresa, cuenta_estado')
      .eq('email_contacto', email_contacto)
      .in('cuenta_estado', estadosCuenta)
      .limit(1)
      .maybeSingle()
    const { data: porTemporal } = porContacto
      ? { data: null }
      : await supabaseAdmin
          .from('empresa')
          .select('id_empresa, cuenta_estado')
          .eq('email_temporal', email_contacto)
          .in('cuenta_estado', estadosCuenta)
          .limit(1)
          .maybeSingle()
    const empresaExistente = porContacto || porTemporal

    if (empresaExistente) {
      return jsonResponse(
        {
          error:
            'Este correo ya está vinculado a una cuenta Inducta. Ingrese con ese correo o use otro para contratar.',
          code: 'email_en_uso',
        },
        409,
        req,
      )
    }

    const clerkKey = Deno.env.get('CLERK_SECRET_KEY')
    if (clerkKey) {
      const clerkRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email_contacto)}`,
        { headers: { Authorization: `Bearer ${clerkKey}` } },
      )
      const clerkData = await clerkRes.json().catch(() => [])
      const clerkUser = Array.isArray(clerkData) ? clerkData[0] : clerkData?.data?.[0]
      if (clerkUser?.id) {
        const { data: usuarioRow } = await supabaseAdmin
          .from('usuario')
          .select('id_usuario, rol, id_empresa')
          .eq('id_usuario', clerkUser.id)
          .limit(1)
          .maybeSingle()

        const esTrabajador = usuarioRow && String(usuarioRow.rol || '').toLowerCase().includes('trabaja')
        return jsonResponse(
          {
            error: esTrabajador
              ? 'Este correo ya pertenece a un trabajador de una empresa en Inducta. Debe ingresar con esa cuenta; no puede contratar un plan nuevo con el mismo correo.'
              : 'Este correo ya está registrado en Inducta. Ingrese con ese correo o use otro para contratar.',
            code: 'email_en_uso',
          },
          409,
          req,
        )
      }
    }

    // Fallback sin Clerk: fila en usuario no aplica (sin email). Bloqueo por pago reciente OK.
    const { data: pagoActivo } = await supabaseAdmin
      .from('pagos_transbank')
      .select('orden_compra, estado')
      .eq('email_contacto', email_contacto)
      .in('estado', ['autorizado', 'pagado', 'aprobado', 'completado'])
      .limit(1)
      .maybeSingle()
    if (pagoActivo) {
      return jsonResponse(
        {
          error:
            'Este correo ya tiene un pago Inducta asociado. Ingrese a su cuenta o contacte soporte.',
          code: 'email_en_uso',
        },
        409,
        req,
      )
    }

    const ufClp = await ufHoyClp()
    const monto = montoClpConIva(ufPlan, ufClp)

    const commerce = Deno.env.get('TBK_COMMERCE_CODE') || '597055555532'
    const apiKey = Deno.env.get('TBK_API_KEY') || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
    const tbkBase =
      Deno.env.get('TBK_BASE_URL') ||
      'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2'

    const buyOrder = `IND-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`.slice(0, 26)

    const tbkResponse = await fetch(`${tbkBase}/transactions`, {
      method: 'POST',
      headers: {
        'Tbk-Api-Key-Id': commerce,
        'Tbk-Api-Key-Secret': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        buy_order: buyOrder,
        session_id: buyOrder,
        amount: monto,
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tbk-confirmar`,
      }),
    })

    const tbkData = await tbkResponse.json()
    if (!tbkData?.token || !tbkData?.url) {
      return jsonResponse(tbkData, 400, req)
    }

    const { error } = await supabaseAdmin.from('pagos_transbank').insert({
      nombre_comercial,
      email_contacto,
      plan_solicitado,
      periodo: periodoPago,
      orden_compra: buyOrder,
      token_transbank: tbkData.token,
      monto,
      estado: 'pendiente',
    })
    if (error) throw error

    return jsonResponse({ ...tbkData, monto, periodo: periodoPago, plan_solicitado }, 200, req)
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400, req)
  }
})
