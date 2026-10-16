import { Fragment } from 'react'
import { Box, Button, Container, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { DesktopMock, PhoneMock } from './HeroMockups'

const revelar = keyframes`
  from { opacity: 0; transform: translateY(24px); filter: blur(12px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
`

const entrada = (delay) => ({
  animation: `${revelar} 0.9s cubic-bezier(0.32, 0.72, 0, 1) ${delay}s both`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
})

const LINEAS = [
  { palabras: ['Inducción', 'clara.'], color: 'brand.ink' },
  { palabras: ['Equipo', 'listo.'], color: 'brand.primary' },
]

export default function Hero() {
  let n = 0
  return (
    <Box
      as="section"
      bg="white"
      overflow="hidden"
      minH="100svh"
      display="flex"
      flexDirection="column"
      pt="var(--site-header-h, 72px)"
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Container maxW="7xl" px={{ base: 5, md: 10 }} flex="1" display="flex" flexDirection="column">
        <Flex flex="1" align="center" py={{ base: 14, md: 12 }}>
        <Box w="full" maxW="6xl" mx="auto">
        <Flex
          direction={{ base: 'column', xl: 'row' }}
          align={{ base: 'flex-start', xl: 'flex-end' }}
          justify="space-between"
          gap={{ base: 0, xl: 16 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: '3rem', sm: '3.8rem', md: '5rem', lg: '6rem', xl: '7rem' }}
            fontWeight="semibold"
            lineHeight="1"
            letterSpacing="-0.045em"
          >
            {LINEAS.map((linea) => (
              <Box as="span" display="block" whiteSpace="nowrap" color={linea.color} key={linea.palabras[0]}>
                {linea.palabras.map((p, i) => (
                  <Fragment key={p}>
                    {i > 0 && ' '}
                    <Box as="span" display="inline-block" sx={entrada(0.1 + 0.09 * n++)}>
                      {p}
                    </Box>
                  </Fragment>
                ))}
              </Box>
            ))}
          </Heading>

          <Text
            maxW={{ base: '44ch', xl: '23rem' }}
            flexShrink={0}
            mt={{ base: 5, md: 6, xl: 0 }}
            fontSize={{ base: 'md', md: 'xl', xl: '1.1875rem' }}
            color="blackAlpha.800"
            pb={{ xl: '0.55rem' }}
            lineHeight="1.55"
            sx={entrada(0.46)}
          >
            Organice inducciones y capacitaciones por cargo o área, siga el avance de cada
            colaborador y deje evidencia lista para auditorías.
          </Text>
        </Flex>

            <Flex gap={7} wrap="wrap" align="center" mt={{ base: 7, md: 8, xl: 10 }} sx={entrada(0.55)}>
              <Button
                as={RouterLink}
                to="/precios"
                h="46px"
                px={7}
                borderRadius="full"
                bg="brand.primary"
                color="white"
                fontWeight="medium"
                fontSize="md"
                _hover={{ bg: 'brand.primaryDark' }}
              >
                Ver planes
              </Button>
              <Link
                as={RouterLink}
                to="/contacto"
                display="inline-flex"
                alignItems="center"
                gap={1}
                fontSize="md"
                fontWeight="medium"
                color="brand.accent"
                role="group"
                _hover={{ color: 'brand.accentDark', textDecoration: 'none' }}
              >
                Agendar demo
                <Box
                  as="span"
                  display="inline-flex"
                  transition="transform 200ms cubic-bezier(0.32, 0.72, 0, 1)"
                  _groupHover={{ transform: 'translateX(3px)' }}
                >
                  <ChevronRight size={18} aria-hidden />
                </Box>
              </Link>
            </Flex>
        </Box>
        </Flex>

        {/* Decorativo: los datos del mockup son de ejemplo. El borde inferior de la seccion lo recorta. */}
        <Box
          aria-hidden
          display={{ base: 'none', md: 'block' }}
          pointerEvents="none"
          w="full"
          maxW="6xl"
          mx="auto"
          flexShrink={0}
          h={{ md: '240px', lg: '300px' }}
          sx={entrada(0.64)}
        >
          <Box position="relative" ml={{ md: '180px', lg: '200px' }}>
            <Box filter="drop-shadow(0 18px 40px rgba(13, 13, 13, 0.12))">
              <DesktopMock />
            </Box>
            <Box
              position="absolute"
              left={{ md: '-180px', lg: '-200px' }}
              top={{ md: '48px', lg: '56px' }}
              filter="drop-shadow(0 18px 36px rgba(13, 13, 13, 0.18))"
            >
              <PhoneMock />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
