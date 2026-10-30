import { useOrganization } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { esAdminEmpresa } from '../../lib/authRol'
import { esAdminPlataforma, esOrgInducta } from '../../lib/orgInducta'
import AuthLoading from './AuthLoading'

/**
 * Guard para rutas de empleado (/empleado/*).
 * - Admin de empresa    → redirige a /dashboard
 * - Admin de plataforma → redirige a /admin
 * - Org Inducta sin rol → redirige a /
 * - Empleado/miembro    → deja pasar
 */
export default function RequireEmpleado({ children }) {
  const { membership, organization, isLoaded } = useOrganization()

  if (!isLoaded) return <AuthLoading />

  if (esAdminPlataforma(membership, organization)) {
    return <Navigate to="/admin" replace />
  }

  if (esOrgInducta(organization) && !esAdminPlataforma(membership, organization)) {
    return <Navigate to="/" replace />
  }

  if (esAdminEmpresa(membership)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
