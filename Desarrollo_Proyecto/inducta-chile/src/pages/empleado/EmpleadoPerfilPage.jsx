import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Settings2 } from 'lucide-react'
import { etiquetaOrgRol } from '../../lib/authRol'

export default function EmpleadoPerfilPage() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()

  const nombre = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'
  const email = user?.primaryEmailAddress?.emailAddress || '—'
  const rolLabel = membership ? etiquetaOrgRol(membership.role) : '—'

  return (
    <Box maxW="32rem" mx="auto">
      <Flex align="center" gap={3} mb={6}>
        <Settings2 size={20} strokeWidth={1.75} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mi Perfil
        </Heading>
      </Flex>

      {/* Avatar + nombre */}
      <Box
        p={6}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        mb={4}
      >
        <Flex align="center" gap={4} mb={5}>
          <Avatar
            name={nombre}
            src={user?.imageUrl}
            size="lg"
            bg="brand.primary"
            color="white"
          />
          <Box>
            <Text fontWeight="semibold" color="brand.ink">
              {nombre}
            </Text>
            <Tag size="sm" colorScheme="blue" mt={1} borderRadius="full">
              {rolLabel}
            </Tag>
          </Box>
        </Flex>

        <Divider borderColor="blackAlpha.100" mb={4} />

        <VStack align="stretch" spacing={3}>
          <CampoInfo label="Correo electrónico" valor={email} />
          <CampoInfo label="Empresa" valor={organization?.name || '—'} />
          <CampoInfo label="Rol en la organización" valor={rolLabel} />
        </VStack>
      </Box>

      <Text fontSize="xs" color="blackAlpha.500" textAlign="center">
        Para cambiar tu nombre o correo, hazlo desde la configuración de cuenta
        de Clerk (ícono de usuario en la esquina superior derecha).
      </Text>
    </Box>
  )
}

function CampoInfo({ label, valor }) {
  return (
    <Box>
      <Text fontSize="xs" color="blackAlpha.500" mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color="brand.ink" fontWeight="medium">
        {valor}
      </Text>
    </Box>
  )
}
