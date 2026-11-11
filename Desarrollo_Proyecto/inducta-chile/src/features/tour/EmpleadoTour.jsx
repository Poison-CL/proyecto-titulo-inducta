import { useEffect, useRef } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import './dashboardTour.css'

const KEY = 'inducta_tour_empleado_v1'

export function EmpleadoTour({ enabled }) {
  const started = useRef(false)

  useEffect(() => {
    if (!enabled) {
      started.current = false
      return undefined
    }
    if (started.current) return undefined
    if (typeof window === 'undefined') return undefined
    if (localStorage.getItem(KEY) === '1') return undefined

    let cancelled = false
    const t = setTimeout(() => {
      if (cancelled || started.current) return
      if (localStorage.getItem(KEY) === '1') return

      started.current = true
      const intro = introJs()
      intro.setOptions({
        nextLabel: 'Siguiente',
        prevLabel: 'Atrás',
        doneLabel: 'Listo',
        skipLabel: 'Omitir',
        exitOnOverlayClick: false,
        showProgress: true,
        showBullets: false,
        overlayOpacity: 0.55,
        tooltipClass: 'inducta-intro',
        steps: [
          {
            title: 'Su panel de colaborador',
            intro: 'Aquí estudia las inducciones, rinde las pruebas y descarga constancias.',
          },
          {
            element: '[data-tour="emp-nav-inicio"]',
            title: 'Inicio',
            intro: 'Resumen de lo pendiente y accesos rápidos.',
            position: 'right',
          },
          {
            element: '[data-tour="emp-nav-programas"]',
            title: 'Mis programas',
            intro:
              'Primero complete el estudio (texto o video). Al 100 % se desbloquea Rendir. Si aprueba, podrá abrir la constancia.',
            position: 'right',
          },
          {
            element: '[data-tour="emp-nav-certificados"]',
            title: 'Mis certificados',
            intro: 'Constancias de las inducciones que ya aprobó.',
            position: 'right',
          },
          {
            element: '[data-tour="emp-nav-perfil"]',
            title: 'Mi perfil',
            intro: 'Datos de su cuenta y de la empresa a la que pertenece.',
            position: 'right',
          },
          {
            element: '[data-tour="emp-resumen"]',
            title: 'Listo',
            intro: 'Empiece por Mis programas si tiene alguna inducción pendiente.',
            position: 'bottom',
          },
        ].filter((s) => !s.element || document.querySelector(s.element)),
      })

      const marcar = () => localStorage.setItem(KEY, '1')
      intro.oncomplete(marcar)
      intro.onexit(marcar)
      intro.start()
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(t)
      if (!document.querySelector('.introjs-overlay')) {
        started.current = false
      }
    }
  }, [enabled])

  return null
}
