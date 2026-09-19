// npm run check
import assert from 'node:assert/strict'
import { getRolUsuario, ROL } from './authRol.js'
import { clerkError, PASO, pasoSiguiente } from './loginPasos.js'

const signIn = (...estrategias) => ({
  supportedFirstFactors: estrategias.map((strategy) => ({ strategy })),
})

assert.equal(pasoSiguiente(signIn('password', 'email_code')), PASO.METHOD)
assert.equal(pasoSiguiente(signIn('email_code')), PASO.CODE)
assert.equal(pasoSiguiente(signIn('password')), PASO.PASSWORD)
assert.equal(pasoSiguiente(signIn()), null, 'sin factores no hay paso siguiente')
assert.equal(pasoSiguiente(null), null, 'signIn nulo no debe reventar')
assert.equal(
  pasoSiguiente(signIn('oauth_google')),
  null,
  'una estrategia que no manejamos no habilita ingreso',
)

assert.equal(
  getRolUsuario({ publicMetadata: { rol: 'empresa' }, unsafeMetadata: { rol: 'empleado' } }),
  ROL.EMPRESA,
  'publicMetadata debe ganar porque unsafeMetadata la edita el cliente',
)
assert.equal(getRolUsuario({ unsafeMetadata: { rol: 'empleado' } }), ROL.EMPLEADO)
assert.equal(getRolUsuario({ publicMetadata: { rol: 'admin' } }), null, 'rol invalido se ignora')
assert.equal(getRolUsuario(undefined), null, 'usuario nulo no debe reventar')

const errorClerk = (code) => ({ errors: [{ code, message: "Couldn't find your account." }] })

const noEncontrada = errorClerk('form_identifier_not_found')

assert.match(
  clerkError(noEncontrada, 'fallback', ROL.EMPRESA),
  /agenda una demo/,
  'a la empresa la derivamos a la demo',
)
assert.match(
  clerkError(noEncontrada, 'fallback', ROL.EMPLEADO),
  /tu administrador/,
  'al colaborador lo resuelve su empresa, nunca nosotros',
)
assert.doesNotMatch(
  clerkError(noEncontrada, 'fallback', ROL.EMPLEADO),
  /demo|Inducta/,
  'al colaborador no se le ofrece nada nuestro',
)
assert.equal(
  clerkError(errorClerk('form_password_incorrect'), 'fallback', ROL.EMPRESA),
  'Contraseña incorrecta.',
  'los codigos que no reescribimos salen del diccionario esES',
)
assert.equal(
  clerkError(errorClerk('codigo_que_no_existe'), 'fallback', ROL.EMPRESA),
  'fallback',
  'un codigo desconocido cae en el texto de la pantalla',
)
assert.equal(clerkError(errorClerk('passwordComplexity'), 'fallback', ROL.EMPRESA), 'fallback')
assert.equal(clerkError(undefined, 'fallback', ROL.EMPRESA), 'fallback', 'error nulo no revienta')

// La red de seguridad: ningun camino puede devolver el texto en ingles de Clerk
for (const code of ['form_identifier_not_found', 'form_code_incorrect', 'otro', undefined]) {
  for (const rol of [ROL.EMPRESA, ROL.EMPLEADO]) {
    assert.doesNotMatch(clerkError(errorClerk(code), 'texto nuestro', rol), /Couldn't find/)
  }
}

console.log('ok: pasoSiguiente, getRolUsuario y clerkError')
