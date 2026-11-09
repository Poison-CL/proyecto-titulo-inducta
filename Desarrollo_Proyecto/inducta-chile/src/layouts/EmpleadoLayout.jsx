import { Box, Flex } from '@chakra-ui/react'
import { useOrganization } from '@clerk/clerk-react'
import {
  Award,
  BookOpen,
  CircleHelp,
  Home,
  Settings2,
  TrendingUp,
} from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import PanelShell from '../components/dashboard/PanelShell'
import { esAdminEmpresa } from '../lib/authRol'
import { esAdminPlataforma, esOrgInducta } from '../lib/orgInducta'

/**
 * Layout del dashboard de empleado.
 * Reutiliza PanelShell pero sin OrganizationSwitcher ni PlanWidget.
 * Sidebar: Inicio · Mis Programas · Mi Progreso · Mis Certificados · Mi Perfil
 */
export default function EmpleadoLayout() {
  const { membership, organization, isLoaded } = useOrganization()

  // Seguridad extra: si por alguna razón un admin llega aquí, lo redirigimos
  if (isLoaded && esAdminEmpresa(membership)) {
    return <Navigate to="/dashboard" replace />
  }
  if (isLoaded && esAdminPlataforma(membership, organization)) {
    return <Navigate to="/admin" replace />
  }
  if (isLoaded && esOrgInducta(organization)) {
    return <Navigate to="/" replace />
  }

  const navPrimary = [
    { to: '/empleado', end: true, label: 'Inicio', icon: Home },
    { to: '/empleado/programas', label: 'Mis Programas', icon: BookOpen },
    { to: '/empleado/progreso', label: 'Mi Progreso', icon: TrendingUp },
    { to: '/empleado/certificados', label: 'Mis Certificados', icon: Award },
  ]

  const navSettings = [
    { to: '/empleado/perfil', label: 'Mi Perfil', icon: Settings2 },
  ]

  return (
    <PanelShell
      logoTo="/"
      topLinks={[{ label: 'Soporte', to: '/recursos/soporte', icon: CircleHelp }]}
      topRight={
        <Flex align="center" gap={2} ml={1}>
          <InductaUserButton afterSignOutUrl="/" />
        </Flex>
      }
      navSections={[navPrimary, navSettings]}
      searchPlaceholder="Buscar en el panel…"
    >
      <Box>
        <Outlet />
      </Box>
    </PanelShell>
  )
}
