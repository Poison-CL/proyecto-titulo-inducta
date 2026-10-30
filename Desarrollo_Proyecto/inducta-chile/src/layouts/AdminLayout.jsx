import { Box, Flex, Text } from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization } from '@clerk/clerk-react'
import { CircleHelp, Home, Settings2, UserPlus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import PanelShell, { PlanWidget } from '../components/dashboard/PanelShell'
import { ModalCuentaTemporal } from '../features/cuenta/ModalCuentaTemporal'
import { useEmpresaCuenta } from '../features/empresa/useEmpresaCuenta'
import { DashboardTour } from '../features/tour/DashboardTour'
import { useSupabase } from '../hooks/useSupabase'
import { esAdminEmpresa } from '../lib/authRol'
import { esAdminPlataforma, esOrgInducta, esTrabajadorPlataforma } from '../lib/orgInducta'
import { resolverBusquedaEmpresa } from '../lib/panelBusqueda'
import { estadoPlan, getPlan } from '../lib/planes'
import { clerkAppearance } from '../theme/clerkAppearance'

export default function AdminLayout() {
  const { organization, membership, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })
  const supabase = useSupabase()
  const admin = esAdminEmpresa(membership)
  const { empresa, loading, esTemporal, esDeshabilitada, marcarModalVisto, cargar } = useEmpresaCuenta()
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    if (loading || !empresa) return
    if (esTemporal && !empresa.modal_temporal_visto) {
      setModalAbierto(true)
    }
  }, [loading, empresa, esTemporal])

  const resolverBusqueda = useCallback(
    (consulta) =>
      resolverBusquedaEmpresa(supabase, organization?.id, consulta, {
        admin,
        miembros: memberships?.data ?? [],
        invitaciones: (invitations?.data ?? []).filter((i) => i.status === 'pending'),
      }),
    [supabase, organization?.id, admin, memberships?.data, invitations?.data],
  )

  if (!loading && esDeshabilitada) {
    return <Navigate to="/cuenta-deshabilitada" replace />
  }
  if (esTrabajadorPlataforma(membership, organization)) {
    return <Navigate to="/" replace />
  }
  if (esAdminPlataforma(membership, organization)) {
    return <Navigate to="/admin" replace />
  }
  if (esOrgInducta(organization)) {
    return <Navigate to="/" replace />
  }
  // Empleados/miembros tienen su propio dashboard
  if (!loading && !admin) {
    return <Navigate to="/empleado" replace />
  }

  async function cerrarModal() {
    setModalAbierto(false)
    await marcarModalVisto()
  }

  const navPrimary = [
    { to: '/dashboard', end: true, label: 'Inicio', icon: Home, dataTour: 'nav-inicio' },
    { to: '/dashboard/equipo', label: 'Equipo', icon: Users, dataTour: 'nav-equipo' },
  ]
  const navSettings = [
    { to: '/dashboard/configuracion', label: 'Configuración', icon: Settings2, dataTour: 'nav-config' },
  ]

  const plan = getPlan(empresa?.plan)
  const planEstado = estadoPlan(empresa?.plan_vence_en)

  return (
    <>
      <PanelShell
        logoTo="/"
        topLinks={[{ label: 'Soporte', to: '/recursos/soporte', icon: CircleHelp }]}
        topRight={
          <Flex align="center" gap={2} ml={1}>
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/dashboard"
              appearance={clerkAppearance}
            />
            <InductaUserButton afterSignOutUrl="/" />
          </Flex>
        }
        navSections={[navPrimary, navSettings]}
        ctaNav={{ label: 'Invitar colaborador', to: '/dashboard/equipo', icon: UserPlus }}
        resolverBusqueda={resolverBusqueda}
        searchPlaceholder="Búsqueda rápida"
        planWidget={
          <PlanWidget
            titulo="Plan actual"
            planLabel={plan?.nombre || empresa?.plan || 'Sin plan'}
            cta="Gestionar plan"
            to="/dashboard/configuracion"
            meta={planEstado.etiqueta}
          />
        }
        banner={
          esTemporal ? (
            <Box
              mb={6}
              px={4}
              py={3}
              bg="brand.wash"
              borderRadius="md"
              borderLeftWidth="3px"
              borderLeftColor="brand.primary"
            >
              <Text fontSize="sm" color="brand.ink" lineHeight={1.55}>
                Cuenta temporal: complete sus datos reales en Configuración. Mientras tanto no puede invitar usuarios.
              </Text>
            </Box>
          ) : null
        }
      >
        <Outlet />
      </PanelShell>

      <DashboardTour enabled={!loading && !modalAbierto && !esTemporal} />
      <ModalCuentaTemporal
        isOpen={modalAbierto}
        idEmpresa={organization?.id}
        onCerrar={cerrarModal}
        onCompletado={() => cargar()}
      />
    </>
  )
}
