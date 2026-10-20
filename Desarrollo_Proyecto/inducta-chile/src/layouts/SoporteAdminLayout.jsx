import { Flex } from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization, useUser } from '@clerk/clerk-react'
import { Building2, CreditCard, Headset, Home, KeyRound, Plus, Ticket } from 'lucide-react'
import { useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import PanelShell, { PlanWidget } from '../components/dashboard/PanelShell'
import { useSupabase } from '../hooks/useSupabase'
import { resolverBusquedaAdmin } from '../lib/panelBusqueda'
import { clerkAppearance } from '../theme/clerkAppearance'

export default function SoporteAdminLayout() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()

  const resolverBusqueda = useCallback(
    (consulta) => resolverBusquedaAdmin(supabase, consulta),
    [supabase],
  )

  const navPrimary = [
    { to: '/admin', end: true, label: 'Resumen', icon: Home },
    { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
    { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
    { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  ]
  const navEquipo = [{ to: '/admin/usuarios', label: 'Usuarios', icon: KeyRound }]
  const navSettings = [{ to: '/admin/soporte', label: 'Soporte', icon: Headset }]

  return (
    <PanelShell
      logoTo="/admin"
      topLinks={[{ label: 'Soporte', to: '/admin/soporte', icon: Headset }]}
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
      navSections={[navPrimary, navEquipo, navSettings]}
      ctaNav={{ label: 'Ver empresas', to: '/admin/empresas', icon: Plus }}
      resolverBusqueda={resolverBusqueda}
      searchPlaceholder="Búsqueda rápida"
      planWidget={
        <PlanWidget
          titulo="Espacio"
          planLabel={organization?.name || 'Inducta'}
          cta="Ver empresas"
          to="/admin/empresas"
          meta={user?.fullName ? `Sesión · ${user.fullName}` : 'Panel de plataforma'}
        />
      }
    >
      <Outlet />
    </PanelShell>
  )
}
