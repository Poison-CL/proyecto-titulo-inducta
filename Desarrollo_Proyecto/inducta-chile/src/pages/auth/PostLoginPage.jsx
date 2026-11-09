import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthLoading from '../../components/auth/AuthLoading'
import { AUTH_COPY, RUTAS_AUTH } from '../../lib/authCopy'
import {
  getRolUsuario,
  getUltimoRol,
  peekRolPendiente,
  rutaAccesoSinOrg,
} from '../../lib/authRol'
import { rutaPanel } from '../../lib/rutaPanel'

export default function PostLoginPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, membership, isLoaded: orgLoaded } = useOrganization()
  const { isLoaded: listLoaded, setActive, userMemberships, userInvitations } = useOrganizationList({
    userMemberships: { infinite: true },
    userInvitations: { infinite: true },
  })
  const triedOrg = useRef(false)
  const triedInvites = useRef(false)
  const [aceptandoInvites, setAceptandoInvites] = useState(false)

  const memberships = userMemberships?.data ?? user?.organizationMemberships ?? []
  const invitesPendientes = (userInvitations?.data ?? []).filter((i) => i.status === 'pending')
  const ready = authLoaded && userLoaded && orgLoaded && listLoaded

  // Si el usuario tiene invitaciones pendientes (p. ej. entró por /entrar sin el link),
  // las aceptamos antes de decidir que no tiene organización.
  useEffect(() => {
    if (!ready || !isSignedIn || triedInvites.current) return
    if (!invitesPendientes.length) return

    triedInvites.current = true
    setAceptandoInvites(true)
    ;(async () => {
      let orgId = null
      for (const inv of invitesPendientes) {
        try {
          await inv.accept()
          orgId = inv.publicOrganizationData?.id || orgId
        } catch (err) {
          console.error('Post-login: no se pudo aceptar invitación', err)
        }
      }
      try {
        await userMemberships?.revalidate?.()
        await userInvitations?.revalidate?.()
      } catch {
        /* ignore */
      }
      if (orgId && setActive) {
        try {
          await setActive({ organization: orgId })
        } catch (err) {
          console.error('Post-login: no se activo org tras invitación', err)
          triedOrg.current = false
        }
      }
      setAceptandoInvites(false)
    })()
  }, [ready, isSignedIn, invitesPendientes, setActive, userMemberships, userInvitations])

  useEffect(() => {
    if (!ready || !isSignedIn || organization || triedOrg.current || aceptandoInvites) return
    if (!memberships.length || !setActive) return

    triedOrg.current = true
    const orgId = memberships[0]?.organization?.id
    if (!orgId) {
      triedOrg.current = false
      return
    }

    setActive({ organization: orgId }).catch((err) => {
      console.error('Post-login: no se activo la organización', err)
      triedOrg.current = false
    })
  }, [ready, isSignedIn, organization, memberships, setActive, aceptandoInvites])

  if (!ready || aceptandoInvites) {
    return (
      <AuthLoading
        mensaje={aceptandoInvites ? 'Aceptando invitación a la empresa…' : AUTH_COPY.loading.acceso}
      />
    )
  }

  if (!isSignedIn) {
    return <Navigate to={RUTAS_AUTH.entrar} replace />
  }

  // Si el rol todavia no se guardo, esperamos a que AuthRolBootstrap lo escriba
  if (peekRolPendiente() && !getRolUsuario(user)) {
    return <AuthLoading mensaje={AUTH_COPY.loading.acceso} />
  }

  if (organization) {
    return <Navigate to={rutaPanel({ isSignedIn: true, membership, organization })} replace />
  }

  if (memberships.length > 0 || invitesPendientes.length > 0) {
    return <AuthLoading mensaje={AUTH_COPY.loading.organizacion} />
  }

  const rol = getRolUsuario(user) || getUltimoRol()
  return <Navigate to={rutaAccesoSinOrg(rol)} replace />
}
