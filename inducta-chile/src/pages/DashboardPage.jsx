import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react'
import { OrganizationSwitcher, useOrganization, useUser } from '@clerk/clerk-react'
import { useEmpresaSync } from '../features/empresa/useEmpresaSync'
import { etiquetaRol, getRolUsuario, ROL } from '../lib/authRol'
import { clerkAppearance } from '../theme/clerkAppearance'

// Cuando llegamos aca RequireOrg ya confirmo que hay una organizacion activa
export default function DashboardPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const rol = getRolUsuario(user)
  const esEmpresa = rol === ROL.EMPRESA
  const { synced, loading, error, sync } = useEmpresaSync()

  return (
    <Box
      maxW="4xl"
      mx="auto"
      bg="white"
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      boxShadow="sm"
    >
      <Flex
        wrap="wrap"
        align="flex-start"
        justify="space-between"
        gap={4}
        mb={5}
      >
        <Box>
          <Heading as="h1" size="lg" color="brand.ink">
            Panel de control
          </Heading>
          <Text color="gray.600" mt={1} fontSize="sm">
            Rol:{' '}
            <Text as="span" fontWeight="semibold" color="brand.ink">
              {etiquetaRol(rol)}
            </Text>
            {organization ? ` · ${organization.name}` : null}
          </Text>
        </Box>
        {esEmpresa ? (
          <OrganizationSwitcher hidePersonal appearance={clerkAppearance} />
        ) : null}
      </Flex>

      {!esEmpresa ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          Vista de empleado. Aqui iran tus inducciones y capacitaciones asignadas.
        </Alert>
      ) : synced ? (
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          Organizacion sincronizada correctamente con Supabase.
        </Alert>
      ) : (
        <Alert status="warning" borderRadius="lg" alignItems="flex-start">
          <AlertIcon />
          <Box>
            <Text mb={error ? 1 : 3}>
              La organizacion actual aun no esta sincronizada con Supabase.
            </Text>
            {error ? (
              <Text color="red.600" fontSize="sm" mb={3}>
                {error}
              </Text>
            ) : null}
            <Button size="sm" onClick={sync} isLoading={loading} loadingText="Sincronizando">
              Sincronizar empresa con base de datos
            </Button>
          </Box>
        </Alert>
      )}
    </Box>
  )
}
