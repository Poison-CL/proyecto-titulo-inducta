import { useEffect, useRef } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import './dashboardTour.css'

// v2: incluye Programas, niveles/avances y textos al día
const KEY = 'inducta_tour_dashboard_v2'

export function DashboardTour({ enabled }) {
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
            title: 'Bienvenido a Inducta',
            intro:
              'Recorrido rápido del panel de empresa: inducciones con estudio, equipo, avances y plan.',
          },
          {
            element: '[data-tour="nav-inicio"]',
            title: 'Inicio',
            intro: 'Resumen del día y accesos a Equipo, Configuración y Programas.',
            position: 'right',
          },
          {
            element: '[data-tour="nav-programas"]',
            title: 'Programas',
            intro:
              'Cree evaluaciones, agregue niveles (texto o YouTube) y revise Avances del equipo. El colaborador debe completar el estudio antes de rendir.',
            position: 'right',
          },
          {
            element: '[data-tour="nav-equipo"]',
            title: 'Equipo',
            intro: 'Invite colaboradores por correo y gestione quién administra la empresa (respeta el cupo del plan).',
            position: 'right',
          },
          {
            element: '[data-tour="cta-invitar"]',
            title: 'Invitar',
            intro: 'Atajo para dar de alta a un colaborador sin salir del panel.',
            position: 'right',
          },
          {
            element: '[data-tour="nav-config"]',
            title: 'Configuración',
            intro: 'Plan, renovación y datos de contacto de la empresa.',
            position: 'right',
          },
          {
            element: '[data-tour="plan-widget"]',
            title: 'Su plan',
            intro: 'Aquí ve el plan actual y puede ir a gestionarlo.',
            position: 'top',
          },
          {
            element: '[data-tour="dash-resumen"]',
            title: 'Acciones',
            intro:
              'Use las tarjetas para ir a Equipo, Configuración o Programas. Empiece por Programas para crear su primera inducción con estudio y cuestionario.',
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
