import { Box, Button, Container, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

export default function NoEncontradaPage() {
  return (
    <Box as="section" bg="white" py={{ base: 20, md: 32 }}>
      <Container maxW="6xl" px={{ base: 5, md: 10 }}>
        <Text fontWeight="semibold" color="blackAlpha.600" mb={3}>
          Error 404
        </Text>
        <Heading
          as="h1"
          fontSize={{ base: '2.4rem', md: '3.6rem' }}
          fontWeight="semibold"
          letterSpacing="-0.04em"
          lineHeight="1.05"
          color="brand.ink"
          maxW="16ch"
          mb={5}
        >
          No encontramos esta página.
        </Heading>
        <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} maxW="46ch" lineHeight="1.6">
          Es posible que el enlace esté roto o que la sección haya cambiado de lugar.
        </Text>

        <Flex gap={7} wrap="wrap" align="center" mt={8}>
          <Button as={RouterLink} to="/" h="46px" px={7} bg="brand.primary" color="white" _hover={{ bg: 'brand.primaryDark' }}>
            Volver al inicio
          </Button>
          <Link
            as={RouterLink}
            to="/recursos/soporte"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontWeight="medium"
            color="brand.primary"
          >
            Ir a soporte <ChevronRight size={18} aria-hidden />
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
