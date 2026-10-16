import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { supabasePublico } from '../../lib/supabase'

const CORREO = 'contacto@inductachile.cl'

const MOTIVOS = [
  {
    value: 'demo',
    label: 'Agendar una demo',
    corto: 'Demo',
    placeholder: 'Cuántas personas ingresan al año, en qué áreas, cómo lo hacen hoy…',
    cta: 'Solicitar demo',
  },
  {
    value: 'planes',
    label: 'Planes y precios',
    corto: 'Planes',
    placeholder: 'Cuántos colaboradores tiene su empresa y qué plan está evaluando…',
    cta: 'Consultar planes',
  },
  {
    value: 'soporte',
    label: 'Soporte',
    corto: 'Soporte',
    placeholder: 'Qué intentaba hacer, qué pasó y desde qué cuenta…',
    cta: 'Enviar a soporte',
  },
  {
    value: 'otro',
    label: 'Otra consulta',
    corto: 'Otro',
    placeholder: 'Cuéntenos en qué le podemos ayudar…',
    cta: 'Enviar mensaje',
  },
]

const PASOS = [
  { t: 'Leemos su mensaje', d: 'Respondemos en días hábiles, desde una persona del equipo.' },
  { t: 'Coordinamos una demo', d: 'Sin costo, en el horario que le acomode.' },
  { t: 'Recorren la plataforma', d: 'Usted y su equipo prueban el flujo completo antes de decidir.' },
]

const VACIO = { nombre: '', empresa: '', email: '', motivo: 'demo', mensaje: '' }

function erroresDe(datos) {
  const e = {}
  if (!datos.nombre.trim()) e.nombre = 'Escriba su nombre.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) e.email = 'Escriba un correo válido.'
  if (datos.mensaje.trim().length < 10) e.mensaje = 'Cuéntenos un poco más, al menos una frase.'
  return e
}

if (import.meta.env.DEV) {
  const malo = erroresDe({ ...VACIO, email: 'no', mensaje: 'hola' })
  if (!malo.nombre || !malo.email || !malo.mensaje) throw new Error('contacto: validación')
  const bueno = erroresDe({ ...VACIO, nombre: 'Ana', email: 'ana@empresa.cl', mensaje: 'Queremos una demo para el equipo.' })
  if (Object.keys(bueno).length) throw new Error('contacto: validación ok')
}

const motivoDeUrl = (v) => (MOTIVOS.some((m) => m.value === v) ? v : 'demo')

export default function ContactoPage() {
  const [params] = useSearchParams()
  const [datos, setDatos] = useState(() => ({ ...VACIO, motivo: motivoDeUrl(params.get('motivo')) }))
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(false)
  const [trampa, setTrampa] = useState('')
  const motivo = MOTIVOS.find((m) => m.value === datos.motivo)

  function setCampo(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const mailtoRespaldo = () => {
    const cuerpo = [`Nombre: ${datos.nombre.trim()}`, `Empresa: ${datos.empresa.trim() || '—'}`, '', datos.mensaje.trim()].join('\n')
    return `mailto:${CORREO}?subject=${encodeURIComponent(`Inducta Chile — ${motivo.label}`)}&body=${encodeURIComponent(cuerpo)}`
  }

  async function enviar(ev) {
    ev.preventDefault()
    const next = erroresDe(datos)
    setErrores(next)
    if (Object.keys(next).length) return
    // ponytail: honeypot contra bots simples; si llega spam real, agregar captcha (Turnstile) o rate limit en una Edge Function.
    if (trampa) return setEnviado(true)
    setEnviando(true)
    setErrorEnvio(false)
    const { error } = await supabasePublico.from('contactos').insert({
      motivo: datos.motivo,
      nombre: datos.nombre.trim(),
      empresa: datos.empresa.trim() || null,
      email: datos.email.trim(),
      mensaje: datos.mensaje.trim(),
    })
    setEnviando(false)
    if (error) {
      console.error('Error al guardar contacto:', error)
      return setErrorEnvio(true)
    }
    setEnviado(true)
  }

  function otroMensaje() {
    setDatos((prev) => ({ ...VACIO, motivo: prev.motivo }))
    setEnviado(false)
  }

  return (
    <Box bg="white" py={{ base: 6, md: 10 }}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Grid templateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={{ base: 4, lg: 6 }} alignItems="stretch">
          <Box
            bg="brand.ink"
            color="white"
            borderRadius="2xl"
            px={{ base: 6, md: 10 }}
            py={{ base: 8, md: 12 }}
            display="flex"
            flexDirection="column"
          >
            <Text fontWeight="semibold" color="whiteAlpha.700" mb={3}>
              Contacto
            </Text>
            <Heading
              as="h1"
              color="white"
              fontSize={{ base: '2rem', md: '2.6rem' }}
              fontWeight="semibold"
              lineHeight="1.08"
              letterSpacing="-0.03em"
              mb={4}
            >
              Hablemos de cómo{' '}
              <Box as="span" color="brand.accent">
                ingresa su equipo.
              </Box>
            </Heading>
            <Text color="whiteAlpha.800" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="36ch">
              Cuéntenos cómo hacen hoy las inducciones y le mostramos cómo ordenarlas en Inducta Chile.
            </Text>

            <Box as="ol" listStyleType="none" mt={{ base: 8, md: 12 }} mb={{ base: 8, md: 10 }}>
              {PASOS.map((p, i) => (
                <HStack as="li" key={p.t} align="start" spacing={4} py={4} borderTopWidth="1px" borderColor="whiteAlpha.200">
                  <Text fontWeight="semibold" color="brand.accent" minW="1.5rem" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {`0${i + 1}`}
                  </Text>
                  <Box>
                    <Text fontWeight="semibold">{p.t}</Text>
                    <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.55" mt={0.5}>
                      {p.d}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </Box>

            <VStack align="start" spacing={2.5} mt="auto" fontSize="sm">
              <HStack spacing={2.5}>
                <Icon as={Mail} boxSize={4} color="brand.accent" />
                <Link href={`mailto:${CORREO}`} color="white" fontWeight="semibold" _hover={{ color: 'white', textDecoration: 'underline' }}>
                  {CORREO}
                </Link>
              </HStack>
              <HStack spacing={2.5} color="whiteAlpha.900">
                <Icon as={Phone} boxSize={4} color="brand.accent" />
                <Text>+56 2 0000 0000</Text>
              </HStack>
              <HStack spacing={2.5} color="whiteAlpha.900">
                <Icon as={MapPin} boxSize={4} color="brand.accent" />
                <Text>Santiago, Chile</Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            as="form"
            onSubmit={enviar}
            noValidate
            borderWidth="1px"
            borderColor="blackAlpha.100"
            borderRadius="2xl"
            px={{ base: 5, md: 10 }}
            py={{ base: 7, md: 10 }}
          >
            {enviado ? (
              <VStack align="start" spacing={4} py={{ md: 10 }}>
                <Heading as="h2" fontSize="2xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.primary">
                  Mensaje enviado
                </Heading>
                <Text color="blackAlpha.700" lineHeight="1.7" maxW="48ch">
                  Gracias, {datos.nombre.trim().split(' ')[0]}. Le responderemos a {datos.email.trim()} en días hábiles.
                </Text>
                <Button type="button" variant="outline" onClick={otroMensaje}>
                  Escribir otro mensaje
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text id="motivo-label" fontWeight="semibold" color="brand.ink" mb={3}>
                    ¿En qué le podemos ayudar?
                  </Text>
                  <SimpleGrid
                    role="radiogroup"
                    aria-labelledby="motivo-label"
                    columns={4}
                    spacing={0}
                    p={1}
                    bg="brand.soft"
                    borderWidth="1px"
                    borderColor="blackAlpha.100"
                    borderRadius="full"
                  >
                    {MOTIVOS.map((m) => {
                      const activo = datos.motivo === m.value
                      return (
                        <Button
                          key={m.value}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          aria-label={m.label}
                          onClick={() => setCampo('motivo', m.value)}
                          size="sm"
                          h="36px"
                          fontWeight={activo ? 'semibold' : 'medium'}
                          bg={activo ? 'white' : 'transparent'}
                          color={activo ? 'brand.primary' : 'blackAlpha.700'}
                          boxShadow={activo ? '0 1px 3px rgba(13, 13, 13, 0.12)' : 'none'}
                          _hover={{ bg: activo ? 'white' : 'blackAlpha.50' }}
                          _active={{ bg: activo ? 'white' : 'blackAlpha.100' }}
                        >
                          {m.corto}
                        </Button>
                      )
                    })}
                  </SimpleGrid>
                  {datos.motivo === 'soporte' && (
                    <Text fontSize="sm" color="blackAlpha.700" mt={3}>
                      ¿Es un problema para ingresar o con el código? Revise antes{' '}
                      <Link as={RouterLink} to="/recursos/soporte" color="brand.primary" fontWeight="semibold">
                        el centro de soporte
                      </Link>
                      ; la respuesta puede estar ahí.
                    </Text>
                  )}
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={Boolean(errores.nombre)} isRequired>
                    <FormLabel>Nombre</FormLabel>
                    <Input value={datos.nombre} onChange={(e) => setCampo('nombre', e.target.value)} autoComplete="name" />
                    <FormErrorMessage>{errores.nombre}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Empresa</FormLabel>
                    <Input value={datos.empresa} onChange={(e) => setCampo('empresa', e.target.value)} autoComplete="organization" />
                  </FormControl>
                </SimpleGrid>
                <FormControl isInvalid={Boolean(errores.email)} isRequired>
                  <FormLabel>Correo de trabajo</FormLabel>
                  <Input type="email" value={datos.email} onChange={(e) => setCampo('email', e.target.value)} autoComplete="email" />
                  <FormErrorMessage>{errores.email}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={Boolean(errores.mensaje)} isRequired>
                  <FormLabel>Mensaje</FormLabel>
                  <Textarea
                    value={datos.mensaje}
                    onChange={(e) => setCampo('mensaje', e.target.value)}
                    placeholder={motivo.placeholder}
                    minH="150px"
                  />
                  <FormErrorMessage>{errores.mensaje}</FormErrorMessage>
                </FormControl>

                <Box position="absolute" left="-9999px" aria-hidden>
                  <label>
                    No completar
                    <input tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
                  </label>
                </Box>

                {errorEnvio ? (
                  <Box role="alert" px={4} py={3} borderRadius="lg" bg="red.50" borderWidth="1px" borderColor="red.100">
                    <Text fontSize="sm" color="red.700" lineHeight="1.5">
                      No pudimos enviar su mensaje. Inténtelo de nuevo o{' '}
                      <Link href={mailtoRespaldo()} color="red.700" fontWeight="semibold" textDecoration="underline">
                        escríbanos a {CORREO}
                      </Link>
                      .
                    </Text>
                  </Box>
                ) : null}

                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <Text fontSize="sm" color="blackAlpha.600">
                    Respondemos en días hábiles.
                  </Text>
                  <Button type="submit" px={8} isLoading={enviando} loadingText="Enviando">
                    {motivo.cta}
                  </Button>
                </HStack>
              </VStack>
            )}
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
