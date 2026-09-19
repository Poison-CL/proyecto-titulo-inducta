export function limpiaRut(rut) {
  return String(rut || '')
    .replace(/[.\s-]/g, '')
    .toUpperCase()
}

function dvEsperado(cuerpo) {
  let suma = 0
  let mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const r = 11 - (suma % 11)
  if (r === 11) return '0'
  if (r === 10) return 'K'
  return String(r)
}

function esSecuencia(s) {
  return '0123456789'.includes(s) || '9876543210'.includes(s)
}

export function rutValido(rut) {
  const limpio = limpiaRut(rut)
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false
  const cuerpo = limpio.slice(0, -1)
  if (/^(\d)\1+$/.test(cuerpo)) return false
  if (esSecuencia(cuerpo)) return false
  return dvEsperado(cuerpo) === limpio.slice(-1)
}

export function formateaRut(rut) {
  const limpio = limpiaRut(rut)
  if (limpio.length < 2) return limpio
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

export function limpiaTel(tel) {
  return String(tel || '').replace(/\D/g, '')
}

const FIJO_AREA = /^(32|33|34|35|41|42|43|45|51|52|53|55|57|58|61|63|64|65|67|71|72|73|75)\d{7}$/

export function telefonoValido(tel) {
  let d = limpiaTel(tel)
  if (d.startsWith('56')) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  if (d.length !== 9) return false
  if (/^(\d)\1+$/.test(d) || esSecuencia(d) || esSecuencia(d.slice(1))) return false
  if (d.startsWith('9')) return /^9[3-9]\d{7}$/.test(d)
  if (d.startsWith('2')) return /^2[2-9]\d{7}$/.test(d)
  return FIJO_AREA.test(d)
}

export function mascaraTel(tel) {
  let d = limpiaTel(tel)
  if (d.startsWith('56')) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  d = d.slice(0, 9)
  if (d.length <= 1) return d
  if (d.length <= 5) return `${d[0]} ${d.slice(1)}`
  return `${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`
}

export function formateaTel(tel) {
  const nacional = mascaraTel(tel)
  return nacional.length ? `+56 ${nacional}` : ''
}

if (import.meta.env.DEV) {
  console.assert(rutValido('76.355.934-3'), 'RUT válido rechazado')
  console.assert(!rutValido('11.111.111-1'), 'RUT de prueba aceptado')
  console.assert(!rutValido('12.345.678-5'), 'RUT secuencial aceptado')
  console.assert(!rutValido('76.355.934-0'), 'DV incorrecto aceptado')
  console.assert(telefonoValido('+56 9 6123 4587'), 'móvil válido rechazado')
  console.assert(!telefonoValido('+56 9 1234 5678'), 'móvil falso aceptado')
  console.assert(!telefonoValido('111111111'), 'teléfono repetido aceptado')
}
