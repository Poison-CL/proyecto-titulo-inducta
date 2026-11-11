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

/** Último valor conocido si las APIs públicas fallan (mindicador suele caer). */
const UF_FALLBACK_CLP = 41309.19

async function fetchUf(url: string, pick: (data: unknown) => number | null): Promise<number | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return pick(await res.json())
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

function ufOk(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function ufHoyClp(): Promise<number> {
  // ponytail: mindicador cae seguido; cascada corta + fallback fijo
  const fromMindicador = await fetchUf('https://mindicador.cl/api/uf', (d) =>
    ufOk((d as { serie?: { valor?: number }[] })?.serie?.[0]?.valor),
  )
  if (fromMindicador != null) return fromMindicador

  const fromIndicadores = await fetchUf('https://indicadores.cl/api/v1/uf.json', (d) =>
    ufOk((d as { valor?: number })?.valor),
  )
  if (fromIndicadores != null) return fromIndicadores

  const envFallback = ufOk(Deno.env.get('UF_FALLBACK_CLP'))
  return envFallback ?? UF_FALLBACK_CLP
}
