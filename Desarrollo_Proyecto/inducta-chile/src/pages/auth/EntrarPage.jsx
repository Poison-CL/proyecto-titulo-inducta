import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { SignedIn, SignedOut, useSignIn } from '@clerk/clerk-react'
import { ArrowLeft, Building2, KeyRound, Lock, Mail, UserRound } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { RUTAS_AUTH } from '../../lib/authCopy'
import { isRolValido, ROL, setRolPendiente } from '../../lib/authRol'
import { clerkError, factorByStrategy, PASO, pasoSiguiente } from '../../lib/loginPasos'

const MotionBox = motion.create(Box)

const COPY = {
  [ROL.EMPRESA]: {
    ayuda: 'Si tu empresa aún no tiene acceso, contrata un plan o agenda una demo.',
  },
  [ROL.EMPLEADO]: {
    ayuda: 'Las cuentas de colaborador las crea tu empresa. Si no puedes entrar, pide a tu administrador que te agregue.',
  },
}

function RolToggle({ rol, onChange, disabled }) {
  const esEmpresa = rol === ROL.EMPRESA

  return (
    <Box
      position="relative"
      w="full"
      bg="brand.soft"
      borderRadius="lg"
      p="4px"
      h="44px"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      opacity={disabled ? 0.6 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <MotionBox
        position="absolute"
        top="4px"
        bottom="4px"
        left="4px"
        w="calc(50% - 4px)"
        bg="white"
        borderRadius="md"
        boxShadow="0 1px 3px rgba(13, 13, 13, 0.12)"
        animate={{ x: esEmpresa ? 0 : '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        zIndex={0}
      />

      <Flex position="relative" zIndex={1} h="full">
        <Button
          type="button"
          flex="1"
          h="full"
          borderRadius="full"
          variant="unstyled"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          fontWeight="semibold"
          fontSize="sm"
          color={esEmpresa ? 'brand.primary' : 'gray.500'}
          onClick={() => onChange(ROL.EMPRESA)}
        >
          <Icon as={Building2} boxSize={4} />
          Empresa
        </Button>
        <Button
          type="button"
          flex="1"
          h="full"
          borderRadius="full"
          variant="unstyled"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          fontWeight="semibold"
          fontSize="sm"
          color={!esEmpresa ? 'brand.primary' : 'gray.500'}
          onClick={() => onChange(ROL.EMPLEADO)}
        >
          <Icon as={UserRound} boxSize={4} />
          Empleado
        </Button>
      </Flex>
    </Box>
  )
}

function Field({ icon, label, children }) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="semibold" color="brand.ink" mb={1.5}>
        {label}
      </FormLabel>
      <InputGroup>
        <InputLeftElement h="48px" pointerEvents="none" color="gray.400">
          <Icon as={icon} boxSize={4} />
        </InputLeftElement>
        {children}
      </InputGroup>
    </FormControl>
  )
}

const inputProps = {
  bg: 'white',
  borderRadius: 'lg',
  borderColor: 'blackAlpha.200',
  h: '48px',
  pl: 10,
  _placeholder: { color: 'gray.400' },
  _hover: { borderColor: 'blackAlpha.300' },
  _focus: {
    borderColor: 'brand.primary',
    boxShadow: '0 0 0 1px #1B22A7',
  },
}

const primario = {
  h: '48px',
  borderRadius: 'lg',
  bg: 'brand.primary',
  color: 'white',
  _hover: { bg: 'brand.primaryDark' },
}

function LoginCard() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const rolInicial = isRolValido(params.get('rol')) ? params.get('rol') : ROL.EMPRESA

  const [rol, setRol] = useState(rolInicial)
  // email → method → code | password
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const copy = COPY[rol]
  const canPassword = Boolean(factorByStrategy(signIn, 'password'))
  const canEmailCode = Boolean(factorByStrategy(signIn, 'email_code'))
  const RESEND_SEGUNDOS = 60

  useEffect(() => {
    setRolPendiente(rol)
    setParams({ rol }, { replace: true })
  }, [rol, setParams])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const finishIfComplete = async (result) => {
    if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId })
      navigate(RUTAS_AUTH.postLogin, { replace: true })
      return true
    }
    return false
  }

  const resetToEmail = () => {
    setStep('email')
    setPassword('')
    setCode('')
    setError('')
    setInfo('')
    setCooldown(0)
  }

  // Paso 1: solo correo → Clerk crea el intento y lista factores
  const onContinueEmail = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!isLoaded || !signIn) return
    if (!email.trim()) {
      setError('Ingresa tu correo.')
      return
    }

    setLoading(true)
    setRolPendiente(rol)

    try {
      const result = await signIn.create({ identifier: email.trim() })

      if (await finishIfComplete(result)) return

      const siguiente = pasoSiguiente(result)

      if (!siguiente) {
        setError(
          rol === ROL.EMPRESA
            ? 'Esta cuenta no tiene un método de ingreso disponible. Escríbenos y lo revisamos.'
            : 'Esta cuenta no tiene un método de ingreso disponible. Pide a tu administrador que revise tu acceso.',
        )
        return
      }

      if (siguiente === PASO.CODE) {
        await sendEmailCode(result)
      }

      setStep(siguiente)
    } catch (err) {
      setError(clerkError(err, 'No pudimos continuar con ese correo. Intenta de nuevo.', rol))
    } finally {
      setLoading(false)
    }
  }

  const sendEmailCode = async (si = signIn) => {
    const factor = factorByStrategy(si, 'email_code')
    if (!factor?.emailAddressId) {
      throw new Error('No hay correo verificado para enviar el código.')
    }

    await si.prepareFirstFactor({
      strategy: 'email_code',
      emailAddressId: factor.emailAddressId,
    })
    setInfo(`Enviamos un código a ${email.trim()}. Revisa tu bandeja de entrada.`)
    setCooldown(RESEND_SEGUNDOS)
  }

  const onChooseCode = async () => {
    setError('')
    setLoading(true)
    try {
      await sendEmailCode()
      setStep('code')
    } catch (err) {
      setError(clerkError(err, 'No pudimos enviar el código. Intenta de nuevo.', rol))
    } finally {
      setLoading(false)
    }
  }

  const onChoosePassword = () => {
    setError('')
    setInfo('')
    setStep('password')
  }

  const onVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) {
      setError('Ingresa el código de verificación.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: code.trim(),
      })
      if (await finishIfComplete(result)) return
      setError('Código incorrecto o incompleto. Intenta otra vez.')
    } catch (err) {
      setError(clerkError(err, 'Código incorrecto o expirado.', rol))
    } finally {
      setLoading(false)
    }
  }

  const onVerifyPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!password) {
      setError('Ingresa tu contraseña.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'password',
        password,
      })
      if (await finishIfComplete(result)) return
      setError('No pudimos completar el ingreso con contraseña.')
    } catch (err) {
      setError(clerkError(err, 'Contraseña incorrecta.', rol))
    } finally {
      setLoading(false)
    }
  }

  const onResendCode = async () => {
    if (cooldown > 0) return
    setError('')
    setLoading(true)
    try {
      await sendEmailCode()
    } catch (err) {
      setError(clerkError(err, 'No pudimos reenviar el código.', rol))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box w="full" maxW="400px">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" fontSize={{ base: '1.75rem', md: '2rem' }} fontWeight="semibold" letterSpacing="-0.03em" lineHeight="1.1" color="brand.ink">
            Ingresar
          </Heading>
          <Text fontSize="sm" color="blackAlpha.600" mt={1.5}>
            Elija cómo entra a Inducta Chile.
          </Text>
        </Box>

        <RolToggle rol={rol} onChange={setRol} disabled={step !== 'email'} />

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <MotionBox
              key="email"
              as="form"
              onSubmit={onContinueEmail}
              // El aviso nativo de type="email" sale en el idioma del navegador;
              // validamos nosotros para que el error siempre salga en espanol
              noValidate
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <VStack spacing={4} align="stretch">
                <Field icon={Mail} label="Correo">
                  <Input
                    type="email"
                    autoComplete="username"
                    placeholder="nombre@empresa.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    {...inputProps}
                  />
                </Field>
                <Text fontSize="sm" color="blackAlpha.600" mt={-1}>
                  Luego podrá verificar con un código o con su contraseña.
                </Text>
                <Button type="submit" {...primario} isLoading={loading} loadingText="Continuando…">
                  Continuar
                </Button>
              </VStack>
            </MotionBox>
          ) : null}

          {step === 'method' ? (
            <MotionBox
              key="method"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <VStack spacing={4} align="stretch">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  alignSelf="flex-start"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={resetToEmail}
                >
                  Cambiar correo
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Elige cómo quieres entrar con <Text as="span" fontWeight="semibold">{email}</Text>
                </Text>
                {canEmailCode ? (
                  <Button {...primario} leftIcon={<KeyRound size={16} />} onClick={onChooseCode} isLoading={loading}>
                    Código de verificación
                  </Button>
                ) : null}
                {canPassword ? (
                  <Button
                    h="48px"
                    borderRadius="lg"
                    variant="outline"
                    leftIcon={<Lock size={16} />}
                    onClick={onChoosePassword}
                  >
                    Usar contraseña
                  </Button>
                ) : null}
              </VStack>
            </MotionBox>
          ) : null}

          {step === 'code' ? (
            <MotionBox
              key="code"
              as="form"
              onSubmit={onVerifyCode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <VStack spacing={4} align="stretch">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  alignSelf="flex-start"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => {
                    setCode('')
                    setError('')
                    setStep(canPassword ? 'method' : 'email')
                  }}
                >
                  Volver
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Escribe el código que enviamos a{' '}
                  <Text as="span" fontWeight="semibold">
                    {email}
                  </Text>
                </Text>
                <Field icon={KeyRound} label="Código">
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Código de verificación"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    {...inputProps}
                  />
                </Field>
                <Button type="submit" {...primario} isLoading={loading} loadingText="Verificando…">
                  Verificar e ingresar
                </Button>
                <Button
                  type="button"
                  variant="link"
                  color={cooldown > 0 ? 'gray.400' : 'brand.primary'}
                  onClick={onResendCode}
                  isDisabled={cooldown > 0 || loading}
                  _hover={cooldown > 0 ? { textDecoration: 'none' } : undefined}
                >
                  {cooldown > 0
                    ? `Reenviar código en ${cooldown}s`
                    : 'Reenviar código'}
                </Button>
                {canPassword ? (
                  <Button type="button" variant="link" color="gray.500" onClick={onChoosePassword}>
                    Preferir contraseña
                  </Button>
                ) : null}
              </VStack>
            </MotionBox>
          ) : null}

          {step === 'password' ? (
            <MotionBox
              key="password"
              as="form"
              onSubmit={onVerifyPassword}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <VStack spacing={4} align="stretch">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  alignSelf="flex-start"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => {
                    setPassword('')
                    setError('')
                    setStep(canEmailCode ? 'method' : 'email')
                  }}
                >
                  Volver
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Ingresa la contraseña de{' '}
                  <Text as="span" fontWeight="semibold">
                    {email}
                  </Text>
                </Text>
                <Field icon={Lock} label="Contraseña">
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    {...inputProps}
                  />
                </Field>
                <Button type="submit" {...primario} isLoading={loading} loadingText="Ingresando…">
                  Iniciar sesión
                </Button>
                {canEmailCode ? (
                  <Button type="button" variant="link" color="brand.primary" onClick={onChooseCode}>
                    Preferir código de verificación
                  </Button>
                ) : null}
              </VStack>
            </MotionBox>
          ) : null}
        </AnimatePresence>

        {info ? (
          <Text fontSize="sm" color="brand.primary" lineHeight="1.5">
            {info}
          </Text>
        ) : null}

        {error ? (
          <Box
            bg="red.50"
            borderWidth="1px"
            borderColor="red.100"
            borderRadius="md"
            px={3}
            py={2}
          >
            <Text color="red.600" fontSize="sm" lineHeight="1.5">
              {error}
            </Text>
          </Box>
        ) : null}

        {step === 'email' ? (
          <AnimatePresence mode="wait">
            <MotionBox
              key={`help-${rol}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Text fontSize="sm" color="blackAlpha.600" lineHeight="1.55" pt={5} borderTopWidth="1px" borderColor="blackAlpha.100">
                {copy.ayuda}
                {/* Solo la empresa tiene algo que hacer aca; al colaborador lo
                    resuelve su administrador, no nosotros */}
                {rol === ROL.EMPRESA ? (
                  <>
                    {' '}
                    <Link
                      as={RouterLink}
                      to={RUTAS_AUTH.precios}
                      color="brand.primary"
                      fontWeight="medium"
                    >
                      Ver planes
                    </Link>
                  </>
                ) : null}
              </Text>
            </MotionBox>
          </AnimatePresence>
        ) : null}

      </VStack>
    </Box>
  )
}

const PILARES = ['Programas por cargo o área', 'Avance de cada colaborador', 'Evidencia lista para auditorías']

export default function EntrarPage() {
  return (
    <>
      <SignedIn>
        <Navigate to={RUTAS_AUTH.postLogin} replace />
      </SignedIn>
      <SignedOut>
        <SimpleGrid minH="100vh" columns={{ base: 1, lg: 2 }} bg="white">
          <Flex
            display={{ base: 'none', lg: 'flex' }}
            direction="column"
            justify="space-between"
            bg="brand.ink"
            color="white"
            px={16}
            py={12}
          >
            <Link as={RouterLink} to={RUTAS_AUTH.inicio} alignSelf="flex-start" _hover={{ opacity: 0.85 }}>
              <Image src="/logo-azul.png" alt="Inducta Chile, volver al inicio" h="34px" w="auto" />
            </Link>
            <Box maxW="30rem">
              <Text fontSize="2.4rem" fontWeight="semibold" lineHeight="1.1" letterSpacing="-0.03em" mb={8}>
                Todo el ingreso de su equipo,{' '}
                <Box as="span" color="brand.accent">
                  en un solo lugar.
                </Box>
              </Text>
              <Box as="ol" listStyleType="none">
                {PILARES.map((p, i) => (
                  <Flex as="li" key={p} gap={4} py={3.5} borderTopWidth="1px" borderColor="whiteAlpha.200" color="whiteAlpha.900">
                    <Text as="span" color="brand.accent" fontWeight="semibold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {`0${i + 1}`}
                    </Text>
                    {p}
                  </Flex>
                ))}
              </Box>
            </Box>
            <Text fontSize="sm" color="whiteAlpha.600">
              © {new Date().getFullYear()} Inducta Chile SpA
            </Text>
          </Flex>

          <Flex direction="column" px={{ base: 5, md: 12 }} py={{ base: 6, md: 10 }}>
            <Flex justify="space-between" align="center" mb={{ base: 10, lg: 0 }}>
              <Link
                as={RouterLink}
                to={RUTAS_AUTH.inicio}
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                fontSize="sm"
                fontWeight="medium"
                color="blackAlpha.700"
              >
                <Icon as={ArrowLeft} boxSize={4} />
                Volver al inicio
              </Link>
              <Link as={RouterLink} to={RUTAS_AUTH.contacto} fontSize="sm" fontWeight="medium" color="blackAlpha.700">
                Contacto
              </Link>
            </Flex>
            <Flex flex="1" align="center" justify="center">
              <LoginCard />
            </Flex>
          </Flex>
        </SimpleGrid>
      </SignedOut>
    </>
  )
}
