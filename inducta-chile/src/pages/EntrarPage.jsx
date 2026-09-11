import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { SignedIn, SignedOut, useSignIn } from '@clerk/clerk-react'
import { ArrowLeft, Building2, KeyRound, Lock, Mail, UserRound } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { RUTAS_AUTH } from '../lib/authCopy'
import { isRolValido, ROL, setRolPendiente } from '../lib/authRol'
import { factorByStrategy, PASO, pasoSiguiente } from '../lib/loginPasos'

const MotionBox = motion.create(Box)

const COPY = {
  [ROL.EMPRESA]: {
    ayuda: 'Si tu empresa aun no tiene acceso, contrata un plan o agenda una demo.',
  },
  [ROL.EMPLEADO]: {
    ayuda: 'Si no puedes entrar, pide a tu administrador que te agregue.',
  },
}

const ease = [0.22, 1, 0.36, 1]

function clerkError(err, fallback) {
  return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || fallback
}

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
    boxShadow: '0 0 0 1px #005691',
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

  // Cuenta regresiva para reenviar codigo
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
          'Esta cuenta no tiene un metodo de ingreso disponible. Contacta a Inducta o a tu empresa.',
        )
        return
      }

      if (siguiente === PASO.CODE) {
        await sendEmailCode(result)
      }

      setStep(siguiente)
    } catch (err) {
      setError(
        clerkError(
          err,
          'No encontramos una cuenta con ese correo. Si eres empresa, agenda una demo. Si eres empleado, pide acceso a tu empresa.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  const sendEmailCode = async (si = signIn) => {
    const factor = factorByStrategy(si, 'email_code')
    if (!factor?.emailAddressId) {
      throw new Error('No hay correo verificado para enviar el codigo.')
    }

    await si.prepareFirstFactor({
      strategy: 'email_code',
      emailAddressId: factor.emailAddressId,
    })
    setInfo(`Enviamos un codigo a ${email.trim()}. Revisa tu bandeja de entrada.`)
    setCooldown(RESEND_SEGUNDOS)
  }

  const onChooseCode = async () => {
    setError('')
    setLoading(true)
    try {
      await sendEmailCode()
      setStep('code')
    } catch (err) {
      setError(clerkError(err, 'No pudimos enviar el codigo. Intenta de nuevo.'))
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
      setError('Ingresa el codigo de verificacion.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: code.trim(),
      })
      if (await finishIfComplete(result)) return
      setError('Codigo incorrecto o incompleto. Intenta otra vez.')
    } catch (err) {
      setError(clerkError(err, 'Codigo incorrecto o expirado.'))
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
      setError(clerkError(err, 'Contraseña incorrecta.'))
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
      setError(clerkError(err, 'No pudimos reenviar el codigo.'))
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
        <VStack spacing={1} textAlign="center">
          <Text
            fontFamily="heading"
            fontWeight="bold"
            fontSize="xl"
            color="brand.ink"
            letterSpacing="-0.02em"
          >
            Inducta Chile
          </Text>
          <Text fontSize="sm" color="gray.500">
            Entrar al sistema
          </Text>
        </VStack>

        <RolToggle rol={rol} onChange={setRol} disabled={step !== 'email'} />

        <AnimatePresence mode="wait">
          {/* Paso correo */}
          {step === 'email' ? (
            <MotionBox
              key="email"
              as="form"
              onSubmit={onContinueEmail}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Ingresa tu correo. Luego podras verificar con codigo o contraseña.
                </Text>
                <Field icon={Mail}>
                  <FormLabel srOnly>Correo</FormLabel>
                  <Input
                    type="email"
                    autoComplete="username"
                    placeholder="Correo electronico"
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
                  _hover={{ bg: '#004578' }}
                >
                  Continuar
                </Button>
              </VStack>
            </MotionBox>
          ) : null}

          {/* Elegir metodo */}
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
                  Elige como quieres entrar con <Text as="span" fontWeight="semibold">{email}</Text>
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
                    _hover={{ bg: '#004578' }}
                  >
                    Codigo de verificacion
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

          {/* Codigo */}
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
                  Escribe el codigo que enviamos a{' '}
                  <Text as="span" fontWeight="semibold">
                    {email}
                  </Text>
                </Text>
                <Field icon={KeyRound}>
                  <FormLabel srOnly>Codigo</FormLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Codigo de verificacion"
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
                  _hover={{ bg: '#004578' }}
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
                    ? `Reenviar codigo en ${cooldown}s`
                    : 'Reenviar codigo'}
                </Button>
                {canPassword ? (
                  <Button type="button" variant="link" color="gray.500" onClick={onChoosePassword}>
                    Preferir contraseña
                  </Button>
                ) : null}
              </VStack>
            </MotionBox>
          ) : null}

          {/* Contraseña */}
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
                  _hover={{ bg: '#004578' }}
                >
                  Iniciar sesion
                </Button>
                {canEmailCode ? (
                  <Button type="button" variant="link" color="brand.primary" onClick={onChooseCode}>
                    Preferir codigo de verificacion
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
                {copy.ayuda}{' '}
                <Link
                  as={RouterLink}
                  to={rol === ROL.EMPRESA ? RUTAS_AUTH.precios : RUTAS_AUTH.contacto}
                  color="brand.primary"
                  fontWeight="medium"
                >
                  {rol === ROL.EMPRESA ? 'Ver planes' : 'Contactar Inducta'}
                </Link>
              </Text>
            </MotionBox>
          </AnimatePresence>
        ) : null}

        <Text fontSize="sm" color="gray.400" textAlign="center">
          <Link as={RouterLink} to={RUTAS_AUTH.inicio} color="brand.primary">
            Volver al sitio
          </Link>
          {' · '}
          <Link as={RouterLink} to={RUTAS_AUTH.contacto} color="brand.primary">
            Contacto
          </Link>
        </Text>
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
          bg="brand.soft"
          display="flex"
          alignItems="center"
          py={12}
          px={4}
          backgroundImage="radial-gradient(ellipse at top, rgba(0,86,145,0.12), transparent 55%)"
        >
          <Container maxW="lg">
            <LoginCard />
          </Container>
        </Box>
      </SignedOut>
    </>
  )
}
