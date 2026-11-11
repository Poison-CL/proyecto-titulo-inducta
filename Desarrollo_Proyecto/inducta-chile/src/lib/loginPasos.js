import { esES } from '@clerk/localizations'
import { ROL } from './authRol.js'

export const PASO = {
  EMAIL: 'email',
  METHOD: 'method',
  CODE: 'code',
  PASSWORD: 'password',
}

export function factorByStrategy(signIn, strategy) {
  return signIn?.supportedFirstFactors?.find((f) => f.strategy === strategy) ?? null
}

/** Correos @tmp.inductachile.cl no tienen bandeja: no sirven para códigos. */
export function esCorreoTemporal(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .endsWith('@tmp.inductachile.cl')
}

export function pasoSiguiente(signIn, email = '') {
  const password = Boolean(factorByStrategy(signIn, 'password'))
  const emailCode = Boolean(factorByStrategy(signIn, 'email_code'))
  // ponytail: temporales solo contraseña (el código nunca llega)
  if (esCorreoTemporal(email) && password) return PASO.PASSWORD

  if (password && emailCode) return PASO.METHOD
  if (emailCode) return PASO.CODE
  if (password) return PASO.PASSWORD
  return null
}

/** Tras password ok, Clerk pide código (MFA o Device Trust en dispositivo nuevo). */
export function pideCodigoTrasPassword(status) {
  return status === 'needs_second_factor' || status === 'needs_client_trust'
}

// Clerk manda inglés; esES no cubre este login. El copy depende del rol.
const ERRORES_PROPIOS = {
  form_identifier_not_found: (rol) =>
    rol === ROL.EMPRESA
      ? 'No encontramos una cuenta con ese correo. Si su empresa todavía no tiene acceso, agende una demo.'
      : 'No encontramos una cuenta con ese correo. Pida a su administrador que lo agregue.',
  form_param_format_invalid: () => 'Revise el correo: no parece una dirección válida.',
}

// Nunca devolver el inglés de Clerk: si no hay traducción, usamos el fallback.
export function clerkError(err, fallback, rol) {
  const codigo = err?.errors?.[0]?.code
  const propio = ERRORES_PROPIOS[codigo]
  if (propio) return propio(rol)

  const traducido = esES.unstable__errors?.[codigo]
  return typeof traducido === 'string' ? traducido : fallback
}
