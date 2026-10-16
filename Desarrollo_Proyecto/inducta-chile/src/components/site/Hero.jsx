import { Box, Button, Container, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link as RouterLink } from 'react-router-dom'
import { DesktopMock, PhoneMock } from './HeroMockups'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

export default function Hero() {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bgGradient={{
        base: 'linear(to-b, white 0%, brand.wash 100%)',
        md: 'linear(to-r, white 0%, white 45%, brand.wash 100%)',
      }}
      minH="100vh"
      pt="var(--site-header-h, 72px)"
      pb={{ base: 12, md: 0 }}
    >
      <Container
        maxW="7xl"
        px={{ base: 5, md: 8 }}
        position="relative"
        zIndex={3}
        minH="calc(100vh - var(--site-header-h, 72px))"
        display="flex"
        alignItems="center"
        py={{ base: 10, md: 12 }}
      >
        <VStack
          align={{ base: 'center', md: 'flex-start' }}
          textAlign={{ base: 'center', md: 'left' }}
          spacing={5}
          maxW={{ base: '100%', md: '28rem', lg: '32rem', xl: '34rem' }}
          w="full"
          sx={{ animation: `${fadeUp} 0.5s ease both` }}
        >
          <Text
            as="span"
            display="inline-block"
            fontSize="xs"
            fontWeight="semibold"
            color="brand.primary"
            bg="brand.wash"
            borderWidth="1px"
            borderColor="brand.primary"
            borderRadius="md"
            px={3}
            py={1}
          >
            Plataforma de inducción y capacitación
          </Text>

          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: '2.1rem', sm: '2.4rem', md: '2.6rem', lg: '3rem' }}
            fontWeight="semibold"
            lineHeight="1.15"
            letterSpacing="-0.03em"
            sx={{ color: 'brand.ink' }}
          >
            Inducción clara.
            <Box as="br" />
            <Box as="span" color="brand.primary">
              Equipo listo.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="brand.ink"
            lineHeight="1.65"
            maxW="42ch"
            opacity={0.75}
          >
            Organice inducciones y capacitaciones por cargo o área, siga el avance de cada
            colaborador y deje evidencia lista para auditorías.
          </Text>

          <HStack
            spacing={3}
            flexWrap="wrap"
            justify={{ base: 'center', md: 'flex-start' }}
            pt={1}
          >
            <Button
              as={RouterLink}
              to="/precios"
              size="md"
              px={6}
              borderRadius="full"
              bg="brand.accent"
              color="white"
              fontWeight="bold"
              _hover={{ bg: 'brand.accentDark' }}
              _active={{ bg: 'brand.primaryDark' }}
            >
              Ver planes
            </Button>
            <Button
              as={RouterLink}
              to="/contacto"
              size="md"
              px={5}
              borderRadius="full"
              variant="outline"
              borderWidth="1.5px"
              borderColor="blackAlpha.300"
              color="brand.ink"
              bg="transparent"
              _hover={{ bg: 'brand.soft', borderColor: 'brand.ink' }}
            >
              Agendar demo
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Anclados al borde derecho: el dashboard queda cortado a proposito */}
      <Box
        aria-hidden
        display={{ base: 'none', md: 'block' }}
        position="absolute"
        zIndex={2}
        pointerEvents="none"
        top="var(--site-header-h, 72px)"
        bottom={0}
        left={{ md: '48%', lg: '46%', xl: '44%' }}
        right={0}
        sx={{ animation: `${fadeUp} 0.55s ease 0.08s both` }}
      >
        {/* drop-shadow sigue la silueta; filter:drop-shadow en caja recorta mal */}
        <Flex
          position="relative"
          h="full"
          align="center"
          filter="drop-shadow(0 0 30px rgba(66, 96, 230, 0.8)) drop-shadow(0 20px 38px rgba(13, 13, 13, 0.16))"
        >
          <Box flexShrink={0} zIndex={3}>
            <PhoneMock />
          </Box>
          <Box flexShrink={0} ml="-32px" zIndex={1}>
            <DesktopMock />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
