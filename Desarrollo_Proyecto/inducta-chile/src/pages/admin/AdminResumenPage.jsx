import { Grid, Text } from '@chakra-ui/react'
import { useUser } from '@clerk/clerk-react'
import { AlertTriangle, Building2, CreditCard, Ticket } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import { useSupabase } from '../../hooks/useSupabase'
import { resolverBusquedaAdmin } from '../../lib/panelBusqueda'
import { estadoPlan } from '../../lib/planes'

export default function AdminResumenPage() {
  const { user } = useUser()
  const supabase = useSupabase()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    empresas: 0,
    porVencer: 0,
    ticketsPendientes: 0,
    tickets: 0,
    pagosPendientes: 0,
    pagos: 0,
  })
  const [loading, setLoading] = useState(true)
  const nombre = user?.firstName || 'equipo'

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [emp, cont, contPend, pagos, pagosPend] = await Promise.all([
        supabase.from('empresa').select('id_empresa, plan_vence_en'),
        supabase.from('contactos').select('id', { count: 'exact', head: true }),
        supabase
          .from('contactos')
          .select('id', { count: 'exact', head: true })
          .in('estado', ['pendiente', 'en_curso']),
        supabase.from('pagos_transbank').select('id_pago', { count: 'exact', head: true }),
        supabase
          .from('pagos_transbank')
          .select('id_pago', { count: 'exact', head: true })
          .eq('estado', 'pendiente'),
      ])
      if (!vivo) return

      const empresas = emp.data || []
      const porVencer = empresas.filter((e) => {
        const v = estadoPlan(e.plan_vence_en).estado
        return v === 'por_vencer' || v === 'vencido'
      }).length

      // Si aún no existe columna estado, el count de pendientes falla → mostrar todos
      const ticketsPendientes = contPend.error ? cont.count ?? 0 : contPend.count ?? 0

      setStats({
        empresas: empresas.length,
        porVencer,
        tickets: cont.count ?? 0,
        ticketsPendientes,
        pagos: pagos.count ?? 0,
        pagosPendientes: pagosPend.count ?? 0,
      })
      setLoading(false)
    })()
    return () => {
      vivo = false
    }
  }, [supabase])

  const onBuscar = useCallback(
    async (q) => {
      const r = await resolverBusquedaAdmin(supabase, q)
      if (r?.to) navigate(r.to)
      return r
    },
    [supabase, navigate],
  )

  return (
    <WorkspaceHome
      pillLabel="Panel de soporte Inducta"
      pillTo="/admin/tickets"
      titulo={`¿Qué revisamos hoy, ${nombre}?`}
      placeholder="Buscar persona, empresa, ticket…"
      onBuscar={onBuscar}
    >
      {loading ? (
        <Text color="blackAlpha.600" fontSize="sm" textAlign="center">
          Cargando…
        </Text>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <AccionCard
            icon={Ticket}
            titulo="Tickets por atender"
            bajada="Contactos del sitio en pendiente o en curso. Responda por correo desde Soporte."
            cta="Abrir soporte"
            to="/admin/soporte"
            primary
            meta={stats.ticketsPendientes}
          />
          <AccionCard
            icon={stats.porVencer > 0 ? AlertTriangle : Building2}
            titulo="Empresas"
            bajada={
              stats.porVencer > 0
                ? `${stats.porVencer} con plan por vencer o vencido. Revise y renueve.`
                : 'Cuentas activas. Revise planes y estado de cada organización.'
            }
            cta="Ver empresas"
            to="/admin/empresas"
            meta={stats.empresas}
          />
          <AccionCard
            icon={CreditCard}
            titulo="Pagos"
            bajada={
              stats.pagosPendientes > 0
                ? `${stats.pagosPendientes} pago(s) pendiente(s) en Transbank.`
                : 'Historial Webpay y estado de cobros.'
            }
            cta="Ver pagos"
            to="/admin/pagos"
            meta={stats.pagos}
          />
          <AccionCard
            icon={Building2}
            titulo="Usuarios y soporte"
            bajada={`${stats.tickets} tickets en total. Gestione accesos o abra la bandeja de soporte.`}
            cta="Ir a soporte"
            to="/admin/soporte"
          />
        </Grid>
      )}
    </WorkspaceHome>
  )
}
