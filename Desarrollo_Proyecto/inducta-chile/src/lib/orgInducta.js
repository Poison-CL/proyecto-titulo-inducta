import { esAdminEmpresa, ORG_ROL } from './authRol.js'

/** Organización plataforma Inducta (soporte / administración global). */
export const ORG_INDUCTA_ID = 'org_3Kmnph0KjXr140vNE2SdpxPMYk9'

export function esOrgInducta(organization) {
  return organization?.id === ORG_INDUCTA_ID
}

/** Solo rol org:administrador_inducta en la org Inducta. */
export function esAdminPlataforma(membership, organization) {
  if (!esOrgInducta(organization) || !membership) return false
  const role = membership.role ?? ''
  return role === ORG_ROL.ADMIN_INDUCTA || role === 'org:administrador_inducta'
}

/** Trabajador de la org Inducta: no debe ver el panel de soporte. */
export function esTrabajadorPlataforma(membership, organization) {
  if (!esOrgInducta(organization)) return false
  if (esAdminEmpresa(membership)) return false
  const role = membership?.role ?? ''
  return (
    role === ORG_ROL.TRABAJADOR ||
    role === ORG_ROL.MIEMBRO ||
    /trabajador|member|empleado/i.test(role)
  )
}
