import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Menu as MenuIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, NavLink } from 'react-router-dom'
import InductaUserButton from '../auth/InductaUserButton'
import LinkAlPanel from '../auth/LinkAlPanel'
import AnnouncementBanner from './AnnouncementBanner'

const linkBtn = {
  variant: 'ghost',
  size: 'sm',
  h: '40px',
  px: 3,
  fontWeight: 'medium',
  color: 'white',
  _hover: { bg: 'whiteAlpha.200', color: 'white' },
  _active: { bg: 'whiteAlpha.300', transform: 'none' },
}

const mobileBtn = {
  variant: 'ghost',
  justifyContent: 'flex-start',
  color: 'white',
  _hover: { bg: 'whiteAlpha.200' },
}

export default function Navbar() {
  const { isOpen: mobileOpen, onToggle: onMobileToggle, onClose: onMobileClose } = useDisclosure()
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    document.documentElement.style.setProperty('--site-header-h', showBanner ? '118px' : '72px')
    return () => {
      document.documentElement.style.removeProperty('--site-header-h')
    }
  }, [showBanner])

  return (
    <Box
      as="header"
      className="site-header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={50}
      bg="brand.primary"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.200"
      sx={{
        backgroundColor: 'rgba(27, 34, 167, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {showBanner ? <AnnouncementBanner onClose={() => setShowBanner(false)} /> : null}

      <Flex maxW="6xl" mx="auto" px={{ base: 4, md: 8 }} h="72px" align="center" gap={{ base: 3, md: 6 }}>
        <Box
          as={RouterLink}
          to="/"
          display="flex"
          alignItems="center"
          flexShrink={0}
          onClick={onMobileClose}
          _hover={{ opacity: 0.85 }}
        >
          <Image src="/logo-blanco.png" alt="Inducta Chile" h={{ base: '22px', md: '26px' }} w="auto" />
        </Box>

        <HStack as="nav" spacing={0} display={{ base: 'none', md: 'flex' }} align="center" flex="1" h="40px">
          <Button as={NavLink} to="/" end {...linkBtn}>
            Inicio
          </Button>
          <Button as={NavLink} to="/recursos" {...linkBtn}>
            Recursos
          </Button>
          <Button as={NavLink} to="/contacto" {...linkBtn}>
            Contacto
          </Button>
        </HStack>

        <Flex align="center" justify="flex-end" gap={{ base: 2, md: 4 }} h="40px" ml="auto">
          <Button
            as={RouterLink}
            to="/precios"
            size="sm"
            h="40px"
            px={{ base: 4, md: 5 }}
            borderRadius="full"
            bg="brand.accent"
            color="white"
            fontWeight="bold"
            display={{ base: 'none', sm: 'inline-flex' }}
            onClick={onMobileClose}
            _hover={{ bg: 'brand.accentDark' }}
            _active={{ bg: 'brand.primaryDark', transform: 'scale(0.97)' }}
          >
            Precios
          </Button>

          <SignedOut>
            <Button
              as={RouterLink}
              to="/entrar"
              variant="ghost"
              size="sm"
              h="40px"
              px={3}
              fontWeight="semibold"
              color="white"
              onClick={onMobileClose}
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            >
              Ingresar
            </Button>
          </SignedOut>

          <SignedIn>
            <LinkAlPanel
              size="sm"
              h="40px"
              variant="ghost"
              fontWeight="semibold"
              color="white"
              display={{ base: 'none', sm: 'inline-flex' }}
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            >
              Ir al panel
            </LinkAlPanel>
            <Flex align="center" h="40px">
              <InductaUserButton afterSignOutUrl="/" />
            </Flex>
          </SignedIn>

          <IconButton
            display={{ base: 'inline-flex', md: 'none' }}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            icon={<Icon as={mobileOpen ? X : MenuIcon} boxSize={5} />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            h="40px"
            w="40px"
            minW="40px"
            onClick={onMobileToggle}
          />
        </Flex>
      </Flex>

      <Collapse in={mobileOpen} animateOpacity>
        <Box
          display={{ base: 'block', md: 'none' }}
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          bg="brand.primary"
          px={4}
          py={4}
        >
          <VStack as="nav" align="stretch" spacing={1}>
            <Button as={NavLink} to="/" end {...mobileBtn} onClick={onMobileClose}>
              Inicio
            </Button>
            <Button as={NavLink} to="/recursos" {...mobileBtn} onClick={onMobileClose}>
              Recursos
            </Button>
            <Button as={NavLink} to="/contacto" {...mobileBtn} onClick={onMobileClose}>
              Contacto
            </Button>
            <Button
              as={RouterLink}
              to="/precios"
              bg="brand.accent"
              color="white"
              borderRadius="full"
              mt={2}
              onClick={onMobileClose}
              _hover={{ bg: 'brand.accentDark' }}
            >
              Precios
            </Button>
            <SignedIn>
              <LinkAlPanel {...mobileBtn} onClick={onMobileClose}>
                Ir al panel
              </LinkAlPanel>
            </SignedIn>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}
