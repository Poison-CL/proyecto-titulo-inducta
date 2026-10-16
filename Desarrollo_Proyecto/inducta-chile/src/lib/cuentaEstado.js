export const CUENTA = {
  TEMPORAL: 'temporal',
  PENDIENTE: 'pendiente_verificacion',
  VERIFICADA: 'verificada',
  DESHABILITADA: 'deshabilitada',
}

export function esCuentaTemporal(estado) {
  return estado === CUENTA.TEMPORAL || estado === CUENTA.PENDIENTE
}

export function esCuentaDeshabilitada(estado) {
  return estado === CUENTA.DESHABILITADA
}

export function puedeGestionarEquipo(estado) {
  return !estado || estado === CUENTA.VERIFICADA
}

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  if (puedeGestionarEquipo(CUENTA.TEMPORAL) !== false) throw new Error('cuenta: bloqueo temporal')
  if (puedeGestionarEquipo(CUENTA.VERIFICADA) !== true) throw new Error('cuenta: verificada ok')
}
