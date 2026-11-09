import { Grid } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { ClipboardList, Settings2, Users } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import { useEmpresaSync } from '../../features/empresa/useEmpresaSync'
import { useSupabase } from '../../hooks/useSupabase'
import { resolverBusquedaEmpresa } from '../../lib/panelBusqueda'
import SincronizarEmpresaBox from '../../components/dashboard/SincronizarEmpresaBox'

export default function DashboardPage() {
  const { user } = useUser()
  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })
  const supabase = useSupabase()
  const navigate = useNavigate()
  const { synced, loading, error, sync } = useEmpresaSync()
  const nombre = user?.firstName || 'equipo'

  const onBuscar = useCallback(
    async (q) => {
      const r = await resolverBusquedaEmpresa(supabase, organization?.id, q, {
        admin: true,
        miembros: memberships?.data ?? [],
        invitaciones: (invitations?.data ?? []).filter((i) => i.status === 'pending'),
      })
      if (r?.to) navigate(r.to)
      return r
    },
    [supabase, organization?.id, memberships?.data, invitations?.data, navigate],
  )

  return (
    <WorkspaceHome
      pillLabel={organization?.name || 'Inducta Chile'}
      pillTo="/dashboard/configuracion"
      titulo={`¿Qué necesita hoy, ${nombre}?`}
      placeholder="Buscar equipo, persona o sección…"
      onBuscar={onBuscar}
    >
      {!synced ? (
        <SincronizarEmpresaBox loading={loading} error={error} onSync={sync} />
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <AccionCard
            icon={Users}
            titulo="Gestione el equipo"
            bajada="Invite colaboradores y defina quién administra la empresa desde el panel."
            cta="Ir a Equipo"
            to="/dashboard/equipo"
            primary
          />
          <AccionCard
            icon={Settings2}
            titulo="Plan y configuración"
            bajada="Revise el vencimiento del plan, renueve y actualice los datos de contacto."
            cta="Abrir configuración"
            to="/dashboard/configuracion"
          />
          <AccionCard
            icon={ClipboardList}
            titulo="Programas"
            bajada="Inducciones y capacitaciones para su organización. Próximamente en el panel."
            cta="Ver inicio"
            to="/dashboard"
          />
        </Grid>
      )}
    </WorkspaceHome>
  )
}
