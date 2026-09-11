import { Box, Button, Container, Heading, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

export default function NoEncontradaPage() {
  return (
    <Box as="section" bg="white" py={{ base: 20, md: 28 }}>
      <Container maxW="3xl" px={{ base: 5, md: 8 }} textAlign="center">
        <Text fontSize="sm" fontWeight="bold" color="brand.primary" letterSpacing="0.08em">
          ERROR 404
        </Text>
        <Heading as="h1" size="xl" color="brand.ink" mt={3} mb={4}>
          No encontramos esta pagina
        </Heading>
        <Text color="blackAlpha.700" fontSize="md" maxW="46ch" mx="auto" lineHeight="1.7">
          Es posible que el enlace este roto o que la seccion haya cambiado de lugar.
        </Text>

        <HStack spacing={3} justify="center" pt={8}>
          <Button
            as={RouterLink}
            to="/"
            borderRadius="full"
            px={6}
            bg="brand.primary"
            color="white"
            _hover={{ bg: '#004578' }}
          >
            Volver al inicio
          </Button>
          <Button
            as={RouterLink}
            to="/contacto"
            borderRadius="full"
            px={5}
            variant="outline"
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{ bg: 'brand.soft' }}
          >
            Contactar soporte
          </Button>
        </HStack>
      </Container>
    </Box>
  )
}
