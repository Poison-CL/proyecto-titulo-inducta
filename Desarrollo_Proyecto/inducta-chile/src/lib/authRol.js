// La extension .js es para que `npm run check` pueda correr esto en Node
import { RUTAS_AUTH } from './authCopy.js'

export const ROL = {
  EMPRESA: 'empresa',
  EMPLEADO: 'empleado',
}

// Roles de Clerk Organization. En Inducta el admin real es el rol personalizado
// «Administrador Inducta» (no el org:admin por defecto).
export const ORG_ROL = {
  ADMIN: 'org:admin',
  ADMIN_INDUCTA: 'org:administrador_inducta',
  MIEMBRO: 'org:member',
  TRABAJADOR: 'org:trabajador',
}

// Clerk a veces usa claves viejas (admin / basic_member) según la instancia.
const ROLES_ADMIN = new Set([ORG_ROL.ADMIN, ORG_ROL.ADMIN_INDUCTA, 'admin'])
const ROLES_MIEMBRO = new Set([
  ORG_ROL.MIEMBRO,
  ORG_ROL.TRABAJADOR,
  'member',
  'basic_member',
  'org:basic_member',
])

const PERM_GESTIONAR_EQUIPO = 'org:sys_memberships:manage'

const KEY_PENDIENTE = 'inducta_rol_pendiente'
const KEY_ULTIMO = 'inducta_ultimo_rol'

export function isRolValido(rol) {
  return rol === ROL.EMPRESA || rol === ROL.EMPLEADO
}

export function setRolPendiente(rol) {
  if (!isRolValido(rol)) return
  sessionStorage.setItem(KEY_PENDIENTE, rol)
  sessionStorage.setItem(KEY_ULTIMO, rol)
}

export function peekRolPendiente() {
  return sessionStorage.getItem(KEY_PENDIENTE)
}

export function consumeRolPendiente() {
  const rol = sessionStorage.getItem(KEY_PENDIENTE)
  sessionStorage.removeItem(KEY_PENDIENTE)
  return rol
}

export function getUltimoRol() {
  const rol = sessionStorage.getItem(KEY_ULTIMO)
  return isRolValido(rol) ? rol : null
}

// Preferimos publicMetadata si existe; si no, unsafeMetadata (cliente)
export function getRolUsuario(user) {
  const publico = user?.publicMetadata?.rol
  if (isRolValido(publico)) return publico
  const inseguro = user?.unsafeMetadata?.rol
  return isRolValido(inseguro) ? inseguro : null
}

export function etiquetaRol(rol) {
  if (rol === ROL.EMPRESA) return 'Empresa'
  if (rol === ROL.EMPLEADO) return 'Empleado'
  return 'Usuario'
}

export function esRolAdminKey(role) {
  if (!role) return false
  if (ROLES_ADMIN.has(role)) return true
  return /administrador/i.test(role)
}

export function esAdminEmpresa(membership) {
  if (!membership) return false
  const role = membership.role ?? ''
  if (esRolAdminKey(role)) return true
  // Fuente de verdad: permiso de Clerk para gestionar membresías
  const perms = membership.permissions
  if (Array.isArray(perms) && perms.includes(PERM_GESTIONAR_EQUIPO)) return true
  return false
}

export function etiquetaOrgRol(role) {
  if (esRolAdminKey(role)) return 'Administrador'
  if (ROLES_MIEMBRO.has(role) || /trabajador|empleado|member/i.test(role ?? '')) return 'Trabajador'
  return role ? String(role) : 'Miembro'
}

/**
 * Elige la clave Clerk de trabajador según roles disponibles en la instancia.
 * Preferimos org:trabajador (custom Inducta) antes que org:member.
 */
export function elegirRolTrabajador(roleKeys = []) {
  const keys = (roleKeys || []).filter(Boolean)
  const preferidos = [
    ORG_ROL.TRABAJADOR,
    ORG_ROL.MIEMBRO,
    'org:basic_member',
    'basic_member',
    'member',
  ]
  for (const p of preferidos) {
    if (keys.includes(p)) return p
  }
  const noAdmin = keys.find((k) => !esRolAdminKey(k))
  return noAdmin || ORG_ROL.TRABAJADOR
}

/**
 * Elige la clave Clerk de administrador según roles disponibles.
 * Prioriza el rol actual del invitante si es admin.
 */
export function elegirRolAdmin(roleKeys = [], membershipRole) {
  const keys = (roleKeys || []).filter(Boolean)
  if (membershipRole && esRolAdminKey(membershipRole) && (!keys.length || keys.includes(membershipRole))) {
    return membershipRole
  }
  const preferidos = [ORG_ROL.ADMIN_INDUCTA, ORG_ROL.ADMIN, 'admin']
  for (const p of preferidos) {
    if (!keys.length || keys.includes(p)) return p
  }
  const adminish = keys.find((k) => esRolAdminKey(k))
  return adminish || ORG_ROL.ADMIN_INDUCTA
}

/** Clave Clerk a usar al invitar administradores (prioriza el rol actual del admin). */
export function rolInvitarAdmin(membership, roleKeys = []) {
  return elegirRolAdmin(roleKeys, membership?.role)
}

/** Normaliza el value del <select> de un miembro al par admin/trabajador de la UI. */
export function rolSelectMiembro(membership, rolAdmin, rolTrabajador) {
  if (esAdminEmpresa(membership)) return rolAdmin
  return rolTrabajador
}

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  // ponytail: assert mínimo para no romper la jerarquía sin darnos cuenta
  if (esAdminEmpresa({ role: ORG_ROL.ADMIN }) !== true) throw new Error('authRol: admin')
  if (esAdminEmpresa({ role: ORG_ROL.ADMIN_INDUCTA }) !== true) throw new Error('authRol: admin inducta')
  if (esAdminEmpresa({ role: 'admin' }) !== true) throw new Error('authRol: admin legacy')
  if (esAdminEmpresa({ permissions: [PERM_GESTIONAR_EQUIPO] }) !== true) throw new Error('authRol: permiso')
  if (esAdminEmpresa({ role: ORG_ROL.MIEMBRO }) !== false) throw new Error('authRol: miembro')
  if (esAdminEmpresa({ role: ORG_ROL.TRABAJADOR }) !== false) throw new Error('authRol: trabajador')
  if (etiquetaOrgRol(ORG_ROL.ADMIN_INDUCTA) !== 'Administrador') throw new Error('authRol: etiqueta')
  if (etiquetaOrgRol(ORG_ROL.TRABAJADOR) !== 'Trabajador') throw new Error('authRol: etiqueta trabajador')
  if (elegirRolTrabajador([ORG_ROL.ADMIN_INDUCTA, ORG_ROL.TRABAJADOR]) !== ORG_ROL.TRABAJADOR) {
    throw new Error('authRol: elegir trabajador')
  }
  if (elegirRolTrabajador([ORG_ROL.ADMIN, ORG_ROL.MIEMBRO]) !== ORG_ROL.MIEMBRO) {
    throw new Error('authRol: elegir member')
  }
  if (elegirRolAdmin([ORG_ROL.ADMIN_INDUCTA, ORG_ROL.TRABAJADOR]) !== ORG_ROL.ADMIN_INDUCTA) {
    throw new Error('authRol: elegir admin')
  }
}

export function rutaEntrarPorRol(rol) {
  if (rol === ROL.EMPRESA) return RUTAS_AUTH.entrarEmpresa
  if (rol === ROL.EMPLEADO) return RUTAS_AUTH.entrarEmpleado
  return RUTAS_AUTH.entrar
}

export function rutaAccesoSinOrg(rol) {
  if (rol === ROL.EMPLEADO) return RUTAS_AUTH.sinMembresia
  return RUTAS_AUTH.sinEmpresa
}
