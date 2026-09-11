import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import {
  BookOpen,
  Building2,
  ChevronDown,
  FileText,
  HelpCircle,
  Layers,
  Menu as MenuIcon,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, NavLink } from 'react-router-dom'
import InductaUserButton from '../auth/InductaUserButton'
import AnnouncementBanner from './AnnouncementBanner'

const MotionPanel = motion.create(Box)

const recursos = [
  {
    title: 'Guias de induccion',
    desc: 'Documentacion para procesos de ingreso',
    icon: BookOpen,
    href: '/recursos',
  },
  {
    title: 'Capacitaciones',
    desc: 'Programas por area y cargo',
    icon: Layers,
    href: '/recursos',
  },
  {
    title: 'Cumplimiento',
    desc: 'Registro y trazabilidad',
    icon: ShieldCheck,
    href: '/recursos',
  },
  {
    title: 'Documentacion',
    desc: 'Manuales institucionales',
    icon: FileText,
    href: '/recursos',
  },
  {
    title: 'Soporte',
    desc: 'Canal de ayuda corporativo',
    icon: HelpCircle,
    href: '/contacto',
  },
]

const linkBtn = {
  variant: 'ghost',
  size: 'sm',
  h: '40px',
  px: 3,
  fontWeight: 'medium',
  color: 'brand.ink',
  _hover: { bg: 'transparent', color: 'brand.primary' },
}

export default function Navbar() {
  const { isOpen: megaOpen, onOpen: onMegaOpen, onClose: onMegaClose } = useDisclosure()
  const { isOpen: mobileOpen, onToggle: onMobileToggle, onClose: onMobileClose } =
    useDisclosure()
  const [showBanner, setShowBanner] = useState(true)

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
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={50}
      bg="white"
      borderBottomWidth="2px"
      borderColor="brand.primary"
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
        {/* Logo */}
        <Text
          as={RouterLink}
          to="/"
          fontFamily="heading"
          fontWeight="bold"
          fontSize={{ base: 'md', md: 'lg' }}
          lineHeight="1"
          color="brand.primary"
          flexShrink={0}
          onClick={closeAll}
          _hover={{ textDecoration: 'none', color: 'brand.ink' }}
        >
          Inducta Chile
        </Text>

        {/* Links desktop (junto al logo, estilo Buk) */}
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

        {/* Derecha: Precios + Ingresar */}
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
            _hover={{ bg: '#d33a3a' }}
            _active={{ bg: '#c03232' }}
          >
            Precios
          </Button>

          <SignedOut>
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                h="40px"
                px={2}
                fontWeight="semibold"
                color="brand.primary"
                _hover={{ bg: 'transparent', color: 'brand.ink' }}
              >
                Ingresar
              </MenuButton>
              <MenuList
                borderColor="blackAlpha.100"
                boxShadow="lg"
                py={2}
                minW="220px"
              >
                <Text
                  px={3}
                  pb={2}
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  Ingresar como
                </Text>
                <MenuItem
                  as={RouterLink}
                  to="/entrar?rol=empresa"
                  icon={<Icon as={Building2} boxSize={4} color="brand.primary" />}
                  fontWeight="medium"
                  py={3}
                  onClick={closeAll}
                  _hover={{ bg: 'brand.soft', textDecoration: 'none' }}
                >
                  Empresa
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/entrar?rol=empleado"
                  icon={<Icon as={UserRound} boxSize={4} color="brand.ink" />}
                  fontWeight="medium"
                  py={3}
                  onClick={closeAll}
                  _hover={{ bg: 'brand.soft', textDecoration: 'none' }}
                >
                  Empleado
                </MenuItem>
              </MenuList>
            </Menu>
          </SignedOut>

          <SignedIn>
            <Button
              as={RouterLink}
              to="/dashboard"
              size="sm"
              h="40px"
              variant="ghost"
              fontWeight="semibold"
              color="brand.primary"
              display={{ base: 'none', sm: 'inline-flex' }}
              _hover={{ bg: 'transparent', color: 'brand.ink' }}
            >
              Ir al panel
            </Button>
            <Flex align="center" h="40px">
              <InductaUserButton afterSignOutUrl="/" />
            </Flex>
          </SignedIn>

          <IconButton
            display={{ base: 'inline-flex', md: 'none' }}
            aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
            icon={<Icon as={mobileOpen ? X : MenuIcon} boxSize={5} />}
            variant="ghost"
            color="brand.ink"
            h="40px"
            w="40px"
            minW="40px"
            onClick={onMobileToggle}
          />
        </Flex>
      </Flex>

      {/* Menu movil */}
      <Collapse in={mobileOpen} animateOpacity>
        <Box
          display={{ base: 'block', md: 'none' }}
          borderTopWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
          px={4}
          py={4}
        >
          <VStack as="nav" align="stretch" spacing={1}>
            <Button
              as={NavLink}
              to="/"
              end
              variant="ghost"
              justifyContent="flex-start"
              onClick={onMobileClose}
            >
              Inicio
            </Button>
            <Button
              as={NavLink}
              to="/recursos"
              variant="ghost"
              justifyContent="flex-start"
              onClick={onMobileClose}
            >
              Recursos
            </Button>
            <Button
              as={NavLink}
              to="/contacto"
              variant="ghost"
              justifyContent="flex-start"
              onClick={onMobileClose}
            >
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
              _hover={{ bg: '#d33a3a' }}
            >
              Precios
            </Button>
            <SignedIn>
              <Button
                as={RouterLink}
                to="/dashboard"
                variant="ghost"
                justifyContent="flex-start"
                onClick={onMobileClose}
              >
                Ir al panel
              </Button>
            </SignedIn>
          </VStack>
        </Box>
      </Collapse>

      {/* Mega menu recursos */}
      <AnimatePresence>
        {megaOpen ? (
          <MotionPanel
            key="mega-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            display={{ base: 'none', md: 'block' }}
            position="absolute"
            left={0}
            right={0}
            top="100%"
            bg="white"
            borderBottomWidth="1px"
            borderColor="blackAlpha.100"
            boxShadow="lg"
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
                        <Text fontSize="sm" color="gray.600" mt={1} maxW="28ch">
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
