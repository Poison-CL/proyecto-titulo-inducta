import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useAuth, useOrganization, useUser } from '@clerk/clerk-react'
import { Link as RouterLink } from 'react-router-dom'
import { CompletarCuentaForm } from '../../features/cuenta/CompletarCuentaForm'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import { useEmpresaDatos } from '../../features/empresa/useEmpresaDatos'
import { esAdminEmpresa, etiquetaOrgRol } from '../../lib/authRol'
import { estadoPlan, fechaCortaEs, getPlan } from '../../lib/planes'

function Fila({ label, children }) {
  return (
    <Flex
      gap={{ base: 1, md: 10 }}
      py={5}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      direction={{ base: 'column', md: 'row' }}
      align={{ md: 'baseline' }}
      _last={{ borderBottomWidth: 0 }}
    >
      <Text fontSize="sm" color="blackAlpha.600" w={{ md: '9rem' }} flexShrink={0}>
        {label}
      </Text>
      <Box fontSize="md" color="brand.ink" fontWeight="medium" flex="1">
        {children}
      </Box>
    </Flex>
  )
}

function ConfigAdmin() {
  const toast = useToast()
  const { getToken } = useAuth()
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
    if (res.ok) setOk('Datos de la empresa guardados.')
    else setErrLocal(res.error || 'No pudimos guardar.')
  }

  if (loading) {
    return (
      <Text color="blackAlpha.600" fontSize="sm" mt={10}>
        Cargando configuración…
      </Text>
    )
  }

  if (!empresa) {
    return (
      <Box mt={14}>
        <Text color="brand.ink" mb={4} maxW="44ch" lineHeight="1.6">
          Su organización aún no está sincronizada con la base de datos.
        </Text>
        <Button as={RouterLink} to="/dashboard" variant="link" color="brand.primary" fontWeight="semibold" p={0} h="auto">
          Ir al inicio para sincronizar →
        </Button>
      </Box>
    )
  }

  const colorVigencia =
    vigencia.estado === 'vencido' ? 'red.600' : vigencia.estado === 'por_vencer' ? 'orange.700' : 'brand.primary'

  return (
    <Flex direction={{ base: 'column', xl: 'row' }} gap={{ base: 16, xl: 20 }} mt={14} align="flex-start">
      <Box as="section" flex="1" minW={0} maxW={{ xl: '28rem' }}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
          Plan y renovación
        </Heading>
        <Text fontSize="sm" color="blackAlpha.700" mb={8} maxW="40ch" lineHeight="1.6">
          Estado del plan contratado y fecha en que debe renovarse.
        </Text>

        <Box borderTopWidth="1px" borderColor="blackAlpha.100">
          <Fila label="Plan">{plan?.nombre ?? empresa.plan}</Fila>
          <Fila label="Periodo">{empresa.periodo === 'anual' ? 'Anual' : empresa.periodo === 'mensual' ? 'Mensual' : '—'}</Fila>
          <Fila label="Vence el">{fechaCortaEs(empresa.plan_vence_en)}</Fila>
          <Fila label="Estado">
            <Text color={colorVigencia}>{vigencia.etiqueta}</Text>
          </Fila>
          <Fila label="Cupo">{plan?.maxColaboradores == null ? 'Sin límite' : `Hasta ${plan.maxColaboradores}`}</Fila>
        </Box>

        {(vigencia.estado === 'vencido' || vigencia.estado === 'por_vencer') && (
          <Text mt={6} fontSize="sm" color={vigencia.estado === 'vencido' ? 'red.700' : 'orange.800'} maxW="40ch" lineHeight="1.6">
            {vigencia.estado === 'vencido'
              ? 'Su plan está vencido. Renueve para seguir invitando colaboradores.'
              : 'Su plan vence pronto. Puede renovarlo ahora para no quedarse sin acceso.'}
          </Text>
        )}

        <Flex gap={6} mt={8} wrap="wrap" align="center">
          <Button as={RouterLink} to={renovarTo} h="44px" px={7}>
            {plan?.contratable ? 'Renovar plan' : 'Ver planes'}
          </Button>
          <Button as={RouterLink} to="/precios" variant="link" color="brand.primary" fontWeight="medium" p={0} h="auto">
            Cambiar de plan →
          </Button>
        </Flex>

        <Box mt={12}>
          <Text fontSize="sm" fontWeight="semibold" color="brand.ink" mb={4}>
            Incluido en su plan
          </Text>
          <VStack as="ul" align="stretch" spacing={3} listStyleType="none">
            {(plan?.features ?? [])
              .filter((f) => f.ok)
              .map((f) => (
                <Text as="li" key={f.text} fontSize="sm" color="blackAlpha.700" lineHeight="1.5">
                  {f.text}
                </Text>
              ))}
          </VStack>
        </Box>
      </Box>

      <Box as="section" flex="1" minW={0} maxW={{ xl: '24rem' }} pt={{ base: 2, xl: 0 }}>
        {esTemporal ? (
          <Box mb={14}>
            <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
              Verificar cuenta temporal
            </Heading>
            <Box mb={6}>
              <CompletarCuentaForm onSubmit={completarCuenta} isLoading={verificando} />
            </Box>
          </Box>
        ) : null}
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
          Datos de la empresa
        </Heading>
        <Text fontSize="sm" color="blackAlpha.700" mb={8} maxW="40ch" lineHeight="1.6">
          Nombre comercial y correo para contacto o facturación.
        </Text>
        <Box as="form" onSubmit={guardarDatos}>
          <VStack align="stretch" spacing={5}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Nombre comercial</FormLabel>
              <Input h="44px" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={160} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Correo de contacto</FormLabel>
              <Input
                h="44px"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compras@empresa.cl"
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
            <Button type="submit" alignSelf="flex-start" isLoading={saving} loadingText="Guardando" h="44px" px={7} mt={1}>
              Guardar cambios
            </Button>
          </VStack>
        </Box>

        <Box mt={14} pt={10} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
            Equipo
          </Heading>
          <Text fontSize="sm" color="blackAlpha.700" mb={5} maxW="40ch" lineHeight="1.6">
            Invite colaboradores y gestione roles según el cupo de su plan.
          </Text>
          <Button as={RouterLink} to="/dashboard/equipo" variant="link" color="brand.primary" fontWeight="semibold" p={0} h="auto">
            Ir a Equipo →
          </Button>
        </Box>
      </Box>
    </Flex>
  )
}

function ConfigTrabajador() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()

  return (
    <Flex direction={{ base: 'column', xl: 'row' }} gap={{ base: 16, xl: 20 }} mt={14} align="flex-start">
      <Box as="section" flex="1" minW={0} maxW={{ xl: '28rem' }}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={8}>
          Su cuenta
        </Heading>
        <Box borderTopWidth="1px" borderColor="blackAlpha.100">
          <Fila label="Nombre">{user?.fullName || '—'}</Fila>
          <Fila label="Correo">{user?.primaryEmailAddress?.emailAddress || '—'}</Fila>
          <Fila label="Rol">{membership?.role ? etiquetaOrgRol(membership.role) : 'Trabajador'}</Fila>
        </Box>
      </Box>

      <Box as="section" flex="1" minW={0} maxW={{ xl: '24rem' }}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={8}>
          Su empresa
        </Heading>
        <Box borderTopWidth="1px" borderColor="blackAlpha.100">
          <Fila label="Organización">{organization?.name || '—'}</Fila>
        </Box>
        <Text fontSize="sm" color="blackAlpha.700" mt={8} maxW="40ch" lineHeight="1.6">
          El plan y los accesos los administra la empresa. Si necesita un cambio, escriba a su administrador.
        </Text>

        <Box mt={14} pt={10} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
            Preferencias
          </Heading>
          <Text fontSize="sm" color="blackAlpha.700" mb={5} maxW="40ch" lineHeight="1.6">
            Actualice nombre, correo o contraseña desde su cuenta.
          </Text>
          <Button
            variant="link"
            color="brand.primary"
            fontWeight="semibold"
            p={0}
            h="auto"
            onClick={() => document.querySelector('.cl-userButtonTrigger')?.click()}
          >
            Abrir mi cuenta →
          </Button>
        </Box>
      </Box>
    </Flex>
  )
}

export default function ConfiguracionPage() {
  const { membership } = useOrganization()
  const admin = esAdminEmpresa(membership)

  return (
    <Box maxW="64rem">
      <Heading
        as="h1"
        fontSize={{ base: '2rem', md: '2.4rem' }}
        fontWeight="semibold"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        color="brand.ink"
        mb={3}
      >
        {admin ? 'Configuración' : 'Su configuración'}
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="42ch">
        {admin
          ? 'Plan, renovación y datos de contacto de su organización.'
          : 'Datos de su cuenta y de la empresa a la que pertenece.'}
      </Text>

      {admin ? <ConfigAdmin /> : <ConfigTrabajador />}
    </Box>
  )
}
