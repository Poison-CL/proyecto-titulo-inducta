import { Box, Button, Grid, Text } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { ClipboardList, Settings2, Users } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import { useEmpresaSync } from '../../features/empresa/useEmpresaSync'
import { useSupabase } from '../../hooks/useSupabase'
import { esAdminEmpresa } from '../../lib/authRol'
import { resolverBusquedaEmpresa } from '../../lib/panelBusqueda'

export default function DashboardPage() {
  const { user } = useUser()
  const { organization, membership, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })
  const supabase = useSupabase()
  const navigate = useNavigate()
  const admin = esAdminEmpresa(membership)
  const { synced, loading, error, sync } = useEmpresaSync()
  const nombre = user?.firstName || (admin ? 'equipo' : 'colaborador')

  const onBuscar = useCallback(
    async (q) => {
      const r = await resolverBusquedaEmpresa(supabase, organization?.id, q, {
        admin,
        miembros: memberships?.data ?? [],
        invitaciones: (invitations?.data ?? []).filter((i) => i.status === 'pending'),
      })
      if (r?.to) navigate(r.to)
      return r
    },
    [supabase, organization?.id, admin, memberships?.data, invitations?.data, navigate],
  )

  return (
    <WorkspaceHome
      pillLabel={organization?.name || 'Inducta Chile'}
      pillTo={admin ? '/dashboard/configuracion' : '/dashboard'}
      titulo={admin ? `¿Qué necesita hoy, ${nombre}?` : `Hola, ${nombre}.`}
      placeholder={
        admin ? 'Buscar equipo, persona o sección…' : 'Buscar sección del panel…'
      }
      onBuscar={onBuscar}
    >
      {!admin ? (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <AccionCard
            icon={ClipboardList}
            titulo="Sus programas"
            bajada="Aquí verá las inducciones y capacitaciones que su empresa le asigne."
            cta="Ver inicio"
            to="/dashboard"
            primary
          />
          <AccionCard
            icon={Settings2}
            titulo="Su cuenta"
            bajada="Revise sus datos de acceso y la configuración disponible en el panel."
            cta="Ir a Configuración"
            to="/dashboard/configuracion"
          />
          <AccionCard
            icon={Users}
            titulo="Su equipo"
            bajada="La gestión de colaboradores la realiza el administrador de su empresa."
            cta="Ver inicio"
            to="/dashboard"
          />
        </Grid>
      ) : !synced ? (
        <Box
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          textAlign="center"
          maxW="28rem"
          mx="auto"
        >
          <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
            Sincronizar empresa
          </Text>
          <Text color="blackAlpha.700" lineHeight="1.6" mb={error ? 3 : 6}>
            Falta registrar esta organización en la base de datos para gestionar plan y equipo.
          </Text>
          {error ? (
            <Text color="red.600" fontSize="sm" mb={5}>
              {error}
            </Text>
          ) : null}
          <Button onClick={sync} isLoading={loading} loadingText="Sincronizando" h="44px" px={7} borderRadius="md" w="full">
            Sincronizar ahora
          </Button>
        </Box>
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
