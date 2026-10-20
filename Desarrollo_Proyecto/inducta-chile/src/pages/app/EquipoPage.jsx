import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Mail, UserPlus, Users } from 'lucide-react'
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom'
import BusquedaFiltroBanner from '../../components/dashboard/BusquedaFiltroBanner'
import SettingsCard, { SettingsRow } from '../../components/dashboard/SettingsCard'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import { useSupabase } from '../../hooks/useSupabase'
import { esAdminEmpresa, etiquetaOrgRol, ORG_ROL, rolInvitarAdmin } from '../../lib/authRol'
import { textoCoincide } from '../../lib/panelBusqueda'
import { cuposDisponibles, getPlan, puedeInvitar } from '../../lib/planes'

function nombreMiembro(m) {
  const u = m.publicUserData
  const nombre = [u?.firstName, u?.lastName].filter(Boolean).join(' ')
  return nombre || u?.identifier || 'Sin nombre'
}

function iniciales(nombre) {
  const p = String(nombre || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!p.length) return '?'
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return `${p[0][0]}${p[1][0]}`.toUpperCase()
}

function mensajeErrorClerk(err) {
  const code = err?.errors?.[0]?.code
  if (code === 'form_identifier_exists' || code === 'organization_membership_exists') {
    return 'Esa persona ya pertenece a la empresa o ya tiene una invitación pendiente.'
  }
  if (code === 'form_param_format_invalid') return 'Escriba un correo válido.'
  return err?.errors?.[0]?.longMessage || err?.message || 'No pudimos completar la acción. Intente de nuevo.'
}

export default function EquipoPage() {
  const { user } = useUser()
  const supabase = useSupabase()
  const { isLoaded, organization, membership, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })

  const [email, setEmail] = useState('')
  const rolAdmin = rolInvitarAdmin(membership)
  const [rolInvitar, setRolInvitar] = useState(ORG_ROL.MIEMBRO)
  const [enviando, setEnviando] = useState(false)
  const [accionId, setAccionId] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [planId, setPlanId] = useState('demo')
  const { esTemporal, puedeEquipo } = useEmpresaCuenta()
  const [params] = useSearchParams()
  const consulta = params.get('q')?.trim() || ''

  useEffect(() => {
    if (!organization?.id) return
    let vivo = true
    supabase
      .from('empresa')
      .select('plan')
      .eq('id_empresa', organization.id)
      .maybeSingle()
      .then(({ data }) => {
        if (vivo && data?.plan) setPlanId(data.plan)
      })
    return () => {
      vivo = false
    }
  }, [organization?.id, supabase])

  const miembros = memberships?.data ?? []
  const pendientes = (invitations?.data ?? []).filter((i) => i.status === 'pending')
  const miembrosVisibles = useMemo(
    () =>
      consulta
        ? miembros.filter((m) => {
            const u = m.publicUserData
            const nombre = [u?.firstName, u?.lastName].filter(Boolean).join(' ')
            return (
              textoCoincide(nombre, consulta) ||
              textoCoincide(u?.identifier, consulta) ||
              textoCoincide(u?.userId, consulta)
            )
          })
        : miembros,
    [miembros, consulta],
  )
  const pendientesVisibles = useMemo(
    () => (consulta ? pendientes.filter((i) => textoCoincide(i.emailAddress, consulta)) : pendientes),
    [pendientes, consulta],
  )

  useEffect(() => {
    if (!consulta || !isLoaded) return
    requestAnimationFrame(() => {
      document.querySelector('[data-busqueda-hit]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }, [consulta, isLoaded, miembrosVisibles, pendientesVisibles])

  if (isLoaded && !esAdminEmpresa(membership)) {
    return <Navigate to="/dashboard" replace />
  }

  const plan = getPlan(planId) || getPlan('demo')
  const cupos = cuposDisponibles(plan, miembros.length, pendientes.length)
  const hayCupo = puedeInvitar(plan, miembros.length, pendientes.length) && puedeEquipo
  const bloqueoTemporal = esTemporal || !puedeEquipo
  const soyYo = (m) => m.publicUserData?.userId === user?.id
  const soloUnAdmin = miembros.filter((m) => esAdminEmpresa(m)).length <= 1

  async function refrescar() {
    await Promise.all([memberships?.revalidate?.(), invitations?.revalidate?.()])
  }

  async function invitar(ev) {
    ev.preventDefault()
    setError('')
    setOk('')
    if (bloqueoTemporal) {
      setError('Cuenta temporal: complete sus datos reales en Configuración antes de invitar usuarios.')
      return
    }
    if (!hayCupo) {
      setError(
        `Su plan ${plan.nombre} permite hasta ${plan.maxColaboradores} colaboradores. Actualice el plan para invitar más.`,
      )
      return
    }
    const correo = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Escriba un correo válido.')
      return
    }
    setEnviando(true)
    try {
      await organization.inviteMember({ emailAddress: correo, role: rolInvitar })
      setEmail('')
      setRolInvitar(ORG_ROL.MIEMBRO)
      setOk(`Invitación enviada a ${correo}.`)
      await refrescar()
    } catch (err) {
      setError(mensajeErrorClerk(err))
    } finally {
      setEnviando(false)
    }
  }

  async function cambiarRol(m, role) {
    const quedaAdmin = role === rolAdmin || esAdminEmpresa({ role })
    if (soyYo(m) && !quedaAdmin) {
      setError('No puede quitarse el rol de administrador a sí mismo.')
      return
    }
    if (esAdminEmpresa(m) && !quedaAdmin && soloUnAdmin) {
      setError('Debe quedar al menos un administrador en la empresa.')
      return
    }
    setError('')
    setOk('')
    setAccionId(m.id)
    try {
      await m.update({ role })
      setOk('Rol actualizado.')
      await refrescar()
    } catch (err) {
      setError(mensajeErrorClerk(err))
    } finally {
      setAccionId(null)
    }
  }

  async function quitarMiembro(m) {
    if (soyYo(m)) {
      setError('No puede eliminarse a sí mismo de la empresa.')
      return
    }
    if (esAdminEmpresa(m) && soloUnAdmin) {
      setError('Debe quedar al menos un administrador en la empresa.')
      return
    }
    setError('')
    setOk('')
    setAccionId(m.id)
    try {
      await m.destroy()
      setOk('Usuario eliminado de la empresa.')
      await refrescar()
    } catch (err) {
      setError(mensajeErrorClerk(err))
    } finally {
      setAccionId(null)
    }
  }

  async function revocarInvitacion(inv) {
    setError('')
    setOk('')
    setAccionId(inv.id)
    try {
      await inv.revoke()
      setOk('Invitación anulada.')
      await refrescar()
    } catch (err) {
      setError(mensajeErrorClerk(err))
    } finally {
      setAccionId(null)
    }
  }

  if (!isLoaded) {
    return (
      <Text color="blackAlpha.600" fontSize="sm">
        Cargando equipo…
      </Text>
    )
  }

  return (
    <Box maxW="64rem" mx="auto">
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
          <Icon as={Users} boxSize={5} color="brand.primary" strokeWidth={1.75} />
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
            Equipo
          </Heading>
          <Text color="blackAlpha.600" fontSize="md" mt={1.5} lineHeight="1.5" maxW="48ch">
            Invite y gestione colaboradores de {organization?.name || 'su empresa'}.
          </Text>
        </Box>
      </Flex>

      <BusquedaFiltroBanner
        consulta={consulta}
        total={miembros.length + pendientes.length}
        visibles={miembrosVisibles.length + pendientesVisibles.length}
      />

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.45fr) minmax(0, 1fr)' }} gap={5} mb={5} alignItems="start">
        <Box as="form" onSubmit={invitar}>
          <SettingsCard
            icon={UserPlus}
            titulo="Invitar colaborador"
            bajada={
              bloqueoTemporal
                ? 'Complete sus datos reales antes de invitar.'
                : 'Recibirá un correo para unirse a la organización.'
            }
            footer={
              <Button
                type="submit"
                size="sm"
                h="36px"
                px={5}
                isLoading={enviando}
                loadingText="Invitando"
                isDisabled={!hayCupo || bloqueoTemporal}
              >
                Enviar invitación
              </Button>
            }
          >
            {bloqueoTemporal ? (
              <Box mb={4} px={3.5} py={3} bg="brand.wash" borderRadius="md">
                <Text fontSize="sm" color="brand.ink" lineHeight={1.55} mb={2}>
                  Su cuenta es temporal. Debe completar sus datos reales antes de crear o invitar usuarios.
                </Text>
                <Button as={RouterLink} to="/dashboard/configuracion" size="sm" variant="link" color="brand.primary" p={0} h="auto">
                  Ir a Configuración →
                </Button>
              </Box>
            ) : null}

            <Flex direction={{ base: 'column', sm: 'row' }} gap={3} align={{ sm: 'flex-end' }}>
              <FormControl flex="1" isRequired isDisabled={!hayCupo || bloqueoTemporal}>
                <FormLabel fontSize="sm" mb={1.5}>
                  Correo
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.cl"
                  autoComplete="email"
                  h="42px"
                  borderRadius="md"
                  bg="white"
                />
              </FormControl>
              <FormControl w={{ base: 'full', sm: '11rem' }} isDisabled={!hayCupo || bloqueoTemporal}>
                <FormLabel fontSize="sm" mb={1.5}>
                  Rol
                </FormLabel>
                <Select h="42px" borderRadius="md" value={rolInvitar} onChange={(e) => setRolInvitar(e.target.value)} bg="white">
                  <option value={ORG_ROL.MIEMBRO}>Trabajador</option>
                  <option value={rolAdmin}>Administrador</option>
                </Select>
              </FormControl>
            </Flex>

            {error ? (
              <Text role="alert" mt={4} fontSize="sm" color="red.600">
                {error}
              </Text>
            ) : null}
            {ok ? (
              <Text role="status" mt={4} fontSize="sm" color="brand.primary">
                {ok}
              </Text>
            ) : null}
          </SettingsCard>
        </Box>

        <SettingsCard icon={Users} titulo="Cupos del plan" bajada={`Plan ${plan.nombre}.`}>
          <SettingsRow label="Miembros">{miembros.length}</SettingsRow>
          <SettingsRow label="Pendientes">{pendientes.length}</SettingsRow>
          <SettingsRow label="Cupo" last>
            {cupos == null ? 'Sin límite' : `${cupos} libres de ${plan.maxColaboradores}`}
          </SettingsRow>
          {!hayCupo && !bloqueoTemporal ? (
            <Button as={RouterLink} to="/dashboard/configuracion" size="sm" mt={4} h="36px" variant="outline" borderColor="blackAlpha.200">
              Revisar plan
            </Button>
          ) : null}
        </SettingsCard>
      </Grid>

      <VStack align="stretch" spacing={5}>
        <SettingsCard
          icon={Users}
          titulo="Miembros"
          bajada={`${miembrosVisibles.length} en esta lista${consulta ? ' · filtrado' : ''}.`}
        >
          <VStack align="stretch" spacing={0} mt={1}>
            {miembrosVisibles.map((m, i) => {
              const nombre = nombreMiembro(m)
              return (
                <Flex
                  key={m.id}
                  py={3.5}
                  gap={3}
                  align={{ base: 'flex-start', md: 'center' }}
                  direction={{ base: 'column', md: 'row' }}
                  borderTopWidth={i === 0 ? 0 : '1px'}
                  borderColor="blackAlpha.100"
                  bg={consulta ? 'brand.wash' : undefined}
                  mx={consulta ? -2 : 0}
                  px={consulta ? 2 : 0}
                  borderRadius={consulta ? 'md' : undefined}
                  data-busqueda-hit={consulta || undefined}
                >
                  <Flex align="center" gap={3} flex="1" minW={0}>
                    <Avatar
                      size="sm"
                      name={nombre}
                      src={m.publicUserData?.imageUrl}
                      bg="brand.wash"
                      color="brand.primary"
                      getInitials={() => iniciales(nombre)}
                    />
                    <Box minW={0}>
                      <Text fontWeight="semibold" color="brand.ink" fontSize="sm" noOfLines={1}>
                        {nombre}
                        {soyYo(m) ? (
                          <Text as="span" fontWeight="normal" color="blackAlpha.500">
                            {' '}
                            · usted
                          </Text>
                        ) : null}
                      </Text>
                      <Text fontSize="xs" color="blackAlpha.600" noOfLines={1}>
                        {m.publicUserData?.identifier}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex gap={2} w={{ base: 'full', md: 'auto' }} align="center">
                    <Select
                      size="sm"
                      w={{ base: 'full', md: '10.5rem' }}
                      h="36px"
                      borderRadius="md"
                      value={esAdminEmpresa(m) ? rolAdmin : ORG_ROL.MIEMBRO}
                      isDisabled={accionId === m.id}
                      onChange={(e) => cambiarRol(m, e.target.value)}
                      aria-label={`Rol de ${nombre}`}
                      bg="white"
                    >
                      <option value={ORG_ROL.MIEMBRO}>Trabajador</option>
                      <option value={rolAdmin}>Administrador</option>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="red.600"
                      h="36px"
                      minW="4.25rem"
                      isDisabled={soyYo(m) || accionId === m.id}
                      isLoading={accionId === m.id}
                      onClick={() => quitarMiembro(m)}
                    >
                      Quitar
                    </Button>
                  </Flex>
                </Flex>
              )
            })}
            {miembros.length === 0 ? (
              <Text py={8} color="blackAlpha.600" fontSize="sm">
                Aún no hay miembros cargados.
              </Text>
            ) : null}
            {miembros.length > 0 && miembrosVisibles.length === 0 && consulta ? (
              <Text py={8} color="blackAlpha.600" fontSize="sm">
                Ningún miembro coincide con la búsqueda.
              </Text>
            ) : null}
          </VStack>
        </SettingsCard>

        <SettingsCard
          icon={Mail}
          titulo="Invitaciones pendientes"
          bajada={
            pendientes.length === 0
              ? 'No hay invitaciones en espera.'
              : `${pendientesVisibles.length} pendiente${pendientesVisibles.length === 1 ? '' : 's'}.`
          }
        >
          <VStack align="stretch" spacing={0} mt={1}>
            {pendientesVisibles.map((inv, i) => (
              <Flex
                key={inv.id}
                py={3.5}
                gap={3}
                align="center"
                borderTopWidth={i === 0 ? 0 : '1px'}
                borderColor="blackAlpha.100"
                bg={consulta ? 'brand.wash' : undefined}
                mx={consulta ? -2 : 0}
                px={consulta ? 2 : 0}
                borderRadius={consulta ? 'md' : undefined}
                data-busqueda-hit={consulta || undefined}
              >
                <Flex
                  w="32px"
                  h="32px"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="brand.soft"
                  borderWidth="1px"
                  borderColor="blackAlpha.100"
                  flexShrink={0}
                >
                  <Icon as={Mail} boxSize={3.5} color="brand.primary" />
                </Flex>
                <Box flex="1" minW={0}>
                  <Text fontWeight="medium" color="brand.ink" fontSize="sm" noOfLines={1}>
                    {inv.emailAddress}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.600">
                    {etiquetaOrgRol(inv.role)} · pendiente
                  </Text>
                </Box>
                <Button
                  size="sm"
                  variant="ghost"
                  color="red.600"
                  h="36px"
                  isLoading={accionId === inv.id}
                  onClick={() => revocarInvitacion(inv)}
                >
                  Anular
                </Button>
              </Flex>
            ))}
            {pendientes.length > 0 && pendientesVisibles.length === 0 && consulta ? (
              <Text py={8} color="blackAlpha.600" fontSize="sm">
                Ninguna invitación coincide con la búsqueda.
              </Text>
            ) : null}
          </VStack>
        </SettingsCard>
      </VStack>
    </Box>
  )
}
