/** Pure helpers for temp-account expiry (day 1 disable, day 2 delete). */

export const DIA_MS = 24 * 60 * 60 * 1000

/**
 * @param {{ cuenta_estado: string, cuenta_temporal_creada_en?: string|null, cuenta_deshabilitada_en?: string|null }} empresa
 * @param {number} [ahora]
 * @returns {'ninguna'|'deshabilitar'|'borrar'}
 */
export function accionLimpieza(empresa, ahora = Date.now()) {
  const estado = empresa?.cuenta_estado
  if (estado === 'temporal' || estado === 'pendiente_verificacion') {
    const creada = empresa.cuenta_temporal_creada_en ? new Date(empresa.cuenta_temporal_creada_en).getTime() : 0
    if (creada && ahora - creada >= DIA_MS) return 'deshabilitar'
    return 'ninguna'
  }
  if (estado === 'deshabilitada') {
    const desde = empresa.cuenta_deshabilitada_en ? new Date(empresa.cuenta_deshabilitada_en).getTime() : 0
    if (desde && ahora - desde >= DIA_MS) return 'borrar'
    return 'ninguna'
  }
  return 'ninguna'
}

export const MENSAJE_DESHABILITADA =
  'Su cuenta fue deshabilitada por no cambiar sus datos. Comuníquese con soporte'

export const SEGUNDOS_MODAL_TEMPORAL = 30
