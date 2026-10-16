import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Link as RouterLink } from 'react-router-dom'
import { useEmpresaSync } from '../../features/empresa/useEmpresaSync'
import { esAdminEmpresa, etiquetaOrgRol, etiquetaRol, getRolUsuario } from '../../lib/authRol'

export default function DashboardPage() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()
  const rol = getRolUsuario(user)
  const admin = esAdminEmpresa(membership)
  const { synced, loading, error, sync } = useEmpresaSync()
  const etiqueta = membership?.role ? etiquetaOrgRol(membership.role) : etiquetaRol(rol)

  return (
    <Box maxW="56rem" data-tour="dash-resumen">
      <Heading
        as="h1"
        fontSize={{ base: '2rem', md: '2.4rem' }}
        fontWeight="semibold"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        color="brand.ink"
        mb={3}
      >
        {admin ? `Hola, ${user?.firstName || 'equipo'}.` : `Hola, ${user?.firstName || 'colaborador'}.`}
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="40ch" mb={14}>
        {etiqueta}
        {organization ? ` · ${organization.name}` : null}
      </Text>

      {!admin ? (
        <Box borderTopWidth="1px" borderColor="blackAlpha.100" pt={12}>
          <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
            Sus programas
          </Text>
          <Text color="blackAlpha.700" lineHeight="1.6" maxW="48ch">
            Aquí verá las inducciones y capacitaciones que su empresa le asigne.
          </Text>
        </Box>
      ) : !synced ? (
        <Box borderTopWidth="1px" borderColor="blackAlpha.100" pt={12}>
          <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
            Sincronizar empresa
          </Text>
          <Text color="blackAlpha.700" lineHeight="1.6" maxW="48ch" mb={error ? 3 : 6}>
            Falta registrar esta organización en la base de datos para gestionar plan y equipo.
          </Text>
          {error ? (
            <Text color="red.600" fontSize="sm" mb={5}>
              {error}
            </Text>
          ) : null}
          <Button onClick={sync} isLoading={loading} loadingText="Sincronizando" h="44px" px={7}>
            Sincronizar ahora
          </Button>
        </Box>
      ) : (
        <Flex direction={{ base: 'column', md: 'row' }} borderTopWidth="1px" borderColor="blackAlpha.100" gap={{ base: 0, md: 0 }}>
          <Box flex="1" py={12} pr={{ md: 14 }} borderRightWidth={{ md: '1px' }} borderColor="blackAlpha.100">
            <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
              Equipo
            </Text>
            <Text color="blackAlpha.700" lineHeight="1.6" mb={6} maxW="34ch">
              Invite colaboradores y defina quién administra la empresa.
            </Text>
            <Button as={RouterLink} to="/dashboard/equipo" variant="link" color="brand.primary" fontWeight="semibold" p={0} h="auto">
              Ir a Equipo →
            </Button>
          </Box>
          <Box flex="1" py={12} pl={{ md: 14 }} borderTopWidth={{ base: '1px', md: 0 }} borderColor="blackAlpha.100">
            <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
              Plan y configuración
            </Text>
            <Text color="blackAlpha.700" lineHeight="1.6" mb={6} maxW="34ch">
              Revise el vencimiento del plan, renueve y actualice los datos de contacto.
            </Text>
            <Button as={RouterLink} to="/dashboard/configuracion" variant="link" color="brand.primary" fontWeight="semibold" p={0} h="auto">
              Ir a Configuración →
            </Button>
          </Box>
        </Flex>
      )}
    </Box>
  )
}
