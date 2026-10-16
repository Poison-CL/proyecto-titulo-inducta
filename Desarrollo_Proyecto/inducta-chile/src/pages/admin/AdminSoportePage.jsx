import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const ENLACES = [
  {
    titulo: 'Tickets / contactos',
    texto: 'Solicitudes enviadas desde el formulario de contacto y soporte público.',
    to: '/admin/tickets',
    cta: 'Ir a tickets',
  },
  {
    titulo: 'Empresas y planes',
    texto: 'Revise vencimientos, estado de cuenta temporal y renueve planes.',
    to: '/admin/empresas',
    cta: 'Ir a empresas',
  },
  {
    titulo: 'Usuarios',
    texto: 'Gestione accesos y restablezca contraseñas de cuentas de empresa.',
    to: '/admin/usuarios',
    cta: 'Ir a usuarios',
  },
]

export default function AdminSoportePage() {
  return (
    <Box maxW="48rem">
      <Heading
        as="h1"
        fontSize={{ base: '2rem', md: '2.4rem' }}
        fontWeight="semibold"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        color="brand.ink"
        mb={3}
      >
        Soporte
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="44ch" mb={12}>
        Canal interno para atender empresas: mensajes del sitio, vencimientos y cuentas.
      </Text>

      <VStack align="stretch" spacing={0} borderTopWidth="1px" borderColor="blackAlpha.100">
        {ENLACES.map((e) => (
          <Box key={e.to} py={8} borderBottomWidth="1px" borderColor="blackAlpha.100">
            <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={2}>
              {e.titulo}
            </Text>
            <Text fontSize="sm" color="blackAlpha.700" mb={5} maxW="40ch" lineHeight={1.55}>
              {e.texto}
            </Text>
            <Button
              as={RouterLink}
              to={e.to}
              variant="link"
              color="brand.primary"
              fontWeight="semibold"
              p={0}
              h="auto"
              fontSize="sm"
            >
              {e.cta} →
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}
