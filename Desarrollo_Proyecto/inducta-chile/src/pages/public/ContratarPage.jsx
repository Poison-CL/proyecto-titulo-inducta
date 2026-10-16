import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Link,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Check, CircleHelp } from 'lucide-react'
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom'
import { useUfHoy } from '../../hooks/useUfHoy'
import { formateaRut, formateaTel, mascaraTel, rutValido, telefonoValido } from '../../lib/chile'
import { IVA_CHILE, clp, getPlan, montoPlan, precioFinalClp, uf } from '../../lib/planes'
import { iniciarPagoTransbank } from '../../services/transbank'

const MotionBox = motion.create(Box)
const ease = [0.32, 0.72, 0, 1]

const inputProps = {
  bg: 'white',
  borderColor: 'blackAlpha.200',
  _hover: { borderColor: 'blackAlpha.300' },
  _focusVisible: { borderColor: 'brand.primary', boxShadow: '0 0 0 1px #1B22A7' },
}

function LabelAyuda({ children, ayuda }) {
  return (
    <FormLabel
      requiredIndicator={null}
      display="flex"
      alignItems="center"
      gap={1}
      mb={1.5}
      fontSize="sm"
      fontWeight="semibold"
      color="brand.ink"
    >
      {children}
      <Tooltip label={ayuda} hasArrow placement="top" openDelay={200}>
        <IconButton
          type="button"
          aria-label="Ver ejemplo"
          icon={<CircleHelp size={14} />}
          size="xs"
          variant="ghost"
          color="blackAlpha.400"
          minW="20px"
          h="20px"
        />
      </Tooltip>
    </FormLabel>
  )
}

const PASOS = ['Datos de facturación', 'Confirmación', 'Pago en Webpay']

function Pasos({ actual }) {
  return (
    <Flex as="ol" listStyleType="none" gap={{ base: 4, md: 8 }} wrap="wrap" fontSize="sm">
      {PASOS.map((p, i) => {
        const hecho = i < actual
        const activo = i === actual
        return (
          <Flex
            as="li"
            key={p}
            align="center"
            gap={2}
            color={activo ? 'brand.ink' : 'blackAlpha.500'}
            fontWeight={activo ? 'semibold' : 'medium'}
            aria-current={activo ? 'step' : undefined}
          >
            <Flex
              boxSize="22px"
              borderRadius="full"
              align="center"
              justify="center"
              fontSize="xs"
              fontWeight="semibold"
              bg={activo || hecho ? 'brand.primary' : 'transparent'}
              color={activo || hecho ? 'white' : 'blackAlpha.500'}
              borderWidth={activo || hecho ? 0 : '1px'}
              borderColor="blackAlpha.300"
            >
              {hecho ? <Check size={13} aria-hidden /> : i + 1}
            </Flex>
            {p}
          </Flex>
        )
      })}
    </Flex>
  )
}

function Linea({ label, valor, fuerte }) {
  return (
    <Flex justify="space-between" gap={4} fontSize={fuerte ? 'md' : 'sm'}>
      <Text color={fuerte ? 'brand.ink' : 'blackAlpha.600'} fontWeight={fuerte ? 'semibold' : 'normal'}>
        {label}
      </Text>
      <Text
        color="brand.ink"
        fontWeight={fuerte ? 'semibold' : 'medium'}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {valor}
      </Text>
    </Flex>
  )
}

const VACIO = {
  email: '',
  titular: '',
  giro: '',
  rut: '',
  telefono: '',
  direccion: '',
}

export default function ContratarPage() {
  const [params] = useSearchParams()
  const ufClp = useUfHoy()
  const reducir = useReducedMotion()
  const [documento, setDocumento] = useState('factura')
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [listo, setListo] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)

  const errorPago = params.get('error')
  if (errorPago === 'pago_fallido' || errorPago === 'servidor') {
    return <Navigate to="/pago/rechazado" replace />
  }

  const plan = getPlan(params.get('plan'))
  const periodo = params.get('periodo') === 'anual' ? 'anual' : 'mensual'
  const esFactura = documento === 'factura'

  if (!plan?.contratable) {
    return <Navigate to="/precios" replace />
  }

  const monto = montoPlan(plan, periodo)
  const neto = ufClp ? Math.round(monto * ufClp) : null
  const beneficios = plan.features.filter((f) => f.ok)
  const set = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }))
    if (errores[campo]) setErrores((err) => ({ ...err, [campo]: '' }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!rutValido(datos.rut)) {
      next.rut = 'Ingrese un RUT chileno válido. No se aceptan RUT de prueba ni dígito verificador incorrecto.'
    }
    if (!telefonoValido(datos.telefono)) {
      next.telefono = 'Ingrese un teléfono chileno válido, por ejemplo +56 9 6123 4587.'
    }
    setErrores(next)
    if (Object.keys(next).length) return
    setDatos((d) => ({
      ...d,
      rut: formateaRut(d.rut),
      telefono: formateaTel(d.telefono),
    }))
    setListo(true)
  }

  const handleIniciarPago = async () => {
    setProcesandoPago(true)
    try {
      const montoPagar = precioFinalClp(monto, ufClp)

      const tbkData = await iniciarPagoTransbank({
        nombre_comercial: datos.titular,
        email_contacto: datos.email,
        monto: Math.round(montoPagar),
        plan_solicitado: plan.nombre.toLowerCase(),
      })

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = tbkData.url

      const inputToken = document.createElement('input')
      inputToken.type = 'hidden'
      inputToken.name = 'token_ws'
      inputToken.value = tbkData.token

      form.appendChild(inputToken)
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Error al iniciar el pago:', error)
      alert('Hubo un problema al contactar con Webpay. Por favor, intenta de nuevo.')
    } finally {
      setProcesandoPago(false)
    }
  }

  const paso = {
    initial: reducir ? { opacity: 0 } : { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: reducir ? { opacity: 0 } : { opacity: 0, x: -12 },
    transition: { duration: 0.25, ease },
  }

  return (
    <Box bg="white" py={{ base: 8, md: 12 }}>
      <Container maxW="6xl" px={{ base: 5, md: 8 }}>
        <Link
          as={RouterLink}
          to="/precios"
          display="inline-flex"
          alignItems="center"
          gap={1.5}
          fontSize="sm"
          fontWeight="medium"
          color="blackAlpha.700"
          mb={6}
        >
          <ArrowLeft size={16} aria-hidden />
          Volver a planes
        </Link>

        <Heading
          as="h1"
          fontSize={{ base: '1.8rem', md: '2.2rem' }}
          lineHeight="1.1"
          letterSpacing="-0.03em"
          color="brand.ink"
          mb={5}
        >
          Contratar {plan.nombre}
        </Heading>

        <Box pb={8} mb={{ base: 8, md: 10 }} borderBottomWidth="1px" borderColor="blackAlpha.100">
          <Pasos actual={listo ? 1 : 0} />
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 7fr) minmax(0, 5fr)' }} gap={{ base: 10, lg: 16 }} alignItems="start">
          <AnimatePresence mode="wait" initial={false}>
            {listo ? (
              <MotionBox key="ok" {...paso}>
                <Flex justify="space-between" align="baseline" mb={1}>
                  <Heading as="h2" fontSize="lg" color="brand.ink">
                    Confirme sus datos
                  </Heading>
                  <Button type="button" variant="link" size="sm" color="brand.primary" onClick={() => setListo(false)}>
                    Editar
                  </Button>
                </Flex>
                <Text fontSize="sm" color="blackAlpha.600" mb={6}>
                  Revise la información de facturación antes de pagar.
                </Text>

                <Box as="dl" borderTopWidth="1px" borderColor="blackAlpha.100">
                  {[
                    ['Documento', esFactura ? 'Factura' : 'Boleta'],
                    [esFactura ? 'Razón Social' : 'Nombre', datos.titular],
                    ...(esFactura && datos.giro ? [['Giro', datos.giro]] : []),
                    ['Correo', datos.email],
                    ['RUT', datos.rut],
                    ['Teléfono', formateaTel(datos.telefono)],
                    ['Dirección', datos.direccion],
                  ].map(([label, valor]) => (
                    <Grid
                      key={label}
                      templateColumns={{ base: '1fr', sm: '160px 1fr' }}
                      gap={{ base: 0.5, sm: 4 }}
                      py={3}
                      borderBottomWidth="1px"
                      borderColor="blackAlpha.100"
                      fontSize="sm"
                    >
                      <Text as="dt" color="blackAlpha.600">
                        {label}
                      </Text>
                      <Text as="dd" fontWeight="medium" color="brand.ink" overflowWrap="anywhere">
                        {valor}
                      </Text>
                    </Grid>
                  ))}
                </Box>

                <Button
                  mt={8}
                  h="48px"
                  width="full"
                  borderRadius="lg"
                  onClick={handleIniciarPago}
                  isLoading={procesandoPago}
                  isDisabled={!ufClp}
                  loadingText="Conectando con Webpay..."
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: 'brand.primaryDark' }}
                >
                  {ufClp ? `Pagar ${clp(precioFinalClp(monto, ufClp))} en Webpay` : 'Calculando el monto...'}
                </Button>
                <Text fontSize="sm" color="blackAlpha.600" mt={3}>
                  Será redirigido al sitio de Webpay (Transbank) para completar el pago.
                </Text>
              </MotionBox>
            ) : (
              <MotionBox key="form" as="form" onSubmit={onSubmit} {...paso}>
                <Heading as="h2" fontSize="lg" color="brand.ink" mb={6}>
                  Datos de facturación
                </Heading>
                <VStack spacing={5} align="stretch">
                  <FormControl>
                    <LabelAyuda ayuda="Boleta si factura a su nombre. Factura si es empresa o pyme con giro.">
                      Documento tributario
                    </LabelAyuda>
                    <Flex bg="blackAlpha.50" borderRadius="lg" p={1} gap={1} maxW="280px">
                      {[
                        ['boleta', 'Boleta'],
                        ['factura', 'Factura'],
                      ].map(([tipo, label]) => {
                        const activo = documento === tipo
                        return (
                          <Button
                            key={tipo}
                            type="button"
                            flex="1"
                            size="sm"
                            h="36px"
                            borderRadius="md"
                            aria-pressed={activo}
                            bg={activo ? 'white' : 'transparent'}
                            color={activo ? 'brand.primary' : 'blackAlpha.700'}
                            boxShadow={activo ? '0 1px 3px rgba(13, 13, 13, 0.12)' : 'none'}
                            _hover={{ bg: activo ? 'white' : 'blackAlpha.50' }}
                            onClick={() => setDocumento(tipo)}
                          >
                            {label}
                          </Button>
                        )
                      })}
                    </Flex>
                  </FormControl>

                  <FormControl isRequired>
                    <LabelAyuda ayuda="Ejemplo: compras@empresa.cl. Use el correo laboral, no uno personal.">
                      Correo corporativo
                    </LabelAyuda>
                    <Input
                      {...inputProps}
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@empresa.cl"
                      value={datos.email}
                      onChange={set('email')}
                    />
                  </FormControl>

                  {esFactura ? (
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
                      <FormControl isRequired>
                        <LabelAyuda ayuda="Nombre legal de la empresa. Ejemplo: Inducta Chile SpA.">
                          Razón Social
                        </LabelAyuda>
                        <Input
                          {...inputProps}
                          autoComplete="organization"
                          value={datos.titular}
                          onChange={set('titular')}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <LabelAyuda ayuda="Actividad económica del SII. Ejemplo: Servicios de capacitación.">
                          Giro comercial
                        </LabelAyuda>
                        <Input
                          {...inputProps}
                          placeholder="Ej: Servicios de capacitación"
                          value={datos.giro}
                          onChange={set('giro')}
                        />
                      </FormControl>
                    </Grid>
                  ) : (
                    <FormControl isRequired>
                      <LabelAyuda ayuda="Nombre y apellidos de quien recibe la boleta. Ejemplo: Ana Pérez Soto.">
                        Nombre completo
                      </LabelAyuda>
                      <Input
                        {...inputProps}
                        autoComplete="name"
                        value={datos.titular}
                        onChange={set('titular')}
                      />
                    </FormControl>
                  )}

                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
                    <FormControl isRequired isInvalid={Boolean(errores.rut)}>
                      <LabelAyuda ayuda="RUT chileno con dígito verificador. Ejemplo: 76.355.934-3.">
                        RUT
                      </LabelAyuda>
                      <Input
                        {...inputProps}
                        placeholder="76.355.934-3"
                        value={datos.rut}
                        onChange={set('rut')}
                        onBlur={() => {
                          if (datos.rut.trim()) setDatos((d) => ({ ...d, rut: formateaRut(d.rut) }))
                        }}
                      />
                      <FormErrorMessage>{errores.rut}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={Boolean(errores.telefono)}>
                      <LabelAyuda ayuda="El +56 va solo. Escriba el número chileno. Ejemplo: 9 6123 4587.">
                        Teléfono
                      </LabelAyuda>
                      <InputGroup>
                        <InputLeftAddon bg="blackAlpha.50" borderColor="blackAlpha.200" color="blackAlpha.700" fontSize="sm">
                          +56
                        </InputLeftAddon>
                        <Input
                          {...inputProps}
                          type="tel"
                          autoComplete="tel"
                          inputMode="numeric"
                          placeholder="9 6123 4587"
                          value={datos.telefono}
                          onChange={(e) => {
                            setDatos((d) => ({ ...d, telefono: mascaraTel(e.target.value) }))
                            if (errores.telefono) setErrores((err) => ({ ...err, telefono: '' }))
                          }}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errores.telefono}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  <FormControl isRequired>
                    <LabelAyuda ayuda="Calle, número y comuna en Chile. Ejemplo: Av. Providencia 1234, Providencia.">
                      Dirección de facturación
                    </LabelAyuda>
                    <Input
                      {...inputProps}
                      autoComplete="street-address"
                      placeholder="Calle, número, comuna"
                      value={datos.direccion}
                      onChange={set('direccion')}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    mt={3}
                    h="48px"
                    width="full"
                    borderRadius="lg"
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: 'brand.primaryDark' }}
                  >
                    Revisar y continuar
                  </Button>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>

          <Box
            as="aside"
            aria-label="Resumen del pedido"
            position={{ lg: 'sticky' }}
            top={{ lg: '96px' }}
            bg="brand.soft"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            borderRadius="xl"
            p={{ base: 5, md: 7 }}
          >
            <Text fontSize="sm" fontWeight="semibold" color="blackAlpha.600" mb={4}>
              Resumen
            </Text>
            <Flex justify="space-between" align="start" gap={4}>
              <Box>
                <Text fontWeight="semibold" fontSize="lg" color="brand.ink" lineHeight="1.3">
                  {plan.nombre}
                </Text>
                <Text fontSize="sm" color="blackAlpha.600">
                  Pago {periodo}
                </Text>
              </Box>
              <Link as={RouterLink} to="/precios" fontSize="sm" fontWeight="medium" color="brand.primary">
                Cambiar
              </Link>
            </Flex>

            <Box as="ul" listStyleType="none" mt={5} pt={5} borderTopWidth="1px" borderColor="blackAlpha.100">
              {beneficios.map((f) => (
                <Flex as="li" key={f.text} gap={2.5} align="center" fontSize="sm" color="brand.ink" py={1}>
                  <Check size={15} color="#4260E6" aria-hidden />
                  {f.text}
                </Flex>
              ))}
            </Box>

            <VStack align="stretch" spacing={2.5} mt={5} pt={5} borderTopWidth="1px" borderColor="blackAlpha.100">
              <Linea label={`Plan ${periodo}`} valor={uf(monto)} />
              {neto ? (
                <>
                  <Linea label={`Neto (UF a ${clp(ufClp)})`} valor={clp(neto)} />
                  <Linea label={`IVA ${Math.round(IVA_CHILE * 100)}%`} valor={clp(Math.round(neto * IVA_CHILE))} />
                </>
              ) : (
                <Text fontSize="sm" color="blackAlpha.600">
                  Calculando el valor de la UF del día...
                </Text>
              )}
            </VStack>

            <Box mt={5} pt={5} borderTopWidth="1px" borderColor="blackAlpha.200">
              <Linea fuerte label="Total" valor={neto ? clp(precioFinalClp(monto, ufClp)) : '—'} />
              <Text fontSize="xs" color="blackAlpha.600" mt={2} lineHeight="1.5">
                Monto referencial hasta emitir el documento. Si el pago no se completa, no se realiza ningún cargo.
              </Text>
            </Box>
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
