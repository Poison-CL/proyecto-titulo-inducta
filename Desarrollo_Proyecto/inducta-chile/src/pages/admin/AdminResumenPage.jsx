import { Grid, Text } from '@chakra-ui/react'
import { useUser } from '@clerk/clerk-react'
import { Building2, CreditCard, Ticket } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import { useSupabase } from '../../hooks/useSupabase'
import { resolverBusquedaAdmin } from '../../lib/panelBusqueda'

export default function AdminResumenPage() {
  const { user } = useUser()
  const supabase = useSupabase()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ empresas: 0, tickets: 0, pagos: 0 })
  const [loading, setLoading] = useState(true)
  const nombre = user?.firstName || 'equipo'

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [emp, cont, pagos] = await Promise.all([
        supabase.from('empresa').select('id_empresa'),
        supabase.from('contactos').select('id', { count: 'exact', head: true }),
        supabase.from('pagos_transbank').select('id_pago', { count: 'exact', head: true }),
      ])
      if (!vivo) return
      setStats({
        empresas: (emp.data || []).length,
        tickets: cont.count ?? 0,
        pagos: pagos.count ?? 0,
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
      pillTo="/admin/empresas"
      titulo={`¿Qué revisamos hoy, ${nombre}?`}
      placeholder="Buscar persona, empresa, ticket…"
      onBuscar={onBuscar}
    >
      {loading ? (
        <Text color="blackAlpha.600" fontSize="sm" textAlign="center">
          Cargando…
        </Text>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <AccionCard
            icon={Building2}
            titulo="Empresas"
            bajada="Cuentas activas en la base. Revise planes y estado de cada organización."
            cta="Ver empresas"
            to="/admin/empresas"
            primary
            meta={stats.empresas}
          />
          <AccionCard
            icon={Ticket}
            titulo="Tickets"
            bajada="Contactos del sitio web pendientes de respuesta y seguimiento."
            cta="Abrir tickets"
            to="/admin/tickets"
            meta={stats.tickets}
          />
          <AccionCard
            icon={CreditCard}
            titulo="Pagos"
            bajada="Registros Transbank y estado de cobros de la plataforma Inducta."
            cta="Ver pagos"
            to="/admin/pagos"
            meta={stats.pagos}
          />
        </Grid>
      )}
    </WorkspaceHome>
  )
}
