import { Box, Button, Container, Flex, Grid, Image, Link, Text, VStack } from '@chakra-ui/react'
import { ArrowRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const columnas = [
  {
    titulo: 'Plataforma',
    items: [
      { label: 'Hub de recursos', to: '/recursos' },
      { label: 'Guías de inducción', to: '/recursos/guias' },
      { label: 'Documentación', to: '/recursos/documentacion' },
      { label: 'Planes y precios', to: '/precios' },
    ],
  },
  {
    titulo: 'Sitio',
    items: [
      { label: 'Inicio', to: '/' },
      { label: 'Preguntas frecuentes', to: '/#preguntas' },
      { label: 'Recursos', to: '/recursos' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
  {
    titulo: 'Ingresar',
    items: [
      { label: 'Como empresa', to: '/entrar?rol=empresa' },
      { label: 'Como empleado', to: '/entrar?rol=empleado' },
    ],
  },
]

const linkStyle = {
  fontSize: 'sm',
  color: 'whiteAlpha.800',
  transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: { color: 'white', textDecoration: 'none' },
}

function Titulo({ children }) {
  return (
    <Text as="h2" fontSize="sm" fontWeight="semibold" color="brand.soft" mb={1}>
      {children}
    </Text>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <Box as="footer" bg="brand.ink" color="white" mt="auto">
      <Box h="4px" bg="brand.primary" />
      <Container maxW="6xl" px={{ base: 4, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'start', md: 'end' }}
          gap={6}
          py={{ base: 12, md: 16 }}
          borderBottomWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <Text
            fontSize={{ base: '1.6rem', md: '2.1rem' }}
            fontWeight="semibold"
            lineHeight="1.15"
            letterSpacing="-0.03em"
            maxW="20ch"
          >
            Ordene el ingreso de su equipo desde el primer día.
          </Text>
          <Flex gap={3} wrap="wrap">
            <Button
              as={RouterLink}
              to="/contacto"
              bg="brand.accent"
              color="white"
              _hover={{ bg: 'brand.accentDark' }}
              rightIcon={<ArrowRight size={16} />}
            >
              Agendar demo
            </Button>
            <Button
              as={RouterLink}
              to="/precios"
              variant="outline"
              bg="transparent"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.600' }}
            >
              Ver planes
            </Button>
          </Flex>
        </Flex>

        <Grid
          templateColumns={{ base: '1fr 1fr', lg: '1.6fr repeat(3, 1fr) 1.3fr' }}
          gap={{ base: 10, md: 12 }}
          py={{ base: 12, md: 14 }}
        >
          <VStack align="start" spacing={4} gridColumn={{ base: '1 / -1', lg: 'auto' }}>
            <Image src="/logo-azul.png" alt="Inducta Chile" h="30px" w="auto" />
            <Text fontSize="sm" color="whiteAlpha.700" maxW="34ch" lineHeight="1.7">
              Plataforma de inducción y capacitación para empresas: programas por cargo,
              seguimiento del avance y evidencia lista para auditorías.
            </Text>
          </VStack>

          {columnas.map((col) => (
            <VStack as="nav" aria-label={col.titulo} key={col.titulo} align="start" spacing={3}>
              <Titulo>{col.titulo}</Titulo>
              {col.items.map((item) => (
                <Link key={item.label} as={RouterLink} to={item.to} {...linkStyle}>
                  {item.label}
                </Link>
              ))}
            </VStack>
          ))}

          <VStack as="address" fontStyle="normal" align="start" spacing={3}>
            <Titulo>Contacto</Titulo>
            <Link href="mailto:contacto@inductachile.cl" {...linkStyle}>
              contacto@inductachile.cl
            </Link>
            <Text fontSize="sm" color="whiteAlpha.800">+56 2 0000 0000</Text>
            <Text fontSize="sm" color="whiteAlpha.800">Santiago, Chile</Text>
          </VStack>
        </Grid>

        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'start', sm: 'center' }}
          gap={3}
          py={6}
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          fontSize="xs"
          color="whiteAlpha.600"
        >
          <Text>© {year} Inducta Chile SpA. Todos los derechos reservados.</Text>
          <Flex gap={5}>
            <Link as={RouterLink} to="/contacto" color="inherit" _hover={{ color: 'white' }}>
              Privacidad
            </Link>
            <Link as={RouterLink} to="/contacto" color="inherit" _hover={{ color: 'white' }}>
              Términos
            </Link>
            <Link as={RouterLink} to="/recursos/soporte" color="inherit" _hover={{ color: 'white' }}>
              Soporte
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
