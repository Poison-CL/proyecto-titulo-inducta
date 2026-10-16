import { useOrganization } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { esAdminPlataforma, esOrgInducta, esTrabajadorPlataforma } from '../../lib/orgInducta'
import AuthLoading from './AuthLoading'

/** Solo admin de la org Inducta. Trabajadores → inicio. Otras orgs → dashboard empresa. */
export default function RequireAdminPlataforma({ children }) {
  const { organization, membership, isLoaded } = useOrganization()

  if (!isLoaded) return <AuthLoading mensaje="Cargando panel…" />

  if (esTrabajadorPlataforma(membership, organization)) {
    return <Navigate to="/" replace />
  }

  if (!esOrgInducta(organization) || !esAdminPlataforma(membership, organization)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
