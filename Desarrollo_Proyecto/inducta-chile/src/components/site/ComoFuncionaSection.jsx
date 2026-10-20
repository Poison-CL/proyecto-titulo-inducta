import { Box, Button, Container, Flex, Grid, Heading, Text } from '@chakra-ui/react'
import { ArrowRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import LinkAlPanel from '../auth/LinkAlPanel'

const PASOS = [
  {
    n: '01',
    t: 'Programas por cargo',
    d: 'Defina qué debe completar cada puesto: inducción general, seguridad y lo propio del área.',
  },
  {
    n: '02',
    t: 'Accesos y asignación',
    d: 'De de alta a colaboradores con su correo y asígneles el programa que corresponde.',
  },
  {
    n: '03',
    t: 'Avance del equipo',
    d: 'Controle quién está al día, quién se atrasó y el resultado de cada prueba.',
  },
  {
    n: '04',
    t: 'Evidencia lista',
    d: 'Conserve quién, qué y cuándo: el registro queda disponible para auditorías y fiscalizaciones.',
  },
]

export default function ComoFuncionaSection() {
  return (
    <Box as="section" bg="white" py={{ base: 14, md: 20 }}>
      <Container maxW="6xl" px={{ base: 5, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'flex-end' }}
          justify="space-between"
          gap={6}
          mb={{ base: 10, md: 14 }}
          pb={{ base: 8, md: 10 }}
          borderBottomWidth="1px"
          borderColor="blackAlpha.100"
        >
          <Box maxW="36rem">
            <Heading
              as="h2"
              fontSize={{ base: '1.85rem', md: '2.5rem' }}
              fontWeight="semibold"
              letterSpacing="-0.035em"
              lineHeight="1.1"
              color="brand.ink"
              mb={3}
            >
              Inducción bajo control. Evidencia sin planillas.
            </Heading>
            <Text color="blackAlpha.700" lineHeight="1.6" fontSize={{ base: 'md', md: 'lg' }}>
              Cuatro pasos para que RR.HH. y jefaturas dejen de perseguir firmas y puedan demostrar el cumplimiento.
            </Text>
          </Box>

          <Flex gap={3} flexShrink={0} wrap="wrap">
            <Button
              as={RouterLink}
              to="/recursos"
              h="44px"
              px={6}
              borderRadius="md"
              bg="brand.primary"
              color="white"
              fontWeight="semibold"
              rightIcon={<ArrowRight size={16} aria-hidden />}
              _hover={{ bg: 'brand.primaryDark' }}
            >
              Ver documentación
            </Button>
            <LinkAlPanel
              h="44px"
              px={6}
              borderRadius="md"
              variant="outline"
              borderColor="blackAlpha.200"
              color="brand.ink"
              bg="white"
              _hover={{ bg: 'brand.soft', borderColor: 'blackAlpha.300' }}
            >
              Ir al panel
            </LinkAlPanel>
          </Flex>
        </Flex>

        <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={0}>
          {PASOS.map((paso, i) => (
            <Box
              key={paso.n}
              px={{ base: 0, lg: 5 }}
              py={{ base: 6, lg: 0 }}
              borderTopWidth={{ base: i === 0 ? 0 : '1px', sm: i < 2 ? 0 : '1px', lg: 0 }}
              borderLeftWidth={{ base: 0, lg: i === 0 ? 0 : '1px' }}
              borderColor="blackAlpha.100"
              pl={{ lg: i === 0 ? 0 : 6 }}
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                letterSpacing="0.06em"
                color="brand.primary"
                mb={3}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {paso.n}
              </Text>
              <Text fontSize="lg" fontWeight="semibold" letterSpacing="-0.02em" mb={2} lineHeight="1.25" color="brand.ink">
                {paso.t}
              </Text>
              <Text fontSize="sm" color="blackAlpha.700" lineHeight="1.55">
                {paso.d}
              </Text>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
