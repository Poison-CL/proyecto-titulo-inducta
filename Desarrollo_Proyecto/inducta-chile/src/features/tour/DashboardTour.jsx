import { useEffect, useRef } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import './dashboardTour.css'

const KEY = 'inducta_tour_dashboard_visto'

export function DashboardTour({ enabled }) {
  const started = useRef(false)

  useEffect(() => {
    if (!enabled) {
      // Permitir reintento cuando vuelva enabled (p. ej. tras loading o cerrar modal)
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
            title: 'Bienvenido a Inducta',
            intro: 'Este recorrido rápido le muestra lo esencial del panel de su empresa.',
          },
          {
            element: '[data-tour="nav-inicio"]',
            intro: 'Desde Inicio ve el resumen y los accesos principales.',
            position: 'right',
          },
          {
            element: '[data-tour="nav-equipo"]',
            intro: 'En Equipo invita colaboradores y gestiona roles (solo administradores).',
            position: 'right',
          },
          {
            element: '[data-tour="nav-config"]',
            intro: 'En Configuración revise el plan, renovaciones y datos de la empresa.',
            position: 'right',
          },
          {
            element: '[data-tour="dash-resumen"]',
            intro:
              'Aquí se concentran las acciones del día a día. Puede repetir el tour borrando el aviso desde el navegador si lo necesita.',
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
      // Si el timeout no llegó a arrancar Intro, no dejar started trabado
      if (!document.querySelector('.introjs-overlay')) {
        started.current = false
      }
    }
  }, [enabled])

  return null
}
