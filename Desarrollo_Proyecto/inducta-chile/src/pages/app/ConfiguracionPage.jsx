import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useAuth, useClerk, useOrganization, useUser } from '@clerk/clerk-react'
import { Building2, CreditCard, LogOut, Settings2, User, Users } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import SettingsCard, { SettingsRow } from '../../components/dashboard/SettingsCard'
import { CompletarCuentaForm } from '../../features/cuenta/CompletarCuentaForm'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import { useEmpresaDatos } from '../../features/empresa/useEmpresaDatos'
import { esAdminEmpresa, etiquetaOrgRol } from '../../lib/authRol'
import { estadoPlan, fechaCortaEs, getPlan } from '../../lib/planes'

function PageHeader({ titulo, bajada }) {
  return (
    <Flex align="flex-start" gap={3} mb={8}>
      <Flex
        w="44px"
        h="44px"
        align="center"
        justify="center"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        bg="brand.soft"
        flexShrink={0}
      >
        <Icon as={Settings2} boxSize={5} color="brand.primary" strokeWidth={1.75} />
      </Flex>
      <Box>
        <Heading
          as="h1"
          fontSize={{ base: '1.75rem', md: '2.1rem' }}
          fontWeight="semibold"
          letterSpacing="-0.03em"
          lineHeight="1.15"
          color="brand.ink"
        >
          {titulo}
        </Heading>
        <Text color="blackAlpha.600" fontSize="md" mt={1.5} lineHeight="1.5" maxW="48ch">
          {bajada}
        </Text>
      </Box>
    </Flex>
  )
}

function CardSesion({ email }) {
  const { signOut } = useClerk()
  return (
    <SettingsCard titulo="Sesión actual" bajada="Navegador activo en este dispositivo.">
      <Text fontSize="sm" color="brand.ink" fontWeight="medium" mb={4} wordBreak="break-all">
        {email || '—'}
      </Text>
      <Button
        variant="outline"
        size="sm"
        h="36px"
        borderColor="blackAlpha.200"
        leftIcon={<LogOut size={15} />}
        onClick={() => signOut({ redirectUrl: '/' })}
      >
        Cerrar sesión
      </Button>
    </SettingsCard>
  )
}

function ConfigAdmin() {
  const toast = useToast()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { organization } = useOrganization()
  const { empresa, loading, saving, error, guardar } = useEmpresaDatos()
  const { esTemporal, cargar: recargarCuenta } = useEmpresaCuenta()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState('')
  const [errLocal, setErrLocal] = useState('')
  const [verificando, setVerificando] = useState(false)

  async function completarCuenta(payload) {
    setVerificando(true)
    try {
      const token = await getToken()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/completar-cuenta-temporal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, id_empresa: organization?.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo verificar')
      toast({ title: 'Cuenta verificada', status: 'success', duration: 5000 })
      await recargarCuenta()
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', duration: 5000 })
    } finally {
      setVerificando(false)
    }
  }

  useEffect(() => {
    if (!empresa) return
    setNombre(empresa.nombre_comercial ?? '')
    setEmail(empresa.email_contacto ?? '')
  }, [empresa])

  const plan = getPlan(empresa?.plan) || getPlan('demo')
  const vigencia = estadoPlan(empresa?.plan_vence_en)
  const renovarTo =
    plan?.contratable && plan.id
      ? `/contratar?plan=${plan.id}&periodo=${empresa?.periodo === 'anual' ? 'anual' : 'mensual'}`
      : '/precios'
  const colorVigencia =
    vigencia.estado === 'vencido' ? 'red.600' : vigencia.estado === 'por_vencer' ? 'orange.700' : 'brand.primary'

  async function guardarDatos(ev) {
    ev.preventDefault()
    setOk('')
    setErrLocal('')
    const nom = nombre.trim()
    if (!nom) {
      setErrLocal('Escriba el nombre comercial de la empresa.')
      return
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrLocal('Escriba un correo de contacto válido.')
      return
    }
    const res = await guardar({
      nombre_comercial: nom,
      email_contacto: email.trim() || null,
    })
    if (res.ok) setOk('Datos guardados.')
    else setErrLocal(res.error || 'No pudimos guardar.')
  }

  if (loading) {
    return (
      <Text color="blackAlpha.600" fontSize="sm">
        Cargando configuración…
      </Text>
    )
  }

  if (!empresa) {
    return (
      <SettingsCard titulo="Sincronización" bajada="Falta registrar la organización en la base.">
        <Button as={RouterLink} to="/dashboard" bg="brand.primary" color="white" h="40px" _hover={{ bg: 'brand.primaryDark' }}>
          Ir al inicio para sincronizar
        </Button>
      </SettingsCard>
    )
  }

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.4fr) minmax(0, 1fr)' }} gap={5} alignItems="start">
      <VStack align="stretch" spacing={5}>
        {esTemporal ? (
          <SettingsCard
            icon={Building2}
            titulo="Verificar cuenta temporal"
            bajada="Complete sus datos reales para habilitar invitaciones."
          >
            <CompletarCuentaForm onSubmit={completarCuenta} isLoading={verificando} />
          </SettingsCard>
        ) : null}

        <Box as="form" onSubmit={guardarDatos}>
          <SettingsCard
            icon={User}
            titulo="Perfil de la empresa"
            bajada="Nombre comercial y correo de contacto o facturación."
            footer={
              <Button type="submit" size="sm" h="36px" px={5} isLoading={saving} loadingText="Guardando">
                Guardar cambios
              </Button>
            }
          >
            <VStack align="stretch" spacing={4} pt={1}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" mb={1.5}>
                  Nombre comercial
                </FormLabel>
                <Input
                  h="42px"
                  borderRadius="md"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={160}
                  bg="white"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" mb={1.5}>
                  Empresa o espacio
                </FormLabel>
                <Input h="42px" borderRadius="md" value={organization?.name || ''} isReadOnly bg="blackAlpha.50" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" mb={1.5}>
                  Correo electrónico
                </FormLabel>
                <Input
                  h="42px"
                  borderRadius="md"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compras@empresa.cl"
                  bg="white"
                />
              </FormControl>
              {(errLocal || error) && (
                <Text fontSize="sm" color="red.600">
                  {errLocal || error}
                </Text>
              )}
              {ok && (
                <Text fontSize="sm" color="brand.primary">
                  {ok}
                </Text>
              )}
            </VStack>
          </SettingsCard>
        </Box>
      </VStack>

      <VStack align="stretch" spacing={5}>
        <SettingsCard icon={CreditCard} titulo="Cuenta y plan" bajada="Estado de su suscripción Inducta.">
          <SettingsRow label="Plan">{plan?.nombre ?? empresa.plan}</SettingsRow>
          <SettingsRow label="Periodo">
            {empresa.periodo === 'anual' ? 'Anual' : empresa.periodo === 'mensual' ? 'Mensual' : '—'}
          </SettingsRow>
          <SettingsRow label="Vence">{fechaCortaEs(empresa.plan_vence_en)}</SettingsRow>
          <SettingsRow label="Estado" last>
            <Text as="span" color={colorVigencia}>
              {vigencia.etiqueta}
            </Text>
          </SettingsRow>
          <Flex gap={3} mt={4} wrap="wrap">
            <Button as={RouterLink} to={renovarTo} size="sm" h="36px">
              {plan?.contratable ? 'Renovar' : 'Ver planes'}
            </Button>
            <Button as={RouterLink} to="/precios" size="sm" h="36px" variant="outline" borderColor="blackAlpha.200">
              Cambiar plan
            </Button>
          </Flex>
        </SettingsCard>

        <SettingsCard icon={Users} titulo="Equipo" bajada="Invitaciones y roles según el cupo del plan.">
          <Button as={RouterLink} to="/dashboard/equipo" size="sm" h="36px" variant="outline" borderColor="blackAlpha.200">
            Gestionar equipo
          </Button>
        </SettingsCard>

        <CardSesion email={user?.primaryEmailAddress?.emailAddress} />
      </VStack>
    </Grid>
  )
}

function ConfigTrabajador() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.4fr) minmax(0, 1fr)' }} gap={5} alignItems="start">
      <SettingsCard
        icon={User}
        titulo="Perfil"
        bajada="Datos de su cuenta en Inducta."
        footer={
          <Button
            size="sm"
            h="36px"
            variant="outline"
            borderColor="blackAlpha.200"
            onClick={() => document.querySelector('.cl-userButtonTrigger')?.click()}
          >
            Abrir mi cuenta
          </Button>
        }
      >
        <FormControl mb={4}>
          <FormLabel fontSize="sm" mb={1.5}>
            Nombre completo
          </FormLabel>
          <Input h="42px" value={user?.fullName || ''} isReadOnly bg="blackAlpha.50" borderRadius="md" />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontSize="sm" mb={1.5}>
            Correo electrónico
          </FormLabel>
          <Input
            h="42px"
            value={user?.primaryEmailAddress?.emailAddress || ''}
            isReadOnly
            bg="blackAlpha.50"
            borderRadius="md"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" mb={1.5}>
            Rol
          </FormLabel>
          <Input
            h="42px"
            value={membership?.role ? etiquetaOrgRol(membership.role) : 'Trabajador'}
            isReadOnly
            bg="blackAlpha.50"
            borderRadius="md"
          />
        </FormControl>
      </SettingsCard>

      <VStack align="stretch" spacing={5}>
        <SettingsCard icon={Building2} titulo="Su empresa" bajada="Organización a la que pertenece.">
          <SettingsRow label="Espacio" last>
            {organization?.name || '—'}
          </SettingsRow>
          <Text fontSize="sm" color="blackAlpha.600" mt={3} lineHeight="1.5">
            El plan y los accesos los administra la empresa.
          </Text>
        </SettingsCard>
        <CardSesion email={user?.primaryEmailAddress?.emailAddress} />
      </VStack>
    </Grid>
  )
}

export default function ConfiguracionPage() {
  const { membership } = useOrganization()
  const admin = esAdminEmpresa(membership)

  return (
    <Box maxW="64rem" mx="auto">
      <PageHeader
        titulo="Configuración de cuenta"
        bajada={
          admin
            ? 'Administre el perfil de la empresa, el plan y la sesión actual.'
            : 'Revise su perfil, la empresa a la que pertenece y la sesión actual.'
        }
      />
      {admin ? <ConfigAdmin /> : <ConfigTrabajador />}
    </Box>
  )
}
