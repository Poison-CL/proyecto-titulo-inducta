import { Button } from '@chakra-ui/react'
import { useAuth, useOrganization } from '@clerk/clerk-react'
import { Link as RouterLink } from 'react-router-dom'
import { rutaPanel } from '../../lib/rutaPanel'

/** Enlace al panel correcto según sesión y org (empresa / admin plataforma / login). */
export default function LinkAlPanel({ children = 'Ir al panel', as: Comp = Button, ...props }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { organization, membership } = useOrganization()
  const to = rutaPanel({ isSignedIn: isLoaded && isSignedIn, membership, organization })

  return (
    <Comp as={RouterLink} to={to} {...props}>
      {children}
    </Comp>
  )
}
