import {
  Box,
  Container,
  Divider,
  Flex,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const columnas = [
  {
    titulo: 'Plataforma',
    items: [
      { label: 'Inducciones', to: '/recursos' },
      { label: 'Capacitaciones', to: '/recursos' },
      { label: 'Cumplimiento y evidencia', to: '/recursos' },
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
]

const linkStyle = {
  fontSize: 'sm',
  color: 'whiteAlpha.800',
  _hover: { color: 'white', textDecoration: 'none' },
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <Box as="footer" bg="brand.ink" color="white" mt="auto">
      <Box h="4px" bg="brand.primary" />
      <Container maxW="6xl" px={{ base: 4, md: 8 }} py={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 10, md: 12 }}>
          <VStack align="start" spacing={4}>
            <Text fontFamily="heading" fontWeight="bold" color="white" fontSize="lg">
              Inducta Chile
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700" maxW="34ch" lineHeight="1.7">
              Plataforma de inducción y capacitacion para empresas: programas por cargo,
              seguimiento del avance y evidencia lista para auditorias.
            </Text>
          </VStack>

          {columnas.map((col) => (
            <VStack key={col.titulo} align="start" spacing={3}>
              <Text fontWeight="semibold" fontSize="sm" color="brand.soft">
                {col.titulo}
              </Text>
              {col.items.map((item) => (
                <Link key={item.label} as={RouterLink} to={item.to} {...linkStyle}>
                  {item.label}
                </Link>
              ))}
            </VStack>
          ))}

          <VStack align="start" spacing={3}>
            <Text fontWeight="semibold" fontSize="sm" color="brand.soft">
              Acceso y contacto
            </Text>
            <Link as={RouterLink} to="/entrar?rol=empresa" {...linkStyle}>
              <HStack spacing={2}>
                <Icon as={Building2} boxSize={4} color="whiteAlpha.600" />
                <Text as="span">Ingresar como empresa</Text>
              </HStack>
            </Link>
            <Link as={RouterLink} to="/entrar?rol=empleado" {...linkStyle}>
              <HStack spacing={2}>
                <Icon as={UserRound} boxSize={4} color="whiteAlpha.600" />
                <Text as="span">Ingresar como empleado</Text>
              </HStack>
            </Link>

            <Divider borderColor="whiteAlpha.200" my={1} />

            <HStack spacing={2} fontSize="sm" color="whiteAlpha.800">
              <Icon as={Mail} boxSize={4} color="whiteAlpha.600" />
              <Link href="mailto:contacto@inductachile.cl" {...linkStyle}>
                contacto@inductachile.cl
              </Link>
            </HStack>
            <HStack spacing={2} fontSize="sm" color="whiteAlpha.800">
              <Icon as={Phone} boxSize={4} color="whiteAlpha.600" />
              <Text>+56 2 0000 0000</Text>
            </HStack>
            <HStack spacing={2} fontSize="sm" color="whiteAlpha.800">
              <Icon as={MapPin} boxSize={4} color="whiteAlpha.600" />
              <Text>Santiago, Chile</Text>
            </HStack>
          </VStack>
        </SimpleGrid>

        <Divider my={10} borderColor="whiteAlpha.200" />

        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'start', sm: 'center' }}
          gap={3}
          fontSize="xs"
          color="whiteAlpha.600"
        >
          <Text>© {year} Inducta Chile SpA. Todos los derechos reservados.</Text>
          <HStack spacing={5}>
            <Link href="#" _hover={{ color: 'white' }}>
              Privacidad
            </Link>
            <Link href="#" _hover={{ color: 'white' }}>
              Terminos
            </Link>
            <Link as={RouterLink} to="/contacto" _hover={{ color: 'white' }}>
              Soporte
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
