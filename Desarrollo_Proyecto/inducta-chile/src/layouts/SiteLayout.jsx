import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/site/Footer'
import Navbar from '../components/site/Navbar'

export default function SiteLayout() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === '/'
  // ponytail: /recursos usa su propio chrome de documentación
  const isDocs = pathname.startsWith('/recursos')

  // SPA: /#preguntas y similares no hacían scroll; también sube al cambiar de ruta.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    const ir = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const t = window.setTimeout(ir, 40)
    return () => window.clearTimeout(t)
  }, [pathname, hash])

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="white">
      {!isDocs ? <Navbar /> : null}
      <Box as="main" flex="1" pt={isHome || isDocs ? 0 : 'var(--site-header-h, 72px)'}>
        <Outlet />
      </Box>
      {!isDocs ? <Footer /> : null}
    </Box>
  )
}
