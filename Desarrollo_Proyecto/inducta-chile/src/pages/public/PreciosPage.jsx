import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { PLANES, etiquetaIva, uf } from '../../lib/planes'

const MotionBox = motion.create(Box)

export default function PreciosPage() {
  const [anual, setAnual] = useState(false)
  const periodo = anual ? 'anual' : 'mensual'

  return (
    <Box bg="brand.soft" pb={{ base: 16, md: 24 }}>
      <Container maxW="7xl" mx="auto" px={{ base: 5, md: 8 }} pt={{ base: 12, md: 16 }}>
        <MotionBox
          as={VStack}
          align="center"
          textAlign="center"
          spacing={0}
          mb={{ base: 12, md: 16 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Heading
            as="h1"
            size="2xl"
            color="#0d0d0d"
            fontWeight="bold"
            letterSpacing="-0.03em"
            lineHeight="1.15"
            mb={3}
          >
            Planes y precios
          </Heading>
          <Text
            color="blackAlpha.600"
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="1.65"
            maxW="60ch"
          >
            Elige el plan que mejor se adapte al tamaño de tu empresa.
          </Text>
          <MotionBox
            mt={6}
            display="inline-flex"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
          >
            <HStack
              display="inline-flex"
              bg="white"
              borderRadius="full"
              p={1}
              spacing={0}
              borderWidth="1px"
              borderColor="blackAlpha.100"
            >
              <Button
                size="sm"
                borderRadius="full"
                px={5}
                aria-pressed={!anual}
                bg={!anual ? 'brand.primary' : 'transparent'}
                color={!anual ? 'white' : 'blackAlpha.700'}
                _hover={{ bg: !anual ? 'brand.primaryDark' : 'blackAlpha.50' }}
                onClick={() => setAnual(false)}
              >
                Mensual
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                px={5}
                aria-pressed={anual}
                bg={anual ? 'brand.primary' : 'transparent'}
                color={anual ? 'white' : 'blackAlpha.700'}
                _hover={{ bg: anual ? 'brand.primaryDark' : 'blackAlpha.50' }}
                onClick={() => setAnual(true)}
              >
                Anual
              </Button>
            </HStack>
          </MotionBox>
        </MotionBox>
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 4 }}
          spacing={{ base: 5, xl: 4 }}
          alignItems="stretch"
        >
          {PLANES.map((plan, i) => (
            <MotionBox
              key={plan.id}
              as="article"
              bg="white"
              borderWidth={plan.destacado ? '2px' : '1px'}
              borderColor={plan.destacado ? 'brand.primary' : 'blackAlpha.100'}
              borderRadius="xl"
              p={{ base: 6, md: 7 }}
              h="full"
              display="flex"
              flexDirection="column"
              zIndex={plan.destacado ? 1 : 0}
              boxShadow={
                plan.destacado
                  ? '0 16px 40px rgba(27, 34, 167, 0.16)'
                  : '0 1px 3px rgba(13, 13, 13, 0.06)'
              }
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: plan.destacado ? 1.03 : 1,
              }}
              transition={{ duration: 0.45, delay: 0.18 + i * 0.08, ease: 'easeOut' }}
              whileHover={{
                y: -8,
                boxShadow: plan.destacado
                  ? '0 22px 48px rgba(27, 34, 167, 0.22)'
                  : '0 12px 28px rgba(13, 13, 13, 0.10)',
              }}
            >
              {plan.destacado ? (
                <Badge
                  alignSelf="flex-start"
                  bg="brand.primary"
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  mb={3}
                  textTransform="none"
                  fontWeight="semibold"
                >
                  Recomendado
                </Badge>
              ) : (
                <Box h="28px" mb={3} />
              )}

              <Heading as="h2" fontSize="lg" fontWeight="bold" color="brand.ink" mb={4}>
                {plan.nombre}
              </Heading>

              <Box mb={5} minH="4.5rem">
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={periodo}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Text
                      fontSize={{ base: '2.25rem', xl: '1.85rem' }}
                      fontWeight="bold"
                      color="brand.ink"
                      lineHeight="1.15"
                      whiteSpace="nowrap"
                    >
                      {uf(anual ? plan.ufAnual : plan.ufMensual)}
                      <Text as="span" fontSize="sm" fontWeight="semibold" color="blackAlpha.500" ml={1}>
                        {etiquetaIva()} · {anual ? '/ año' : '/ mes'}
                      </Text>
                    </Text>
                  </MotionBox>
                </AnimatePresence>
              </Box>

              <VStack align="stretch" spacing={3} flex="1" mb={6}>
                {plan.features.map((f) => (
                  <HStack key={f.text} align="flex-start" spacing={2.5}>
                    <Icon
                      as={f.ok ? Check : X}
                      boxSize={4}
                      mt="3px"
                      color={f.ok ? 'brand.primary' : 'blackAlpha.400'}
                    />
                    <Text
                      fontSize="sm"
                      lineHeight="1.45"
                      color={f.ok ? 'brand.ink' : 'blackAlpha.400'}
                    >
                      {f.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Button
                as={RouterLink}
                to={
                  plan.contratable
                    ? `/contratar?plan=${plan.id}&periodo=${periodo}`
                    : '/contacto'
                }
                w="full"
                borderRadius="md"
                bg={plan.destacado ? 'brand.primary' : 'white'}
                color={plan.destacado ? 'white' : 'brand.ink'}
                borderWidth={plan.destacado ? 0 : '1px'}
                borderColor="blackAlpha.200"
                _hover={{
                  bg: plan.destacado ? 'brand.primaryDark' : 'brand.soft',
                }}
              >
                {plan.cta}
              </Button>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
