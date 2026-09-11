import { Box, Button, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link as RouterLink } from 'react-router-dom'
import Silk from '../bits/Silk'
import { DesktopMock, PhoneMock } from './HeroMockups'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

const HIGHLIGHT = '#9BD4F0'

export default function Hero() {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg="brand.primary"
      minH="100vh"
      pt="var(--site-header-h, 72px)"
      pb={{ base: 12, md: 0 }}
    >
      {/* El fondo animado va solo a la derecha; a la izquierda dejamos color plano
          para que el titulo se lea bien */}
      <Box
        position="absolute"
        inset={0}
        zIndex={0}
        opacity={0.35}
        display={{ base: 'none', md: 'block' }}
        clipPath="inset(0 0 0 45%)"
      >
        <Silk
          speed={3.5}
          scale={0.85}
          color="#005691"
          noiseIntensity={0.35}
          rotation={0.2}
        />
      </Box>
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        pointerEvents="none"
        bgGradient={{
          base: 'linear(to-b, #004578 0%, brand.primary 100%)',
          md: 'linear(to-r, #003a63 0%, #004578 42%, brand.primary 70%, #0066a8 100%)',
        }}
      />

      {/* El texto ocupa la mitad izquierda */}
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
            color="white"
            borderWidth="1px"
            borderColor="white"
            borderRadius="md"
            px={3}
            py={1}
          >
            Plataforma de induccion y capacitacion
          </Text>

          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: '2.1rem', sm: '2.4rem', md: '2.6rem', lg: '3rem' }}
            fontWeight="semibold"
            lineHeight="1.15"
            letterSpacing="-0.03em"
            sx={{ color: 'white' }}
          >
            Induccion clara.
            <Box as="br" />
            <Box as="span" color={HIGHLIGHT}>
              Equipo listo.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="white"
            lineHeight="1.65"
            maxW="42ch"
            opacity={0.95}
          >
            Organice inducciones y capacitaciones por cargo o area, siga el avance de cada
            colaborador y deje evidencia lista para auditorias.
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
              _hover={{ bg: '#d33a3a' }}
              _active={{ bg: '#c03232' }}
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
              borderColor="white"
              color="white"
              bg="transparent"
              _hover={{ bg: 'whiteAlpha.200', borderColor: 'white', color: 'white' }}
            >
              Agendar demo
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/*
        Los mockups arrancan pasada la mitad para no pisar el texto y se anclan al
        borde derecho. El dashboard queda cortado contra ese borde, es a proposito.
      */}
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
        <Box position="relative" h="full">
          {/* Glow detras del movil */}
          <Box
            position="absolute"
            left="-40px"
            top="50%"
            transform="translateY(-50%)"
            w={{ md: '320px', lg: '380px' }}
            h={{ md: '340px', lg: '400px' }}
            borderRadius="full"
            bg="#5EB8F0"
            opacity={0.5}
            filter="blur(60px)"
            zIndex={0}
          />

          {/* El dashboard va detras del telefono */}
          <Box
            position="absolute"
            left={{ md: '110px', lg: '140px' }}
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
          >
            <DesktopMock />
          </Box>

          {/* El telefono va encima, pisando el tercio izquierdo del dashboard */}
          <Box
            position="absolute"
            left={{ md: '0px', lg: '16px' }}
            top="50%"
            transform="translateY(-50%)"
            zIndex={3}
          >
            <PhoneMock />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
