import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/site/Footer'
import Navbar from '../components/site/Navbar'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="white">
      <Navbar />
      {/* El hero pasa por debajo de la navbar; el resto de las paginas no */}
      <Box as="main" flex="1" pt={isHome ? 0 : 'var(--site-header-h, 72px)'}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
