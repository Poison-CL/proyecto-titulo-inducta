import {
  Box,
  Button,
  Container,
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

const ease = [0.22, 1, 0.36, 1]

function RolToggle({ rol, onChange, disabled }) {
  const esEmpresa = rol === ROL.EMPRESA

  return (
    <Box
      position="relative"
      w="full"
      bg="brand.soft"
      borderRadius="full"
      p="4px"
      h="52px"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      opacity={disabled ? 0.7 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <MotionBox
        position="absolute"
        top="4px"
        bottom="4px"
        left="4px"
        w="calc(50% - 4px)"
        bg="white"
        borderRadius="full"
        boxShadow="md"
        borderWidth="1px"
        borderColor="brand.primary"
        animate={{ x: esEmpresa ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
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

function Field({ icon, children }) {
  return (
    <FormControl>
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
  bg: 'brand.soft',
  borderRadius: 'lg',
  borderColor: 'transparent',
  h: '48px',
  pl: 10,
  _placeholder: { color: 'gray.400' },
  _hover: { bg: 'blackAlpha.50' },
  _focus: {
    bg: 'white',
    borderColor: 'brand.primary',
    boxShadow: '0 0 0 1px #1B22A7',
  },
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
    <MotionBox
      w="full"
      maxW="440px"
      mx="auto"
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderTopWidth="4px"
      borderTopColor="brand.primary"
      boxShadow="lg"
      px={{ base: 6, md: 8 }}
      py={{ base: 8, md: 10 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      <VStack spacing={6} align="stretch">
        <VStack spacing={3} textAlign="center">
          <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="32px" w="auto" />
          <Text fontSize="sm" color="gray.500">
            Entrar al sistema
          </Text>
        </VStack>

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
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Ingresa tu correo. Luego podrás verificar con código o contraseña.
                </Text>
                <Field icon={Mail}>
                  <FormLabel srOnly>Correo</FormLabel>
                  <Input
                    type="email"
                    autoComplete="username"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    {...inputProps}
                  />
                </Field>
                <Button
                  type="submit"
                  h="48px"
                  borderRadius="full"
                  bg="brand.primary"
                  color="white"
                  isLoading={loading}
                  loadingText="Continuando…"
                  _hover={{ bg: 'brand.primaryDark' }}
                >
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
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Elige cómo quieres entrar con <Text as="span" fontWeight="semibold">{email}</Text>
                </Text>
                {canEmailCode ? (
                  <Button
                    h="48px"
                    borderRadius="full"
                    bg="brand.primary"
                    color="white"
                    leftIcon={<KeyRound size={16} />}
                    onClick={onChooseCode}
                    isLoading={loading}
                    _hover={{ bg: 'brand.primaryDark' }}
                  >
                    Código de verificación
                  </Button>
                ) : null}
                {canPassword ? (
                  <Button
                    h="48px"
                    borderRadius="full"
                    variant="outline"
                    borderWidth="2px"
                    borderColor="brand.ink"
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
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Escribe el código que enviamos a{' '}
                  <Text as="span" fontWeight="semibold">
                    {email}
                  </Text>
                </Text>
                <Field icon={KeyRound}>
                  <FormLabel srOnly>Código</FormLabel>
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
                <Button
                  type="submit"
                  h="48px"
                  borderRadius="full"
                  bg="brand.primary"
                  color="white"
                  isLoading={loading}
                  loadingText="Verificando…"
                  _hover={{ bg: 'brand.primaryDark' }}
                >
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
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Ingresa la contraseña de{' '}
                  <Text as="span" fontWeight="semibold">
                    {email}
                  </Text>
                </Text>
                <Field icon={Lock}>
                  <FormLabel srOnly>Contraseña</FormLabel>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    {...inputProps}
                  />
                </Field>
                <Button
                  type="submit"
                  h="48px"
                  borderRadius="full"
                  bg="brand.primary"
                  color="white"
                  isLoading={loading}
                  loadingText="Ingresando…"
                  _hover={{ bg: 'brand.primaryDark' }}
                >
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
          <Text fontSize="sm" color="brand.primary" textAlign="center" lineHeight="1.5">
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
              <Text fontSize="sm" color="gray.500" textAlign="center" lineHeight="1.55">
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

        <VStack spacing={3}>
          <Button
            as={RouterLink}
            to={RUTAS_AUTH.inicio}
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            color="gray.600"
            borderColor="blackAlpha.200"
            fontWeight="medium"
            _hover={{ bg: 'brand.soft', borderColor: 'blackAlpha.300' }}
          >
            Volver al inicio
          </Button>
          <Link as={RouterLink} to={RUTAS_AUTH.contacto} fontSize="sm" color="gray.400">
            Contacto
          </Link>
        </VStack>
      </VStack>
    </MotionBox>
  )
}

export default function EntrarPage() {
  return (
    <>
      <SignedIn>
        <Navigate to={RUTAS_AUTH.postLogin} replace />
      </SignedIn>
      <SignedOut>
        <Box
          minH="100vh"
          bgGradient="linear(to-b, white 0%, brand.wash 100%)"
          display="flex"
          alignItems="center"
          py={12}
          px={4}
        >
          <Container maxW="5xl">
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 10, md: 14 }}
              alignItems="center"
            >
              <VStack
                align={{ base: 'center', md: 'flex-start' }}
                textAlign={{ base: 'center', md: 'left' }}
                spacing={5}
              >
                <Heading
                  as="h1"
                  fontSize={{ base: '1.8rem', md: '2rem', lg: '2.4rem' }}
                  lineHeight="1.15"
                  letterSpacing="-0.03em"
                  color="brand.ink"
                >
                  Inducción clara.
                  <Box as="br" />
                  <Box as="span" color="brand.primary">
                    Equipo listo.
                  </Box>
                </Heading>
                <Text color="brand.ink" opacity={0.7} maxW="38ch" lineHeight="1.65">
                  Programas por cargo, avance del equipo y evidencia lista para auditorías.
                </Text>
                <Box
                  display={{ base: 'none', md: 'block' }}
                  bg="#4260e615"
                  borderRadius="3xl"
                  maxW="md"
                  w="full"
                  overflow="hidden"
                  pt={8}
                >
                  {/* La ilustracion es decorativa, por eso el alt va vacio */}
                  <Image
                    src="/illustrations/undraw_thumbs-up.svg"
                    alt=""
                    w="70%"
                    mx="auto"
                    display="block"
                  />
                </Box>
              </VStack>

              <LoginCard />
            </SimpleGrid>
          </Container>
        </Box>
      </SignedOut>
    </>
  )
}
