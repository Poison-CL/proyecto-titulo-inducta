// Chequeo minimo de la logica de acceso. Correr con: npm run check
import assert from 'node:assert/strict'
import { getRolUsuario, ROL } from './authRol.js'
import { PASO, pasoSiguiente } from './loginPasos.js'

const signIn = (...estrategias) => ({
  supportedFirstFactors: estrategias.map((strategy) => ({ strategy })),
})

// Paso siguiente segun los factores que Clerk reporta
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

// Rol del usuario: publicMetadata manda sobre unsafeMetadata
assert.equal(
  getRolUsuario({ publicMetadata: { rol: 'empresa' }, unsafeMetadata: { rol: 'empleado' } }),
  ROL.EMPRESA,
  'publicMetadata debe ganar porque unsafeMetadata la edita el cliente',
)
assert.equal(getRolUsuario({ unsafeMetadata: { rol: 'empleado' } }), ROL.EMPLEADO)
assert.equal(getRolUsuario({ publicMetadata: { rol: 'admin' } }), null, 'rol invalido se ignora')
assert.equal(getRolUsuario(undefined), null, 'usuario nulo no debe reventar')

console.log('ok: pasoSiguiente y getRolUsuario')
