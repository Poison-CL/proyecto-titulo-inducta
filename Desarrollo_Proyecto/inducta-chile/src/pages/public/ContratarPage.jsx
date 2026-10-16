import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, CircleHelp, Lock } from 'lucide-react'
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom'
import { useUfHoy } from '../../hooks/useUfHoy'
import { formateaRut, formateaTel, mascaraTel, rutValido, telefonoValido } from '../../lib/chile'
import { clp, getPlan, montoPlan, precioFinalClp, uf } from '../../lib/planes'
import { iniciarPagoTransbank } from '../../services/transbank'

const MotionBox = motion.create(Box)

function LabelAyuda({ children, ayuda }) {
  return (
    <FormLabel requiredIndicator={null} display="flex" alignItems="center" gap={1} mb={2}>
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
  

  const errorPago = params.get('error')
  if (errorPago === 'pago_fallido' || errorPago === 'servidor') {
    return <Navigate to="/pago/rechazado" replace />
  }

  const ufClp = useUfHoy()
  const plan = getPlan(params.get('plan'))
  const periodo = params.get('periodo') === 'anual' ? 'anual' : 'mensual'
  const [documento, setDocumento] = useState('factura')
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [listo, setListo] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false) 
  const esFactura = documento === 'factura'

  if (!plan?.contratable) {
    return <Navigate to="/precios" replace />
  }

  const monto = montoPlan(plan, periodo)
  const beneficios = plan.features.filter((f) => f.ok).slice(0, 3)
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

  return (
    <Box bg="brand.soft" py={{ base: 10, md: 16 }}>
      <Container maxW="6xl" px={{ base: 5, md: 8 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="start">
          <MotionBox
            bg="white"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Heading as="h1" size="lg" color="brand.ink" mb={3}>
              Plan {plan.nombre}
            </Heading>
            <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
              {uf(monto)} / {periodo === 'anual' ? 'año' : 'mes'}
            </Text>
            <Text fontSize="sm" color="blackAlpha.500" mb={6}>
              + 19% IVA
            </Text>
            <List spacing={3}>
              {beneficios.map((f) => (
                <ListItem key={f.text} color="brand.ink">
                  <ListIcon as={Check} color="brand.accent" />
                  {f.text}
                </ListItem>
              ))}
            </List>
            <AnimatePresence>
              {ufClp ? (
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Divider my={6} borderColor="blackAlpha.200" />
                  <Text fontSize="sm" color="blackAlpha.500">
                    Precio final
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.ink">
                    {clp(precioFinalClp(monto, ufClp))}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.400" mt={1}>
                    UF del día convertida a pesos, más IVA. Referencial hasta facturar.
                  </Text>
                </MotionBox>
              ) : null}
            </AnimatePresence>
          </MotionBox>

          <AnimatePresence mode="wait">
            {listo ? (
              <MotionBox
                key="ok"
                bg="white"
                borderRadius="xl"
                p={{ base: 6, md: 8 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Heading as="h2" size="md" mb={1}>
                  Confirme sus datos
                </Heading>
                <Text fontSize="sm" color="blackAlpha.500" mb={6}>
                  Revise la información de facturación antes de continuar.
                </Text>
                <VStack align="stretch" spacing={0} divider={<Divider borderColor="blackAlpha.100" />}>
                  {[
                    ['Documento', esFactura ? 'Factura' : 'Boleta'],
                    [esFactura ? 'Razón Social' : 'Nombre', datos.titular],
                    ...(esFactura && datos.giro ? [['Giro', datos.giro]] : []),
                    ['Correo', datos.email],
                    ['RUT', datos.rut],
                    ['Teléfono', formateaTel(datos.telefono)],
                    ['Dirección', datos.direccion],
                  ].map(([label, valor]) => (
                    <Box key={label} py={3}>
                      <Text fontSize="xs" color="blackAlpha.500" mb={0.5}>
                        {label}
                      </Text>
                      <Text fontWeight="semibold" color="brand.ink">
                        {valor}
                      </Text>
                    </Box>
                  ))}
                </VStack>
                <Text fontSize="sm" color="blackAlpha.500" mt={6} mb={3}>
                  El pago seguro se habilita en el siguiente paso.
                </Text>
                
                {/* 4. El botón ahora está seguro adentro del diseño */}
                <Button 
                  size="lg" 
                  width="full" 
                  onClick={handleIniciarPago}
                  isLoading={procesandoPago}
                  loadingText="Conectando con Webpay..."
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: 'brand.primaryDark' }}
                >
                  Ir a facturación segura
                </Button>

                <Button type="button" variant="ghost" width="full" mt={2} onClick={() => setListo(false)}>
                  Corregir datos
                </Button>
                <Text textAlign="center" mt={2}>
                  <Button as={RouterLink} to="/precios" variant="link" fontSize="sm" color="blackAlpha.500">
                    Volver a planes
                  </Button>
                </Text>
              </MotionBox>
            ) : (
              <MotionBox
                key="form"
                as="form"
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              >
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <LabelAyuda ayuda="Boleta si factura a su nombre. Factura si es empresa o pyme con giro.">
                      Documento tributario
                    </LabelAyuda>
                    <HStack
                      bg="brand.wash"
                      borderRadius="full"
                      p={1}
                      spacing={0}
                      display="inline-flex"
                    >
                      {[
                        ['boleta', 'Boleta'],
                        ['factura', 'Factura'],
                      ].map(([tipo, label]) => (
                        <Button
                          key={tipo}
                          type="button"
                          size="sm"
                          borderRadius="full"
                          px={5}
                          aria-pressed={documento === tipo}
                          bg={documento === tipo ? 'brand.primary' : 'transparent'}
                          color={documento === tipo ? 'white' : 'blackAlpha.700'}
                          _hover={{
                            bg: documento === tipo ? 'brand.primaryDark' : 'blackAlpha.50',
                          }}
                          onClick={() => setDocumento(tipo)}
                        >
                          {label}
                        </Button>
                      ))}
                    </HStack>
                  </FormControl>

                  <FormControl isRequired>
                    <LabelAyuda ayuda="Ejemplo: compras@empresa.cl. Use el correo laboral, no uno personal.">
                      Correo corporativo
                    </LabelAyuda>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@empresa.cl"
                      value={datos.email}
                      onChange={set('email')}
                    />
                  </FormControl>

                  <AnimatePresence mode="wait">
                    <MotionBox
                      key={documento}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {esFactura ? (
                        <VStack spacing={4} align="stretch">
                          <FormControl isRequired>
                            <LabelAyuda ayuda="Nombre legal de la empresa. Ejemplo: Inducta Chile SpA.">
                              Razón Social
                            </LabelAyuda>
                            <Input
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
                              placeholder="Ej: Servicios de capacitación"
                              value={datos.giro}
                              onChange={set('giro')}
                            />
                          </FormControl>
                        </VStack>
                      ) : (
                        <FormControl isRequired>
                          <LabelAyuda ayuda="Nombre y apellidos de quien recibe la boleta. Ejemplo: Ana Pérez Soto.">
                            Nombre completo
                          </LabelAyuda>
                          <Input
                            autoComplete="name"
                            value={datos.titular}
                            onChange={set('titular')}
                          />
                        </FormControl>
                      )}
                    </MotionBox>
                  </AnimatePresence>

                  <HStack spacing={4} align="start">
                    <FormControl isRequired isInvalid={Boolean(errores.rut)}>
                      <LabelAyuda ayuda="RUT chileno con dígito verificador. Ejemplo: 76.355.934-3.">
                        RUT
                      </LabelAyuda>
                      <Input
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
                        <InputLeftAddon bg="brand.wash" color="brand.ink" fontWeight="semibold">
                          +56
                        </InputLeftAddon>
                        <Input
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
                  </HStack>

                  <FormControl isRequired>
                    <LabelAyuda ayuda="Calle, número y comuna en Chile. Ejemplo: Av. Providencia 1234, Providencia.">
                      Dirección de facturación
                    </LabelAyuda>
                    <Input
                      autoComplete="street-address"
                      placeholder="Calle, número, comuna"
                      value={datos.direccion}
                      onChange={set('direccion')}
                    />
                  </FormControl>

                  <Button type="submit" size="lg" width="full" bg="brand.primary" color="white" _hover={{ bg: 'brand.primaryDark' }}>
                    Ir a facturación segura
                  </Button>
                  <HStack justify="center" spacing={2}>
                    <Icon as={Lock} boxSize={3.5} color="brand.accent" />
                    <Text fontSize="sm" color="blackAlpha.500">
                      Transacción segura y encriptada
                    </Text>
                  </HStack>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
