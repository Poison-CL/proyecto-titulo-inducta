import { useCallback, useEffect, useRef, useState } from 'react'

function topeDocs() {
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--docs-header-h')) || 56
  return h + 40
}

/**
 * TOC docs: barra activa al scroll y al click (SPA a veces no mueve el hash).
 * @param {string[]} ids — ids de ancla en el DOM
 */
export function useDocsToc(ids) {
  // ponytail: clave estable; el array `ids` suele ser nuevo en cada render
  const clave = ids.join('|')
  const [activo, setActivo] = useState(ids[0] || null)
  const bloqueoRef = useRef(0)

  const sincronizar = useCallback(() => {
    if (Date.now() < bloqueoRef.current) return
    const lista = clave ? clave.split('|') : []
    if (!lista.length) return
    const tope = topeDocs()
    let actual = lista[0]
    for (const id of lista) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= tope) actual = id
    }
    setActivo(actual)
  }, [clave])

  useEffect(() => {
    const lista = clave ? clave.split('|') : []
    if (!lista.length) return
    setActivo(lista[0])
    // Esperar un frame: los headings pueden montarse justo después del effect
    const t = requestAnimationFrame(() => sincronizar())

    window.addEventListener('scroll', sincronizar, { passive: true })
    window.addEventListener('hashchange', sincronizar)
    window.addEventListener('resize', sincronizar)

    const obs = new IntersectionObserver(sincronizar, {
      root: null,
      rootMargin: `-${topeDocs()}px 0px -40% 0px`,
      threshold: [0, 0.25, 1],
    })
    for (const id of lista) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }

    return () => {
      cancelAnimationFrame(t)
      window.removeEventListener('scroll', sincronizar)
      window.removeEventListener('hashchange', sincronizar)
      window.removeEventListener('resize', sincronizar)
      obs.disconnect()
    }
  }, [clave, sincronizar])

  const irA = useCallback((id, e) => {
    e?.preventDefault()
    setActivo(id)
    // Evita que el scroll suave pise el activo elegido (~600ms)
    bloqueoRef.current = Date.now() + 700
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  }, [])

  return { activo, irA }
}
