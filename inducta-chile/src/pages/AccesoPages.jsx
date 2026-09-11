import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { Box, Button, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { CalendarClock, Tags } from 'lucide-react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import AuthLoading from '../components/auth/AuthLoading'
import { AUTH_COPY, RUTAS_AUTH } from '../lib/authCopy'

function AccesoCard({ title, body, actions }) {
  return (
    <Box minH="100vh" bg="brand.soft" py={{ base: 16, md: 24 }}>
      <Container maxW="lg">
        <VStack
          spacing={5}
          align="stretch"
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderTopWidth="4px"
          borderTopColor="brand.primary"
          p={{ base: 6, md: 10 }}
          boxShadow="sm"
        >
          <Heading as="h1" size="lg" color="brand.ink">
            {title}
          </Heading>
          <Text color="gray.600" lineHeight="1.7">
            {body}
          </Text>
          <HStack spacing={3} flexWrap="wrap" pt={2}>
            {actions}
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

function useGateAutenticado() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  return { isLoaded, isSignedIn, user, signOut }
}

// Empresa autenticada sin Organization
export function AccesoSinEmpresaPage() {
  const { isLoaded, isSignedIn, signOut } = useGateAutenticado()
  const copy = AUTH_COPY.errores.sinEmpresa

  if (!isLoaded) return <AuthLoading />
  if (!isSignedIn) return <Navigate to={RUTAS_AUTH.entrarEmpresa} replace />

  return (
    <AccesoCard
      title={copy.title}
      body={copy.body}
      actions={
        <>
          <Button as={RouterLink} to={RUTAS_AUTH.precios} leftIcon={<Tags size={16} />}>
            {copy.ctaPrimario}
          </Button>
          <Button
            as={RouterLink}
            to={RUTAS_AUTH.contacto}
            variant="outline"
            borderWidth="2px"
            borderColor="brand.ink"
            leftIcon={<CalendarClock size={16} />}
          >
            {copy.ctaSecundario}
          </Button>
          <Button variant="ghost" color="brand.ink" onClick={() => signOut({ redirectUrl: '/' })}>
            {copy.ctaSalir}
          </Button>
        </>
      }
    />
  )
}

// Empleado autenticado sin membresia de Organization
export function AccesoSinMembresiaPage() {
  const { isLoaded, isSignedIn, signOut } = useGateAutenticado()
  const copy = AUTH_COPY.errores.sinMembresia

  if (!isLoaded) return <AuthLoading />
  if (!isSignedIn) return <Navigate to={RUTAS_AUTH.entrarEmpleado} replace />

  return (
    <AccesoCard
      title={copy.title}
      body={copy.body}
      actions={
        <>
          <Button as={RouterLink} to={RUTAS_AUTH.contacto}>
            {copy.ctaPrimario}
          </Button>
          <Button
            as={RouterLink}
            to={RUTAS_AUTH.inicio}
            variant="outline"
            borderWidth="2px"
            borderColor="brand.ink"
          >
            {copy.ctaSecundario}
          </Button>
          <Button variant="ghost" color="brand.ink" onClick={() => signOut({ redirectUrl: '/' })}>
            {copy.ctaSalir}
          </Button>
        </>
      }
    />
  )
}

// Alguien intento registrarse solo; no tenemos registro abierto
export function AccesoRegistroPage() {
  const copy = AUTH_COPY.errores.registroBloqueado

  return (
    <AccesoCard
      title={copy.title}
      body={copy.body}
      actions={
        <>
          <Button as={RouterLink} to={RUTAS_AUTH.precios} leftIcon={<Tags size={16} />}>
            {copy.ctaPrimario}
          </Button>
          <Button
            as={RouterLink}
            to={RUTAS_AUTH.contacto}
            variant="outline"
            borderWidth="2px"
            borderColor="brand.ink"
            leftIcon={<CalendarClock size={16} />}
          >
            {copy.ctaSecundario}
          </Button>
          <Button as={RouterLink} to={RUTAS_AUTH.entrar} variant="ghost" color="brand.ink">
            {copy.ctaVolver}
          </Button>
        </>
      }
    />
  )
}
