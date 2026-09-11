import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import { getUltimoRol, rutaEntrarPorRol } from '../../lib/authRol'
import AuthLoading from './AuthLoading'

export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) return <AuthLoading />

  if (!isSignedIn) {
    const destino = rutaEntrarPorRol(getUltimoRol())
    return <Navigate to={destino} replace state={{ from: location.pathname }} />
  }

  return children
}
