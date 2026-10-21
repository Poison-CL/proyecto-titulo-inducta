import assert from 'node:assert/strict'
import {
  accionLimpieza,
  DIA_MS,
  MENSAJE_DESHABILITADA,
  SEGUNDOS_MODAL_TEMPORAL,
} from '../../src/lib/cuentaTemporalLifecycle.js'
import { CUENTA, puedeGestionarEquipo } from '../../src/lib/cuentaEstado.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const ahora = Date.parse('2026-10-16T12:00:00.000Z')

// --- lifecycle día 1 / día 2 ---
assert.equal(
  accionLimpieza(
    { cuenta_estado: 'temporal', cuenta_temporal_creada_en: new Date(ahora - DIA_MS + 1000).toISOString() },
    ahora,
  ),
  'ninguna',
  'aún no cumple 24h → no deshabilitar',
)
assert.equal(
  accionLimpieza(
    { cuenta_estado: 'temporal', cuenta_temporal_creada_en: new Date(ahora - DIA_MS).toISOString() },
    ahora,
  ),
  'deshabilitar',
  '≥24h temporal → deshabilitar',
)
assert.equal(
  accionLimpieza(
    { cuenta_estado: 'pendiente_verificacion', cuenta_temporal_creada_en: new Date(ahora - DIA_MS * 2).toISOString() },
    ahora,
  ),
  'deshabilitar',
)
assert.equal(
  accionLimpieza(
    {
      cuenta_estado: 'deshabilitada',
      cuenta_deshabilitada_en: new Date(ahora - DIA_MS + 1000).toISOString(),
    },
    ahora,
  ),
  'ninguna',
  'deshabilitada <24h → no borrar',
)
assert.equal(
  accionLimpieza(
    {
      cuenta_estado: 'deshabilitada',
      cuenta_deshabilitada_en: new Date(ahora - DIA_MS).toISOString(),
    },
    ahora,
  ),
  'borrar',
  'deshabilitada ≥24h → borrar',
)
assert.equal(accionLimpieza({ cuenta_estado: 'verificada' }, ahora), 'ninguna')

// --- bloqueo equipo ---
assert.equal(puedeGestionarEquipo(CUENTA.TEMPORAL), false)
assert.equal(puedeGestionarEquipo(CUENTA.PENDIENTE), false)
assert.equal(puedeGestionarEquipo(CUENTA.VERIFICADA), true)

// --- modal 30s y mensaje deshabilitada en código fuente ---
assert.equal(SEGUNDOS_MODAL_TEMPORAL, 30)
const modalSrc = fs.readFileSync(path.join(root, 'src/features/cuenta/ModalCuentaTemporal.jsx'), 'utf8')
assert.match(modalSrc, /SEGUNDOS_BLOQUEO\s*=\s*SEGUNDOS_MODAL_TEMPORAL/)
assert.match(modalSrc, /closeOnOverlayClick=\{puedeCerrar\}/)
assert.match(modalSrc, /closeOnEsc=\{puedeCerrar\}/)
assert.equal(SEGUNDOS_MODAL_TEMPORAL, 30)

const deshabSrc = fs.readFileSync(path.join(root, 'src/pages/CuentaDeshabilitadaPage.jsx'), 'utf8')
assert.ok(
  deshabSrc.includes('deshabilitada por no cambiar sus datos') || deshabSrc.includes(MENSAJE_DESHABILITADA.slice(0, 40)),
  'pantalla deshabilitada con mensaje de soporte',
)
assert.match(deshabSrc, /soporte@inducta\.cl/)

const equipoSrc = fs.readFileSync(path.join(root, 'src/pages/app/EquipoPage.jsx'), 'utf8')
assert.match(equipoSrc, /bloqueoTemporal/)
assert.match(equipoSrc, /complete sus datos reales/)

const adminSrc = fs.readFileSync(path.join(root, 'src/layouts/AdminLayout.jsx'), 'utf8')
assert.match(adminSrc, /ModalCuentaTemporal/)
assert.match(adminSrc, /cuenta-deshabilitada/)

const tbkSrc = fs.readFileSync(path.join(root, 'supabase/functions/tbk-confirmar/index.ts'), 'utf8')
assert.match(tbkSrc, /provisionar-cuenta-temporal/)
assert.match(tbkSrc, /cuenta=temporal/)

const provSrc = fs.readFileSync(path.join(root, 'supabase/functions/provisionar-cuenta-temporal/index.ts'), 'utf8')
assert.match(provSrc, /cuenta_estado:\s*'temporal'/)
assert.match(provSrc, /enviarResend|api\.resend\.com/)
assert.match(provSrc, /Credenciales temporales|correo de acceso/i)

const limSrc = fs.readFileSync(path.join(root, 'supabase/functions/limpiar-cuentas-temporales/index.ts'), 'utf8')
assert.match(limSrc, /deshabilitada/)
assert.match(limSrc, /\/ban/)
assert.match(limSrc, /method: 'DELETE'/)

console.log('cuentaTemporalLifecycle.test.js ok')
