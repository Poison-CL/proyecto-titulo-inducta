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

export function pasoSiguiente(signIn) {
  const password = Boolean(factorByStrategy(signIn, 'password'))
  const emailCode = Boolean(factorByStrategy(signIn, 'email_code'))

  if (password && emailCode) return PASO.METHOD
  if (emailCode) return PASO.CODE
  if (password) return PASO.PASSWORD
  return null
}

// Clerk manda inglés; esES no cubre este login. El copy depende del rol.
const ERRORES_PROPIOS = {
  form_identifier_not_found: (rol) =>
    rol === ROL.EMPRESA
      ? 'No encontramos una cuenta con ese correo. Si tu empresa todavía no tiene acceso, agenda una demo.'
      : 'No encontramos una cuenta con ese correo. Pide a tu administrador que te agregue.',
  form_param_format_invalid: () => 'Revisa el correo: no parece una dirección válida.',
}

// Nunca devolver el inglés de Clerk: si no hay traducción, usamos el fallback.
export function clerkError(err, fallback, rol) {
  const codigo = err?.errors?.[0]?.code
  const propio = ERRORES_PROPIOS[codigo]
  if (propio) return propio(rol)

  const traducido = esES.unstable__errors?.[codigo]
  return typeof traducido === 'string' ? traducido : fallback
}
