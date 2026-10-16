import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import {
  BookOpen,
  ChevronDown,
  FileText,
  HelpCircle,
  Layers,
  Menu as MenuIcon,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, NavLink } from 'react-router-dom'
import InductaUserButton from '../auth/InductaUserButton'
import AnnouncementBanner from './AnnouncementBanner'

const MotionPanel = motion.create(Box)

const recursos = [
  {
    title: 'Guías de inducción',
    desc: 'Cómo planificar el primer día y el primer mes',
    icon: BookOpen,
    href: '/recursos?tipo=guias',
  },
  {
    title: 'Capacitaciones',
    desc: 'Cree sus propios cursos y pruebas',
    icon: Layers,
    href: '/recursos/capacitaciones',
  },
  {
    title: 'Cumplimiento',
    desc: 'Qué queda registrado para auditorías',
    icon: ShieldCheck,
    href: '/recursos/cumplimiento',
  },
  {
    title: 'Documentación',
    desc: 'Artículos sobre cómo usar la plataforma',
    icon: FileText,
    href: '/recursos?tipo=documentacion',
  },
  {
    title: 'Soporte',
    desc: 'Preguntas frecuentes y contacto',
    icon: HelpCircle,
    href: '/recursos/soporte',
  },
]

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
  const { isOpen: megaOpen, onOpen: onMegaOpen, onClose: onMegaClose } = useDisclosure()
  const { isOpen: mobileOpen, onToggle: onMobileToggle, onClose: onMobileClose } =
    useDisclosure()
  const [showBanner, setShowBanner] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--site-header-h',
      showBanner ? '118px' : '72px',
    )
    return () => {
      document.documentElement.style.removeProperty('--site-header-h')
    }
  }, [showBanner])

  const closeAll = () => {
    onMegaClose()
    onMobileClose()
  }

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
      onMouseLeave={onMegaClose}
    >
      {showBanner ? (
        <AnnouncementBanner onClose={() => setShowBanner(false)} />
      ) : null}

      <Flex
        maxW="6xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        h="72px"
        align="center"
        gap={{ base: 3, md: 6 }}
      >
        <Box
          as={RouterLink}
          to="/"
          display="flex"
          alignItems="center"
          flexShrink={0}
          onClick={closeAll}
          _hover={{ opacity: 0.85 }}
        >
          <Image
            src="/logo-blanco.png"
            alt="Inducta Chile"
            h={{ base: '22px', md: '26px' }}
            w="auto"
          />
        </Box>

        <HStack
          as="nav"
          spacing={0}
          display={{ base: 'none', md: 'flex' }}
          align="center"
          flex="1"
          h="40px"
        >
          <Button as={NavLink} to="/" end {...linkBtn}>
            Inicio
          </Button>

          <Box
            onMouseEnter={onMegaOpen}
            display="flex"
            alignItems="center"
            h="40px"
          >
            <Button
              type="button"
              {...linkBtn}
              rightIcon={<Icon as={ChevronDown} boxSize={3.5} />}
              onClick={megaOpen ? onMegaClose : onMegaOpen}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Recursos
            </Button>
          </Box>

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
            onClick={closeAll}
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
              onClick={closeAll}
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            >
              Ingresar
            </Button>
          </SignedOut>

          <SignedIn>
            <Button
              as={RouterLink}
              to="/dashboard"
              size="sm"
              h="40px"
              variant="ghost"
              fontWeight="semibold"
              color="white"
              display={{ base: 'none', sm: 'inline-flex' }}
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            >
              Ir al panel
            </Button>
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
              <Button as={RouterLink} to="/dashboard" {...mobileBtn} onClick={onMobileClose}>
                Ir al panel
              </Button>
            </SignedIn>
          </VStack>
        </Box>
      </Collapse>

      <AnimatePresence>
        {megaOpen ? (
          <MotionPanel
            key="mega-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', bounce: 0, duration: 0.35 }
            }
            style={{ transformOrigin: 'top center' }}
            display={{ base: 'none', md: 'block' }}
            position="absolute"
            left={0}
            right={0}
            top="100%"
            bg="white"
            borderBottomWidth="1px"
            borderColor="blackAlpha.100"
            boxShadow="0 12px 24px -12px rgba(13, 13, 13, 0.12)"
            zIndex={51}
          >
            <Box maxW="6xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {recursos.map((item) => (
                  <Link
                    key={item.title}
                    as={RouterLink}
                    to={item.href}
                    display="block"
                    p={4}
                    borderRadius="md"
                    bg="white"
                    onClick={closeAll}
                    _hover={{ bg: 'brand.soft', textDecoration: 'none' }}
                  >
                    <HStack align="start" spacing={3}>
                      <Icon as={item.icon} boxSize={5} color="brand.ink" mt={0.5} />
                      <Box>
                        <Text fontWeight="semibold" color="brand.ink">
                          {item.title}
                        </Text>
                        <Text fontSize="sm" color="blackAlpha.700" mt={1} maxW="28ch">
                          {item.desc}
                        </Text>
                      </Box>
                    </HStack>
                  </Link>
                ))}
              </SimpleGrid>
            </Box>
          </MotionPanel>
        ) : null}
      </AnimatePresence>
    </Box>
  )
}
