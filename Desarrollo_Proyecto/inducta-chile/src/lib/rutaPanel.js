import { esAdminEmpresa } from './authRol'
import { esAdminPlataforma, esOrgInducta, esTrabajadorPlataforma } from './orgInducta'

/** Destino correcto de "Ir al panel" / Docs → Panel. */
export function rutaPanel({ isSignedIn, membership, organization }) {
  if (!isSignedIn) return '/entrar?rol=empresa'
  if (esAdminPlataforma(membership, organization)) return '/admin'
  // Org plataforma sin panel empresa: docs (no home vacía)
  if (esTrabajadorPlataforma(membership, organization) || esOrgInducta(organization)) return '/recursos'
  // Admin de empresa → dashboard de empresa
  if (esAdminEmpresa(membership)) return '/dashboard'
  // Empleado/miembro → dashboard de empleado
  return '/empleado'
}
