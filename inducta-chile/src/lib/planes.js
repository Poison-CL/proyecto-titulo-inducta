export const PLANES = [
  {
    id: 'demo',
    nombre: 'Demostración',
    cta: 'Agendar demostración',
    contratable: false,
    ufMensual: 0,
    ufAnual: 0,
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
    cta: 'Contratar',
    contratable: true,
    ufMensual: 1.5,
    ufAnual: 15,
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
    cta: 'Contratar',
    contratable: true,
    destacado: true,
    ufMensual: 4.5,
    ufAnual: 45,
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
    cta: 'Contratar',
    contratable: true,
    ufMensual: 10,
    ufAnual: 100,
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
if (import.meta.env.DEV) {
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

if (import.meta.env.DEV) {
  console.assert(precioFinalClp(1, 10000) === 11900, 'IVA sobre CLP mal')
}

export function getPlan(id) {
  return PLANES.find((p) => p.id === id)
}

export function montoPlan(plan, periodo) {
  return periodo === 'anual' ? plan.ufAnual : plan.ufMensual
}
