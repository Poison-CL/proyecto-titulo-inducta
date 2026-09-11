import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react'
import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import AuthLoading from '../components/auth/AuthLoading'
import { AUTH_COPY, RUTAS_AUTH } from '../lib/authCopy'
import {
  getRolUsuario,
  getUltimoRol,
  peekRolPendiente,
  rutaAccesoSinOrg,
} from '../lib/authRol'

// Pantalla puente: decide a donde mandar al usuario apenas termina de iniciar sesion,
// asi nunca se queda pegado en el formulario de login.
export default function PostLoginPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { isLoaded: listLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const tried = useRef(false)

  const memberships = userMemberships?.data ?? user?.organizationMemberships ?? []
  const ready = authLoaded && userLoaded && orgLoaded && listLoaded

  useEffect(() => {
    if (!ready || !isSignedIn || organization || tried.current) return
    if (!memberships.length || !setActive) return

    tried.current = true
    const orgId = memberships[0]?.organization?.id
    if (!orgId) {
      tried.current = false
      return
    }

    setActive({ organization: orgId }).catch((err) => {
      console.error('Post-login: no se activo la organizacion', err)
      tried.current = false
    })
  }, [ready, isSignedIn, organization, memberships, setActive])

  if (!ready) return <AuthLoading mensaje={AUTH_COPY.loading.acceso} />

  if (!isSignedIn) {
    return <Navigate to={RUTAS_AUTH.entrar} replace />
  }

  // Si el rol todavia no se guardo, esperamos a que AuthRolBootstrap lo escriba
  if (peekRolPendiente() && !getRolUsuario(user)) {
    return <AuthLoading mensaje={AUTH_COPY.loading.acceso} />
  }

  if (organization) {
    return <Navigate to={RUTAS_AUTH.dashboard} replace />
  }

  if (memberships.length > 0) {
    return <AuthLoading mensaje={AUTH_COPY.loading.organizacion} />
  }

  const rol = getRolUsuario(user) || getUltimoRol()
  return <Navigate to={rutaAccesoSinOrg(rol)} replace />
}
