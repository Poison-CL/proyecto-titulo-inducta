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
