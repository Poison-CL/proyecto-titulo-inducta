// npm run test
import assert from 'node:assert/strict'
import {
  elegirRolAdmin,
  elegirRolTrabajador,
  esAdminEmpresa,
  etiquetaOrgRol,
  getRolUsuario,
  ORG_ROL,
  ROL,
  rolSelectMiembro,
} from '../../src/lib/authRol.js'
import {
  clerkError,
  esCorreoTemporal,
  PASO,
  pasoSiguiente,
  pideCodigoTrasPassword,
} from '../../src/lib/loginPasos.js'
import { rutaPanel } from '../../src/lib/rutaPanel.js'

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
  pasoSiguiente(signIn('password', 'email_code'), 'tmp.x@tmp.inductachile.cl'),
  PASO.PASSWORD,
  'correo temporal salta el código',
)
assert.equal(esCorreoTemporal('tmp.abc@tmp.inductachile.cl'), true)
assert.equal(esCorreoTemporal('juan@empresa.cl'), false)

assert.equal(pideCodigoTrasPassword('needs_second_factor'), true)
assert.equal(pideCodigoTrasPassword('needs_client_trust'), true)
assert.equal(pideCodigoTrasPassword('complete'), false)
assert.equal(pideCodigoTrasPassword('needs_first_factor'), false)

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
  /agende una demo/,
  'a la empresa la derivamos a la demo',
)
assert.match(
  clerkError(noEncontrada, 'fallback', ROL.EMPLEADO),
  /su administrador/,
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

assert.equal(
  elegirRolTrabajador([ORG_ROL.ADMIN_INDUCTA, ORG_ROL.TRABAJADOR, ORG_ROL.MIEMBRO]),
  ORG_ROL.TRABAJADOR,
  'preferimos org:trabajador sobre org:member',
)
assert.equal(
  elegirRolTrabajador([ORG_ROL.ADMIN, ORG_ROL.MIEMBRO]),
  ORG_ROL.MIEMBRO,
  'si no hay trabajador custom, usamos org:member',
)
assert.equal(
  elegirRolAdmin([ORG_ROL.ADMIN_INDUCTA, ORG_ROL.TRABAJADOR], ORG_ROL.ADMIN_INDUCTA),
  ORG_ROL.ADMIN_INDUCTA,
)
assert.equal(esAdminEmpresa({ role: ORG_ROL.TRABAJADOR }), false)
assert.equal(esAdminEmpresa({ role: ORG_ROL.MIEMBRO }), false)
assert.equal(etiquetaOrgRol(ORG_ROL.TRABAJADOR), 'Trabajador')
assert.equal(
  rolSelectMiembro({ role: ORG_ROL.TRABAJADOR }, ORG_ROL.ADMIN_INDUCTA, ORG_ROL.TRABAJADOR),
  ORG_ROL.TRABAJADOR,
)
assert.equal(
  rutaPanel({
    isSignedIn: true,
    membership: { role: ORG_ROL.TRABAJADOR },
    organization: { id: 'org_empresa' },
  }),
  '/empleado',
  'trabajador de empresa va a /empleado',
)
assert.equal(
  rutaPanel({
    isSignedIn: true,
    membership: { role: ORG_ROL.ADMIN_INDUCTA },
    organization: { id: 'org_empresa' },
  }),
  '/dashboard',
  'admin de empresa va a /dashboard',
)

console.log('ok: pasoSiguiente, getRolUsuario, clerkError y roles org')
