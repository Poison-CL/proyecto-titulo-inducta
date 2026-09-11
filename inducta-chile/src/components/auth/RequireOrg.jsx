import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react'
import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { AUTH_COPY, RUTAS_AUTH } from '../../lib/authCopy'
import { getRolUsuario, getUltimoRol, rutaAccesoSinOrg } from '../../lib/authRol'
import AuthLoading from './AuthLoading'

// Exige Organization activa. Si hay membresias sin org activa, activa la primera.
export default function RequireOrg({ children }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { isLoaded: listLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const activating = useRef(false)

  const memberships = userMemberships?.data ?? user?.organizationMemberships ?? []
  const ready = authLoaded && userLoaded && orgLoaded && listLoaded

  useEffect(() => {
    if (!ready || !isSignedIn || organization || activating.current) return
    if (!memberships.length || !setActive) return

    activating.current = true
    const first = memberships[0]
    const orgId = first?.organization?.id
    if (!orgId) {
      activating.current = false
      return
    }

    setActive({ organization: orgId })
      .catch((err) => console.error('No se pudo activar la organizacion:', err))
      .finally(() => {
        activating.current = false
      })
  }, [ready, isSignedIn, organization, memberships, setActive])

  if (!ready) return <AuthLoading mensaje={AUTH_COPY.loading.organizacion} />

  if (!isSignedIn) {
    return <Navigate to={RUTAS_AUTH.entrar} replace />
  }

  if (!organization && memberships.length > 0) {
    return <AuthLoading mensaje={AUTH_COPY.loading.organizacion} />
  }

  if (!organization) {
    const rol = getRolUsuario(user) || getUltimoRol()
    return <Navigate to={rutaAccesoSinOrg(rol)} replace />
  }

  return children
}
