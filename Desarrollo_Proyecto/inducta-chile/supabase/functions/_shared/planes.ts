/** Espejo de src/lib/planes.js para cálculo de monto en el servidor. */
export const IVA_CHILE = 0.19

export const PLANES_UF: Record<string, { ufMensual: number; ufAnual: number }> = {
  basico: { ufMensual: 1.5, ufAnual: 15 },
  plus: { ufMensual: 4.5, ufAnual: 45 },
  plusplus: { ufMensual: 10, ufAnual: 100 },
}

export function ufNeto(planId: string, periodo: 'mensual' | 'anual'): number | null {
  const p = PLANES_UF[planId]
  if (!p) return null
  return periodo === 'anual' ? p.ufAnual : p.ufMensual
}

export function montoClpConIva(ufValor: number, ufEnClp: number): number {
  const neto = Math.round(ufValor * ufEnClp)
  return neto + Math.round(neto * IVA_CHILE)
}

export async function ufHoyClp(): Promise<number> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch('https://mindicador.cl/api/uf', { signal: ctrl.signal })
    if (!res.ok) throw new Error(`mindicador ${res.status}`)
    const data = await res.json()
    const valor = data?.serie?.[0]?.valor
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
      throw new Error('UF inválida')
    }
    return valor
  } finally {
    clearTimeout(t)
  }
}
