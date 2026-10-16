import { useEffect, useState } from 'react'

export function useUfHoy() {
  const [ufClp, setUfClp] = useState(null)

  useEffect(() => {
    fetch('https://mindicador.cl/api/uf')
      .then((r) => r.json())
      .then((d) => setUfClp(d.serie[0].valor))
      .catch(() => {})
  }, [])

  return ufClp
}
