import { Box, Button, Flex, Image, Text, VStack } from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization, useUser } from '@clerk/clerk-react'
import { Building2, CreditCard, Headset, Home, KeyRound, Ticket } from 'lucide-react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import { etiquetaOrgRol } from '../lib/authRol'
import { clerkAppearance } from '../theme/clerkAppearance'

const navBtn = {
  variant: 'ghost',
  justifyContent: 'flex-start',
  h: '40px',
  px: 3,
  fontWeight: 'medium',
  color: 'blackAlpha.700',
  borderRadius: 'md',
  fontSize: 'sm',
  _hover: { bg: 'brand.wash', color: 'brand.ink' },
  _activeLink: {
    bg: 'brand.wash',
    color: 'brand.primary',
    fontWeight: 'semibold',
  },
}

const NAV = [
  { to: '/admin', end: true, label: 'Resumen', icon: Home },
  { to: '/admin/soporte', label: 'Soporte', icon: Headset },
  { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/admin/usuarios', label: 'Usuarios', icon: KeyRound },
]

export default function SoporteAdminLayout() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()

  return (
    <Flex h="100vh" bg="white">
      <Flex
        as="aside"
        w="248px"
        borderRightWidth="1px"
        borderColor="blackAlpha.100"
        px={5}
        py={6}
        direction="column"
        justify="space-between"
        flexShrink={0}
        bg="brand.soft"
      >
        <Box>
          <Box as={RouterLink} to="/admin" display="inline-block" mb={1} _hover={{ opacity: 0.85 }}>
            <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="28px" w="auto" />
          </Box>
          <Text fontSize="xs" color="blackAlpha.500" mb={8} fontWeight="medium" letterSpacing="0.02em">
            PANEL DE SOPORTE
          </Text>
          <VStack as="nav" align="stretch" spacing={1}>
            {NAV.map(({ to, end, label, icon: Icon }) => (
              <Button key={to} as={NavLink} to={to} end={end} leftIcon={<Icon size={16} />} {...navBtn}>
                {label}
              </Button>
            ))}
          </VStack>
        </Box>

        <Box pt={5} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Text fontWeight="semibold" color="brand.ink" fontSize="sm" noOfLines={1} mb={0.5}>
            {user?.fullName}
          </Text>
          <Text color="blackAlpha.600" fontSize="xs" noOfLines={1} mb={0.5}>
            {membership?.role ? etiquetaOrgRol(membership.role) : 'Administrador'}
          </Text>
          <Text color="blackAlpha.500" fontSize="xs" noOfLines={1} mb={4}>
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

      <Box as="main" flex="1" overflowY="auto" bg="white" px={{ base: 6, md: 10, xl: 14 }} py={{ base: 8, md: 10 }}>
        <Outlet />
      </Box>
    </Flex>
  )
}
