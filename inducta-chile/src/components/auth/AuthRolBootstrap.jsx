import { useUser } from '@clerk/clerk-react'
import { useEffect, useRef } from 'react'
import {
  consumeRolPendiente,
  getRolUsuario,
  isRolValido,
  peekRolPendiente,
} from '../../lib/authRol'

// Guarda el rol elegido en unsafeMetadata apenas el usuario entra. Es una solucion
// temporal: lo correcto es escribirlo en publicMetadata desde el backend.
export default function AuthRolBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser()
  const busy = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || busy.current) return

    const pendiente = peekRolPendiente()
    if (!isRolValido(pendiente)) return
    if (getRolUsuario(user) === pendiente) {
      consumeRolPendiente()
      return
    }

    busy.current = true
    user
      .update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          rol: pendiente,
        },
      })
      .then(() => {
        consumeRolPendiente()
        busy.current = false
      })
      .catch((err) => {
        console.error('No se pudo guardar el rol en Clerk:', err)
        busy.current = false
      })
  }, [isLoaded, isSignedIn, user])

  return null
}
