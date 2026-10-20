import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { DashboardPanelMock } from './HeroMockups'

export default function Hero() {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      minH="100svh"
      display="flex"
      flexDirection="column"
      pt="var(--site-header-h, 72px)"
      bg="white"
    >
      <Container
        maxW="7xl"
        px={{ base: 5, md: 10 }}
        flex="1"
        display="flex"
        flexDirection="column"
        position="relative"
        zIndex={1}
        minH={0}
      >
        <VStack
          flex="1"
          justify="flex-end"
          align="center"
          textAlign="center"
          spacing={0}
          pt={{ base: 8, md: 10 }}
          pb={{ base: 6, md: 8 }}
        >
          <Text
            fontSize={{ base: '0.65rem', md: '0.7rem' }}
            fontWeight="medium"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="blackAlpha.600"
            mb={{ base: 3, md: 4 }}
          >
            Inducción y capacitación para empresas
          </Text>

          <Heading
            as="h1"
            fontSize={{ base: '3rem', sm: '3.75rem', md: '5rem', lg: '5.75rem' }}
            fontWeight="semibold"
            lineHeight="1.02"
            letterSpacing="-0.045em"
            color="brand.ink"
            mb={{ base: 4, md: 5 }}
          >
            <Box as="span" display="block">
              Inducción clara.
            </Box>
            <Box as="span" display="block" color="brand.primary">
              Equipo listo.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            color="blackAlpha.700"
            lineHeight="1.5"
            maxW="42ch"
            mb={{ base: 6, md: 8 }}
          >
            Programas por cargo, avance de cada colaborador y evidencia lista para auditorías, en un solo lugar.
          </Text>

          <Flex gap={3} wrap="wrap" justify="center">
            <Button
              as={RouterLink}
              to="/precios"
              h={{ base: '48px', md: '52px' }}
              px={8}
              borderRadius="md"
              bg="brand.primary"
              color="white"
              fontWeight="semibold"
              fontSize="md"
              rightIcon={<ChevronRight size={18} aria-hidden />}
              _hover={{ bg: 'brand.primaryDark' }}
            >
              Ver planes
            </Button>
            <Button
              as={RouterLink}
              to="/contacto"
              h={{ base: '48px', md: '52px' }}
              px={8}
              borderRadius="md"
              variant="outline"
              borderColor="blackAlpha.200"
              bg="white"
              color="brand.ink"
              fontWeight="semibold"
              fontSize="md"
              _hover={{ bg: 'brand.soft', borderColor: 'blackAlpha.300' }}
            >
              Agendar demo
            </Button>
          </Flex>
        </VStack>

        <Box
          aria-hidden
          position="relative"
          w="full"
          flexShrink={0}
          h={{ base: '260px', sm: '320px', md: '380px', lg: '420px' }}
          overflow="hidden"
          pointerEvents="none"
        >
          <DashboardPanelMock />
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            h={{ base: '55%', md: '50%' }}
            bgGradient="linear(to-b, transparent, white)"
          />
        </Box>
      </Container>
    </Box>
  )
}
