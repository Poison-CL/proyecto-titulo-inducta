import { useState } from 'react'
import { Box, Button, Container, Flex, Heading, HStack, Icon, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Minus } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { PLANES, etiquetaIva } from '../../lib/planes'

const MotionBox = motion.create(Box)

const numero = (n) => String(Math.round(n * 100) / 100).replace('.', ',')

export default function PreciosPage() {
  const reduce = useReducedMotion()
  const [anual, setAnual] = useState(false)
  const periodo = anual ? 'anual' : 'mensual'

  return (
    <Box bg="white" pb={{ base: 16, md: 24 }}>
      <Container maxW="7xl" px={{ base: 5, md: 8 }} pt={{ base: 10, md: 14 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'flex-end' }}
          justify="space-between"
          gap={6}
          pb={8}
          mb={8}
          borderBottomWidth="1px"
          borderColor="blackAlpha.100"
        >
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '2rem', md: '2.6rem' }}
              color="#0d0d0d"
              fontWeight="semibold"
              letterSpacing="-0.03em"
              lineHeight="1.05"
              mb={3}
            >
              Planes y precios
            </Heading>
            <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="52ch">
              Elija el plan que mejor se adapte al tamaño de su empresa.
            </Text>
          </Box>

          <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={2}>
            <HStack
              role="group"
              aria-label="Periodo de pago"
              bg="brand.soft"
              borderRadius="full"
              p={1}
              spacing={0}
              borderWidth="1px"
              borderColor="blackAlpha.100"
            >
              {[
                { label: 'Mensual', on: !anual, set: false },
                { label: 'Anual', on: anual, set: true },
              ].map((o) => (
                <Button
                  key={o.label}
                  size="sm"
                  borderRadius="full"
                  px={5}
                  aria-pressed={o.on}
                  bg={o.on ? 'brand.primary' : 'transparent'}
                  color={o.on ? 'white' : 'blackAlpha.700'}
                  _hover={{ bg: o.on ? 'brand.primaryDark' : 'blackAlpha.50' }}
                  onClick={() => setAnual(o.set)}
                >
                  {o.label}
                </Button>
              ))}
            </HStack>
            <Text fontSize="sm" color={anual ? 'brand.primary' : 'blackAlpha.600'} fontWeight={anual ? 'semibold' : 'normal'}>
              Con pago anual, 2 meses sin costo.
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} alignItems="stretch">
          {PLANES.map((plan) => {
            const gratis = plan.ufMensual === 0
            const monto = anual ? plan.ufAnual : plan.ufMensual
            return (
              <Box
                key={plan.id}
                as="article"
                bg={plan.destacado ? 'brand.soft' : 'white'}
                borderWidth={plan.destacado ? '2px' : '1px'}
                borderColor={plan.destacado ? 'brand.primary' : 'blackAlpha.100'}
                borderRadius="xl"
                p={{ base: 6, md: 7 }}
                display="flex"
                flexDirection="column"
              >
                <HStack justify="space-between" align="baseline" mb={1}>
                  <Heading as="h2" fontSize="lg" fontWeight="semibold" color="brand.ink">
                    {plan.nombre}
                  </Heading>
                  {plan.destacado && (
                    <Text fontSize="xs" fontWeight="semibold" color="brand.primary">
                      Recomendado
                    </Text>
                  )}
                </HStack>
                <Text fontSize="sm" color="blackAlpha.600" lineHeight="1.5" minH={{ xl: '2.6rem' }} mb={6}>
                  {plan.para}
                </Text>

                <Box minH="5.25rem" mb={6}>
                  <AnimatePresence mode="wait" initial={false}>
                    <MotionBox
                      key={gratis ? 'gratis' : periodo}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                    >
                      {gratis ? (
                        <>
                          <Text fontSize="2.25rem" fontWeight="semibold" letterSpacing="-0.03em" lineHeight="1.1" color="brand.ink">
                            Sin costo
                          </Text>
                          <Text fontSize="sm" color="blackAlpha.600" mt={1}>
                            Agendada con nuestro equipo
                          </Text>
                        </>
                      ) : (
                        <>
                          <HStack align="baseline" spacing={1.5}>
                            <Text fontSize="2.5rem" fontWeight="semibold" letterSpacing="-0.03em" lineHeight="1.1" color="brand.ink" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                              {numero(monto)}
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold" color="brand.ink">
                              UF {anual ? '/ año' : '/ mes'}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="blackAlpha.600" mt={1}>
                            {anual ? `Equivale a ${numero(plan.ufAnual / 12)} UF al mes · ` : ''}
                            {etiquetaIva()}
                          </Text>
                        </>
                      )}
                    </MotionBox>
                  </AnimatePresence>
                </Box>

                <Button
                  as={RouterLink}
                  to={plan.contratable ? `/contratar?plan=${plan.id}&periodo=${periodo}` : '/contacto'}
                  w="full"
                  mb={6}
                  variant={plan.destacado ? 'solid' : 'outline'}
                >
                  {plan.cta}
                </Button>

                <VStack as="ul" listStyleType="none" align="stretch" spacing={2.5} pt={5} borderTopWidth="1px" borderColor="blackAlpha.100">
                  {plan.features.map((f) => (
                    <HStack as="li" key={f.text} align="flex-start" spacing={2.5}>
                      <Icon as={f.ok ? Check : Minus} boxSize={4} mt="3px" color={f.ok ? 'brand.primary' : 'blackAlpha.300'} aria-hidden />
                      <Text fontSize="sm" lineHeight="1.45" color={f.ok ? 'brand.ink' : 'blackAlpha.400'}>
                        {f.ok ? f.text : <><Box as="span" srOnly>No incluye: </Box>{f.text}</>}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )
          })}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, md: 8 }} mt={{ base: 12, md: 16 }} pt={8} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Box>
            <Text fontWeight="semibold" color="brand.ink" mb={1}>
              Precios en UF
            </Text>
            <Text fontSize="sm" color="blackAlpha.700" lineHeight="1.6">
              Al contratar, el monto en pesos se calcula con el valor de la UF del día, más IVA.
            </Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" color="brand.ink" mb={1}>
              Pago con Webpay
            </Text>
            <Text fontSize="sm" color="blackAlpha.700" lineHeight="1.6">
              Si el pago no se completa, no se realiza ningún cargo y puede intentarlo de nuevo.
            </Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" color="brand.ink" mb={1}>
              ¿No sabe qué plan elegir?
            </Text>
            <Text fontSize="sm" color="blackAlpha.700" lineHeight="1.6">
              Cuéntenos el tamaño de su equipo y le recomendamos uno.{' '}
              <Link as={RouterLink} to="/contacto?motivo=planes" color="brand.primary" fontWeight="semibold">
                Hablemos
              </Link>
            </Text>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
