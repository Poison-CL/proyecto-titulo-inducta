import { Box, Flex } from '@chakra-ui/react'
import { useOrganization } from '@clerk/clerk-react'
import {
  Award,
  BookOpen,
  CircleHelp,
  Home,
  Settings2,
} from 'lucide-react'
import { useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import PanelShell, { PlanWidget } from '../components/dashboard/PanelShell'
import { EmpleadoTour } from '../features/tour/EmpleadoTour'
import { esAdminEmpresa, etiquetaOrgRol } from '../lib/authRol'
import { esAdminPlataforma, esOrgInducta } from '../lib/orgInducta'
import { resolverBusquedaEmpleado } from '../lib/panelBusqueda'

/**
 * Layout del dashboard de empleado.
 * Sidebar: Inicio · Mis Programas · Mis Certificados · Mi Perfil
 * Abajo: empresa a la que pertenece.
 */
export default function EmpleadoLayout() {
  const { membership, organization, isLoaded } = useOrganization()

  const resolverBusqueda = useCallback((consulta) => resolverBusquedaEmpleado(consulta), [])

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
    { to: '/empleado', end: true, label: 'Inicio', icon: Home, dataTour: 'emp-nav-inicio' },
    { to: '/empleado/programas', label: 'Mis Programas', icon: BookOpen, dataTour: 'emp-nav-programas' },
    { to: '/empleado/certificados', label: 'Mis Certificados', icon: Award, dataTour: 'emp-nav-certificados' },
  ]

  const navSettings = [
    { to: '/empleado/perfil', label: 'Mi Perfil', icon: Settings2, dataTour: 'emp-nav-perfil' },
  ]

  const rolLabel = membership ? etiquetaOrgRol(membership.role) : null

  return (
    <>
      <PanelShell
        logoTo="/"
        topLinks={[{ label: 'Soporte', to: '/recursos/soporte', icon: CircleHelp }]}
        topRight={
          <Flex align="center" gap={2} ml={1}>
            <InductaUserButton afterSignOutUrl="/" />
          </Flex>
        }
        navSections={[navPrimary, navSettings]}
        resolverBusqueda={resolverBusqueda}
        searchPlaceholder="Buscar en el panel…"
        planWidget={
          <PlanWidget
            titulo="Su empresa"
            planLabel={organization?.name || 'Sin empresa'}
            cta="Ver perfil"
            to="/empleado/perfil"
            meta={rolLabel ? `Rol: ${rolLabel}` : undefined}
          />
        }
      >
        <Box data-tour="emp-resumen">
          <Outlet />
        </Box>
      </PanelShell>
      <EmpleadoTour enabled={Boolean(isLoaded && organization)} />
    </>
  )
}
