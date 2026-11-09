import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AUTH_COPY, RUTAS_AUTH } from '../../lib/authCopy'
import { getRolUsuario, getUltimoRol, rutaAccesoSinOrg } from '../../lib/authRol'
import AuthLoading from './AuthLoading'

export default function RequireOrg({ children }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { isLoaded: listLoaded, setActive, userMemberships, userInvitations } = useOrganizationList({
    userMemberships: { infinite: true },
    userInvitations: { infinite: true },
  })
  const activating = useRef(false)
  const accepting = useRef(false)
  const [aceptando, setAceptando] = useState(false)

  const memberships = userMemberships?.data ?? user?.organizationMemberships ?? []
  const invitesPendientes = (userInvitations?.data ?? []).filter((i) => i.status === 'pending')
  const ready = authLoaded && userLoaded && orgLoaded && listLoaded

  useEffect(() => {
    if (!ready || !isSignedIn || organization || accepting.current) return
    if (!invitesPendientes.length) return

    accepting.current = true
    setAceptando(true)
    ;(async () => {
      let orgId = null
      for (const inv of invitesPendientes) {
        try {
          await inv.accept()
          orgId = inv.publicOrganizationData?.id || orgId
        } catch (err) {
          console.error('RequireOrg: no se pudo aceptar invitación', err)
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
          console.error('RequireOrg: no se activo org tras invitación', err)
        }
      }
      accepting.current = false
      setAceptando(false)
    })()
  }, [ready, isSignedIn, organization, invitesPendientes, setActive, userMemberships, userInvitations])

  useEffect(() => {
    if (!ready || !isSignedIn || organization || activating.current || aceptando) return
    if (!memberships.length || !setActive) return

    activating.current = true
    const first = memberships[0]
    const orgId = first?.organization?.id
    if (!orgId) {
      activating.current = false
      return
    }

    setActive({ organization: orgId })
      .catch((err) => console.error('No se pudo activar la organización:', err))
      .finally(() => {
        activating.current = false
      })
  }, [ready, isSignedIn, organization, memberships, setActive, aceptando])

  if (!ready || aceptando) {
    return (
      <AuthLoading
        mensaje={aceptando ? 'Aceptando invitación a la empresa…' : AUTH_COPY.loading.organizacion}
      />
    )
  }

  if (!isSignedIn) {
    return <Navigate to={RUTAS_AUTH.entrar} replace />
  }

  if (!organization && (memberships.length > 0 || invitesPendientes.length > 0)) {
    return <AuthLoading mensaje={AUTH_COPY.loading.organizacion} />
  }

  if (!organization) {
    const rol = getRolUsuario(user) || getUltimoRol()
    return <Navigate to={rutaAccesoSinOrg(rol)} replace />
  }

  return children
}
