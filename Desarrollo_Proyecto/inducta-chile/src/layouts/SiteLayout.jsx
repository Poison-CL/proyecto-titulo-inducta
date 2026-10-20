import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/site/Footer'
import Navbar from '../components/site/Navbar'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  // ponytail: /recursos usa su propio chrome de documentación
  const isDocs = pathname.startsWith('/recursos')

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
