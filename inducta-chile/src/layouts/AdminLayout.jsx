import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization, useUser } from '@clerk/clerk-react'
import { Home } from 'lucide-react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import InductaUserButton from '../components/auth/InductaUserButton'
import { etiquetaRol, getRolUsuario } from '../lib/authRol'
import { clerkAppearance } from '../theme/clerkAppearance'

export default function AdminLayout() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const rol = getRolUsuario(user)

  return (
    <Flex h="100vh" bg="brand.soft">
      <Flex
        as="aside"
        w="264px"
        bg="white"
        borderRightWidth="1px"
        borderColor="blackAlpha.100"
        p={6}
        direction="column"
        justify="space-between"
        flexShrink={0}
      >
        <Box>
          <Heading
            as={RouterLink}
            to="/"
            size="md"
            color="brand.primary"
            display="block"
            mb={6}
            _hover={{ color: 'brand.ink' }}
          >
            Inducta Chile
          </Heading>
          <VStack as="nav" align="stretch" spacing={1}>
            <Button
              as={NavLink}
              to="/dashboard"
              end
              variant="ghost"
              justifyContent="flex-start"
              leftIcon={<Home size={16} />}
              _activeLink={{ bg: 'brand.soft', color: 'brand.primary' }}
            >
              Inicio
            </Button>
          </VStack>
        </Box>

        <VStack align="stretch" spacing={3}>
          <Box fontSize="sm">
            <Text fontWeight="semibold" color="brand.ink" noOfLines={1}>
              {user?.fullName}
            </Text>
            <Text color="gray.500" noOfLines={1}>
              Rol: {etiquetaRol(rol)}
            </Text>
            <Text color="gray.500" noOfLines={1}>
              {organization?.name}
            </Text>
          </Box>

          <Divider borderColor="blackAlpha.100" />

          <Flex align="center" gap={2}>
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/dashboard"
              appearance={clerkAppearance}
            />
            <InductaUserButton afterSignOutUrl="/" />
          </Flex>
        </VStack>
      </Flex>

      <Box as="main" flex="1" p={8} overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  )
}
