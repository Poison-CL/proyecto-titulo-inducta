import { esES } from '@clerk/localizations'
import { ROL } from './authRol.js'

// Pasos del login custom: email -> method -> (code | password)
export const PASO = {
  EMAIL: 'email',
  METHOD: 'method',
  CODE: 'code',
  PASSWORD: 'password',
}

export function factorByStrategy(signIn, strategy) {
  return signIn?.supportedFirstFactors?.find((f) => f.strategy === strategy) ?? null
}

// Que paso sigue segun los factores que Clerk reporta para esa cuenta.
// null = la cuenta no tiene metodo de ingreso disponible.
export function pasoSiguiente(signIn) {
  const password = Boolean(factorByStrategy(signIn, 'password'))
  const emailCode = Boolean(factorByStrategy(signIn, 'email_code'))

  if (password && emailCode) return PASO.METHOD
  if (emailCode) return PASO.CODE
  if (password) return PASO.PASSWORD
  return null
}

// Clerk contesta en ingles: la localizacion esES solo alcanza a sus componentes
// prearmados y este login es propio, asi que el mensaje de la API no se traduce solo.
// Estos los escribimos nosotros: los de Clerk hablan de "identificador" y ademas no
// saben que al colaborador lo resuelve su empresa y a la empresa la resolvemos nosotros.
// Son funciones del rol para que la busqueda de abajo sea una sola.
const ERRORES_PROPIOS = {
  form_identifier_not_found: (rol) =>
    rol === ROL.EMPRESA
      ? 'No encontramos una cuenta con ese correo. Si tu empresa todavía no tiene acceso, agenda una demo.'
      : 'No encontramos una cuenta con ese correo. Pide a tu administrador que te agregue.',
  form_param_format_invalid: () => 'Revisa el correo: no parece una dirección válida.',
}

// Traduce un error de Clerk buscando su codigo en el diccionario que ya trae el
// paquete. Nunca devuelve el texto original: si el codigo no esta traducido, o si
// la entrada no es un string (algunas son objetos), usa el fallback de la pantalla.
export function clerkError(err, fallback, rol) {
  const codigo = err?.errors?.[0]?.code
  const propio = ERRORES_PROPIOS[codigo]
  if (propio) return propio(rol)

  const traducido = esES.unstable__errors?.[codigo]
  return typeof traducido === 'string' ? traducido : fallback
}
