import { Avatar, Box, Text } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Settings2, User } from 'lucide-react'
import PanelPageHeader from '../../components/dashboard/PanelPageHeader'
import SettingsCard, { SettingsRow } from '../../components/dashboard/SettingsCard'
import { etiquetaOrgRol } from '../../lib/authRol'

export default function EmpleadoPerfilPage() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()

  const nombre = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'
  const email = user?.primaryEmailAddress?.emailAddress || '—'
  const rolLabel = membership ? etiquetaOrgRol(membership.role) : '—'

  return (
    <Box maxW="48rem" mx="auto">
      <PanelPageHeader
        icon={Settings2}
        titulo="Mi perfil"
        bajada="Datos de su cuenta en Inducta y la empresa a la que pertenece."
      />

      <SettingsCard icon={User} titulo="Cuenta" bajada="Información visible para su organización.">
        <Box mb={5}>
          <Avatar name={nombre} src={user?.imageUrl} size="lg" bg="brand.primary" color="white" />
        </Box>
        <SettingsRow label="Nombre">{nombre}</SettingsRow>
        <SettingsRow label="Correo">{email}</SettingsRow>
        <SettingsRow label="Empresa">{organization?.name || '—'}</SettingsRow>
        <SettingsRow label="Rol" last>
          {rolLabel}
        </SettingsRow>
      </SettingsCard>

      <Text fontSize="xs" color="blackAlpha.500" mt={4}>
        Para cambiar nombre o correo, use el menú de cuenta (ícono de usuario arriba a la derecha).
      </Text>
    </Box>
  )
}
