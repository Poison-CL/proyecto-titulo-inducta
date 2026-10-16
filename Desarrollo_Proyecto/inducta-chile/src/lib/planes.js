export const PLANES = [
  {
    id: 'demo',
    nombre: 'Demostración',
    para: 'Para probar la plataforma con un equipo pequeño.',
    cta: 'Agendar demostración',
    contratable: false,
    ufMensual: 0,
    ufAnual: 0,
    maxColaboradores: 5,
    features: [
      { ok: true, text: 'Hasta 5 colaboradores' },
      { ok: true, text: 'Una evaluación propia' },
      { ok: true, text: 'Certificación marca Inducta' },
      { ok: false, text: 'Identidad visual corporativa' },
      { ok: false, text: 'Dashboard analítico por área' },
      { ok: false, text: 'Acompañamiento ejecutivo' },
    ],
  },
  {
    id: 'basico',
    nombre: 'Empresa Básico',
    para: 'Para empresas de hasta 50 colaboradores.',
    cta: 'Contratar',
    contratable: true,
    ufMensual: 1.5,
    ufAnual: 15,
    maxColaboradores: 50,
    features: [
      { ok: true, text: 'Hasta 50 colaboradores' },
      { ok: true, text: 'Hasta 5 evaluaciones' },
      { ok: true, text: 'Identidad visual corporativa' },
      { ok: true, text: 'Dashboard por colaborador' },
      { ok: false, text: 'Dashboard analítico por área' },
      { ok: false, text: 'Acompañamiento ejecutivo' },
    ],
  },
  {
    id: 'plus',
    nombre: 'Empresa Plus',
    para: 'Para empresas con varias áreas, hasta 250 colaboradores.',
    cta: 'Contratar',
    contratable: true,
    destacado: true,
    ufMensual: 4.5,
    ufAnual: 45,
    maxColaboradores: 250,
    features: [
      { ok: true, text: 'Hasta 250 colaboradores' },
      { ok: true, text: 'Evaluaciones sin límite' },
      { ok: true, text: 'Documentación 100% a medida' },
      { ok: true, text: 'Dashboard analítico por área' },
      { ok: true, text: 'Mesa de ayuda prioritaria' },
      { ok: false, text: 'Acompañamiento ejecutivo' },
    ],
  },
  {
    id: 'plusplus',
    nombre: 'Empresa Plus+',
    para: 'Para organizaciones grandes, sin límite de colaboradores.',
    cta: 'Contratar',
    contratable: true,
    ufMensual: 10,
    ufAnual: 100,
    maxColaboradores: null,
    features: [
      { ok: true, text: 'Colaboradores sin límite' },
      { ok: true, text: 'Evaluaciones sin límite' },
      { ok: true, text: 'Documentación 100% a medida' },
      { ok: true, text: 'Dashboard analítico y exportes' },
      { ok: true, text: 'Mesa de ayuda continua' },
      { ok: true, text: 'Acompañamiento ejecutivo' },
    ],
  },
]

// ponytail: anual = 10 meses
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  for (const p of PLANES) {
    if (p.ufMensual > 0) {
      console.assert(p.ufAnual === p.ufMensual * 10, `UF anual mal en ${p.id}`)
    }
  }
}

export const IVA_CHILE = 0.19

export function uf(n) {
  return `${String(n).replace('.', ',')} UF`
}

export function etiquetaIva() {
  return `+ IVA ${Math.round(IVA_CHILE * 100)}%`
}

export function clp(n) {
  return `$${Math.round(n).toLocaleString('es-CL')}`
}

export function precioFinalClp(ufNeto, ufEnClp) {
  const neto = Math.round(ufNeto * ufEnClp)
  return neto + Math.round(neto * IVA_CHILE)
}

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  console.assert(precioFinalClp(1, 10000) === 11900, 'IVA sobre CLP mal')
}

export function getPlan(id) {
  return PLANES.find((p) => p.id === id)
}

export function montoPlan(plan, periodo) {
  return periodo === 'anual' ? plan.ufAnual : plan.ufMensual
}

/** null = sin límite. Cuenta miembros actuales + invitaciones pendientes. */
export function cuposDisponibles(plan, miembros = 0, pendientes = 0) {
  if (!plan || plan.maxColaboradores == null) return null
  return Math.max(0, plan.maxColaboradores - (miembros + pendientes))
}

export function puedeInvitar(plan, miembros = 0, pendientes = 0) {
  const cupos = cuposDisponibles(plan, miembros, pendientes)
  return cupos === null || cupos > 0
}

const MS_DIA = 24 * 60 * 60 * 1000

/** @returns {{ estado: 'sin_fecha'|'vigente'|'por_vencer'|'vencido', dias: number|null, etiqueta: string }} */
export function estadoPlan(planVenceEn, hoy = new Date()) {
  if (!planVenceEn) {
    return { estado: 'sin_fecha', dias: null, etiqueta: 'Sin fecha de vencimiento' }
  }
  const fin = new Date(`${String(planVenceEn).slice(0, 10)}T12:00:00`)
  const base = new Date(hoy)
  base.setHours(12, 0, 0, 0)
  const dias = Math.round((fin - base) / MS_DIA)
  if (dias < 0) {
    return { estado: 'vencido', dias, etiqueta: `Venció hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}` }
  }
  if (dias === 0) {
    return { estado: 'por_vencer', dias: 0, etiqueta: 'Vence hoy' }
  }
  if (dias <= 14) {
    return { estado: 'por_vencer', dias, etiqueta: `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}` }
  }
  return { estado: 'vigente', dias, etiqueta: `Vigente · ${dias} días restantes` }
}

export function fechaCortaEs(iso) {
  if (!iso) return '—'
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
