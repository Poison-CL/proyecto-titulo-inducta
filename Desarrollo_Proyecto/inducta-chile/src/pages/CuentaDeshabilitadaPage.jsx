import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useClerk } from '@clerk/clerk-react'
import { Link as RouterLink } from 'react-router-dom'

export default function CuentaDeshabilitadaPage() {
  const { signOut } = useClerk()

  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center">
      <Container maxW="lg">
        <VStack spacing={6} align="stretch" textAlign="center">
          <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight={600} color="brand.ink">
            Cuenta deshabilitada
          </Heading>
          <Text color="blackAlpha.700" lineHeight={1.7} fontSize="md">
            Su cuenta fue deshabilitada por no cambiar sus datos. Comuníquese con soporte para reactivarla o
            recuperar el acceso.
          </Text>
          <Text fontSize="sm" color="blackAlpha.600">
            Soporte:{' '}
            <Box as="a" href="mailto:soporte@inducta.cl" color="brand.primary" fontWeight={600}>
              soporte@inducta.cl
            </Box>
          </Text>
          <VStack spacing={3} pt={2}>
            <Button
              as={RouterLink}
              to="/contacto"
              bg="brand.primary"
              color="white"
              _hover={{ bg: 'brand.primaryDark' }}
              w="full"
              maxW="280px"
              mx="auto"
            >
              Ir a contacto
            </Button>
            <Button variant="ghost" onClick={() => signOut({ redirectUrl: '/' })}>
              Cerrar sesión
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
