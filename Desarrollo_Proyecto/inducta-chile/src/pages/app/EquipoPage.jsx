import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import { useSupabase } from '../../hooks/useSupabase'
import { esAdminEmpresa, etiquetaOrgRol, ORG_ROL, rolInvitarAdmin } from '../../lib/authRol'
import { cuposDisponibles, getPlan, puedeInvitar } from '../../lib/planes'

function nombreMiembro(m) {
  const u = m.publicUserData
  const nombre = [u?.firstName, u?.lastName].filter(Boolean).join(' ')
  return nombre || u?.identifier || 'Sin nombre'
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

  if (isLoaded && !esAdminEmpresa(membership)) {
    return <Navigate to="/dashboard" replace />
  }

  const plan = getPlan(planId) || getPlan('demo')
  const miembros = memberships?.data ?? []
  const pendientes = (invitations?.data ?? []).filter((i) => i.status === 'pending')
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
    <Box maxW="52rem">
      <Heading
        as="h1"
        fontSize={{ base: '2rem', md: '2.4rem' }}
        fontWeight="semibold"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        color="brand.ink"
        mb={3}
      >
        Equipo
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="42ch" mb={3}>
        Invite colaboradores a {organization?.name}.
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" mb={14}>
        Plan {plan.nombre}
        {cupos == null
          ? ' · sin límite de cupos'
          : ` · ${miembros.length} de ${plan.maxColaboradores}`
            + (pendientes.length ? ` · ${pendientes.length} pendientes` : '')
            + ` · ${cupos} libres`}
      </Text>

      <Box as="section" mb={16}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={2}>
          Añadir usuario
        </Heading>
        {bloqueoTemporal ? (
          <Box mb={8} px={4} py={3} bg="brand.wash" borderRadius="md">
            <Text fontSize="sm" color="brand.ink" lineHeight={1.55} mb={2}>
              Su cuenta es temporal. Debe completar sus datos reales antes de crear o invitar usuarios.
            </Text>
            <Button as={RouterLink} to="/dashboard/configuracion" size="sm" variant="link" color="brand.primary">
              Ir a Configuración
            </Button>
          </Box>
        ) : (
          <Text fontSize="sm" color="blackAlpha.700" mb={8} maxW="44ch" lineHeight="1.6">
            Recibirá un correo de Clerk para unirse. Si ya tiene cuenta, verá la invitación al entrar.
          </Text>
        )}
        <Box as="form" onSubmit={invitar}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align={{ md: 'flex-end' }}>
            <FormControl flex="1" isRequired isDisabled={!hayCupo || bloqueoTemporal} maxW={{ md: '22rem' }}>
              <FormLabel fontSize="sm">Correo</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.cl"
                autoComplete="email"
                h="44px"
              />
            </FormControl>
            <FormControl w={{ base: 'full', md: '11rem' }} isDisabled={!hayCupo || bloqueoTemporal}>
              <FormLabel fontSize="sm">Rol</FormLabel>
              <Select h="44px" value={rolInvitar} onChange={(e) => setRolInvitar(e.target.value)}>
                <option value={ORG_ROL.MIEMBRO}>Trabajador</option>
                <option value={rolAdmin}>Administrador</option>
              </Select>
            </FormControl>
            <Button
              type="submit"
              isLoading={enviando}
              loadingText="Invitando"
              h="44px"
              px={7}
              isDisabled={!hayCupo || bloqueoTemporal}
            >
              Invitar
            </Button>
          </Flex>
        </Box>
        {error ? (
          <Text role="alert" mt={5} fontSize="sm" color="red.600" maxW="48ch">
            {error}
          </Text>
        ) : null}
        {ok ? (
          <Text role="status" mt={5} fontSize="sm" color="brand.primary">
            {ok}
          </Text>
        ) : null}
      </Box>

      <Box as="section" borderTopWidth="1px" borderColor="blackAlpha.100" pt={14} mb={16}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={8}>
          Miembros
        </Heading>
        <VStack as="ul" listStyleType="none" align="stretch" spacing={0}>
          {miembros.map((m) => (
            <Flex
              as="li"
              key={m.id}
              py={5}
              gap={6}
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              _first={{ borderTopWidth: '1px' }}
            >
              <Box flex="1" minW={0} maxW={{ md: '22rem' }}>
                <Text fontWeight="semibold" color="brand.ink" noOfLines={1}>
                  {nombreMiembro(m)}
                  {soyYo(m) ? (
                    <Text as="span" fontWeight="normal" color="blackAlpha.600">
                      {' '}
                      (usted)
                    </Text>
                  ) : null}
                </Text>
                <Text fontSize="sm" color="blackAlpha.600" noOfLines={1} mt={0.5}>
                  {m.publicUserData?.identifier}
                </Text>
              </Box>
              <Select
                size="sm"
                w={{ base: 'full', md: '11rem' }}
                value={esAdminEmpresa(m) ? rolAdmin : ORG_ROL.MIEMBRO}
                isDisabled={accionId === m.id}
                onChange={(e) => cambiarRol(m, e.target.value)}
                aria-label={`Rol de ${nombreMiembro(m)}`}
              >
                <option value={ORG_ROL.MIEMBRO}>Trabajador</option>
                <option value={rolAdmin}>Administrador</option>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                color="red.600"
                minW="4.5rem"
                isDisabled={soyYo(m) || accionId === m.id}
                isLoading={accionId === m.id}
                onClick={() => quitarMiembro(m)}
              >
                Quitar
              </Button>
            </Flex>
          ))}
          {miembros.length === 0 ? (
            <Text py={10} color="blackAlpha.600" fontSize="sm">
              Aún no hay miembros cargados.
            </Text>
          ) : null}
        </VStack>
      </Box>

      <Box as="section" borderTopWidth="1px" borderColor="blackAlpha.100" pt={14} pb={4}>
        <Heading as="h2" fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" mb={8}>
          Invitaciones pendientes
        </Heading>
        <VStack as="ul" listStyleType="none" align="stretch" spacing={0}>
          {pendientes.map((inv) => (
            <Flex
              as="li"
              key={inv.id}
              py={5}
              gap={6}
              align="center"
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              _first={{ borderTopWidth: '1px' }}
            >
              <Box flex="1" minW={0} maxW={{ md: '22rem' }}>
                <Text fontWeight="medium" color="brand.ink" noOfLines={1}>
                  {inv.emailAddress}
                </Text>
                <Text fontSize="sm" color="blackAlpha.600" mt={0.5}>
                  {etiquetaOrgRol(inv.role)} · pendiente
                </Text>
              </Box>
              <Button
                size="sm"
                variant="ghost"
                color="red.600"
                minW="4.5rem"
                isLoading={accionId === inv.id}
                onClick={() => revocarInvitacion(inv)}
              >
                Anular
              </Button>
            </Flex>
          ))}
          {pendientes.length === 0 ? (
            <Text py={10} color="blackAlpha.600" fontSize="sm" borderTopWidth="1px" borderColor="blackAlpha.100">
              No hay invitaciones pendientes.
            </Text>
          ) : null}
        </VStack>
      </Box>
    </Box>
  )
}
