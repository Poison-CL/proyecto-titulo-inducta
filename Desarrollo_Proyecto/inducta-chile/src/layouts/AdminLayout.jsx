import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization, useUser } from '@clerk/clerk-react'
import { Home, Settings2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, NavLink, Navigate, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import { ModalCuentaTemporal } from '../features/cuenta/ModalCuentaTemporal'
import { useEmpresaCuenta } from '../features/empresa/useEmpresaCuenta'
import { DashboardTour } from '../features/tour/DashboardTour'
import { esAdminEmpresa, etiquetaOrgRol, etiquetaRol, getRolUsuario } from '../lib/authRol'
import { esAdminPlataforma, esOrgInducta, esTrabajadorPlataforma } from '../lib/orgInducta'
import { clerkAppearance } from '../theme/clerkAppearance'

const navBtn = {
  variant: 'ghost',
  justifyContent: 'flex-start',
  h: '40px',
  px: 3,
  fontWeight: 'medium',
  color: 'blackAlpha.700',
  borderRadius: 'md',
  _hover: { bg: 'blackAlpha.50', color: 'brand.ink' },
  _activeLink: { bg: 'transparent', color: 'brand.primary', fontWeight: 'semibold' },
}

export default function AdminLayout() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()
  const rol = getRolUsuario(user)
  const admin = esAdminEmpresa(membership)
  const { empresa, loading, esTemporal, esDeshabilitada, marcarModalVisto, cargar } = useEmpresaCuenta()
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    if (loading || !empresa) return
    if (esTemporal && !empresa.modal_temporal_visto) {
      setModalAbierto(true)
    }
  }, [loading, empresa, esTemporal])

  if (!loading && esDeshabilitada) {
    return <Navigate to="/cuenta-deshabilitada" replace />
  }

  // Org plataforma Inducta: trabajadores → inicio; admins → panel de soporte
  if (esTrabajadorPlataforma(membership, organization)) {
    return <Navigate to="/" replace />
  }
  if (esAdminPlataforma(membership, organization)) {
    return <Navigate to="/admin" replace />
  }
  // Org Inducta sin rol admin de plataforma: fuera del panel empresa
  if (esOrgInducta(organization)) {
    return <Navigate to="/" replace />
  }

  async function cerrarModal() {
    setModalAbierto(false)
    await marcarModalVisto()
  }

  return (
    <Flex h="100vh" bg="white">
      <Flex
        as="aside"
        w="240px"
        borderRightWidth="1px"
        borderColor="blackAlpha.100"
        px={5}
        py={6}
        direction="column"
        justify="space-between"
        flexShrink={0}
      >
        <Box>
          <Box as={RouterLink} to="/" display="inline-block" mb={8} _hover={{ opacity: 0.85 }}>
            <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="28px" w="auto" />
          </Box>
          <VStack as="nav" align="stretch" spacing={0.5}>
            <Button
              as={NavLink}
              to="/dashboard"
              end
              leftIcon={<Home size={16} />}
              data-tour="nav-inicio"
              {...navBtn}
            >
              Inicio
            </Button>
            {admin ? (
              <Button
                as={NavLink}
                to="/dashboard/equipo"
                leftIcon={<Users size={16} />}
                data-tour="nav-equipo"
                {...navBtn}
              >
                Equipo
              </Button>
            ) : null}
            <Button
              as={NavLink}
              to="/dashboard/configuracion"
              leftIcon={<Settings2 size={16} />}
              data-tour="nav-config"
              {...navBtn}
            >
              Configuración
            </Button>
          </VStack>
        </Box>

        <Box pt={4} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Text fontWeight="semibold" color="brand.ink" fontSize="sm" noOfLines={1} mb={0.5}>
            {user?.fullName}
          </Text>
          <Text color="blackAlpha.600" fontSize="sm" noOfLines={1}>
            {membership?.role ? etiquetaOrgRol(membership.role) : etiquetaRol(rol)}
          </Text>
          <Text color="blackAlpha.600" fontSize="sm" noOfLines={1} mb={3}>
            {organization?.name}
          </Text>
          <Flex align="center" gap={2}>
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/dashboard"
              appearance={clerkAppearance}
            />
            <InductaUserButton afterSignOutUrl="/" />
          </Flex>
        </Box>
      </Flex>

      <Box as="main" flex="1" overflowY="auto" px={{ base: 6, md: 10, xl: 14 }} py={{ base: 8, md: 10 }}>
        {esTemporal ? (
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
        ) : null}
        <Outlet />
      </Box>

      {/* Esperar !loading: mientras carga, esTemporal es false por defecto y disparaba el tour a destiempo */}
      <DashboardTour enabled={!loading && !modalAbierto && !esTemporal} />

      <ModalCuentaTemporal
        isOpen={modalAbierto}
        idEmpresa={organization?.id}
        onCerrar={cerrarModal}
        onCompletado={() => cargar()}
      />
    </Flex>
  )
}
