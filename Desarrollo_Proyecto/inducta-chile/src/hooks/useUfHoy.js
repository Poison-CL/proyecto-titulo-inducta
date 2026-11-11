import { useEffect, useState } from 'react'

// ponytail: mismo fallback que supabase/functions/_shared/planes.ts
const UF_FALLBACK_CLP = 41309.19

async function leerUf() {
  try {
    const r = await fetch('https://mindicador.cl/api/uf', { signal: AbortSignal.timeout(5000) })
    if (r.ok) {
      const d = await r.json()
      const v = d?.serie?.[0]?.valor
      if (typeof v === 'number' && v > 0) return v
    }
  } catch {
    /* mindicador caído */
  }
  try {
    const r = await fetch('https://indicadores.cl/api/v1/uf.json', {
      signal: AbortSignal.timeout(5000),
    })
    if (r.ok) {
      const d = await r.json()
      if (typeof d?.valor === 'number' && d.valor > 0) return d.valor
    }
  } catch {
    /* indicadores caído */
  }
  return UF_FALLBACK_CLP
}

export function useUfHoy() {
  const [ufClp, setUfClp] = useState(UF_FALLBACK_CLP)

  useEffect(() => {
    let alive = true
    leerUf().then((v) => {
      if (alive) setUfClp(v)
    })
    return () => {
      alive = false
    }
  }, [])

  return ufClp
}
