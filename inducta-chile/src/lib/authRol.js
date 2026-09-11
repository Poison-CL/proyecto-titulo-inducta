// La extension .js es para que `npm run check` pueda correr esto en Node
import { RUTAS_AUTH } from './authCopy.js'

// Rol de ingreso (empresa | empleado)
export const ROL = {
  EMPRESA: 'empresa',
  EMPLEADO: 'empleado',
}

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

export function rutaEntrarPorRol(rol) {
  if (rol === ROL.EMPRESA) return RUTAS_AUTH.entrarEmpresa
  if (rol === ROL.EMPLEADO) return RUTAS_AUTH.entrarEmpleado
  return RUTAS_AUTH.entrar
}

export function rutaAccesoSinOrg(rol) {
  if (rol === ROL.EMPLEADO) return RUTAS_AUTH.sinMembresia
  return RUTAS_AUTH.sinEmpresa
}
