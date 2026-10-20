import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom'

const navBtn = {
  variant: 'ghost',
  justifyContent: 'flex-start',
  h: '36px',
  px: 2.5,
  fontWeight: 'medium',
  fontSize: 'sm',
  color: 'blackAlpha.700',
  borderRadius: 'md',
  gap: 0,
  _hover: { bg: 'blackAlpha.50', color: 'brand.ink' },
  _activeLink: {
    bg: 'blackAlpha.100',
    color: 'brand.ink',
    fontWeight: 'semibold',
  },
}

/**
 * Shell del panel Inducta.
 * navSections: grupos de [{ to, end?, label, icon, dataTour? }]
 * ctaNav: { label, to, icon } botón de acción rápida
 */
export default function PanelShell({
  logoTo = '/',
  topLinks = [],
  navSections = [],
  ctaNav = null,
  resolverBusqueda = null,
  searchPlaceholder = 'Búsqueda rápida',
  planWidget = null,
  topRight = null,
  banner = null,
  children,
}) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [buscando, setBuscando] = useState(false)
  const CtaIcon = ctaNav?.icon

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        // Si el foco ya está en otro input de panel, no pelear
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function buscar(e) {
    e.preventDefault()
    if (!resolverBusqueda) return
    setBuscando(true)
    setMsg('')
    try {
      const r = await resolverBusqueda(q)
      if (!r?.to) {
        setMsg(r?.msg || 'Sin coincidencia en el panel.')
        return
      }
      setQ('')
      navigate(r.to)
    } catch {
      setMsg('No se pudo completar la búsqueda.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Flex direction="column" h="100vh" bg="white">
      <Flex
        as="header"
        h="52px"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 5 }}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        flexShrink={0}
        bg="white"
      >
        <Box as={RouterLink} to={logoTo} display="flex" alignItems="center" _hover={{ opacity: 0.85 }}>
          <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="26px" w="auto" />
        </Box>
        <Flex align="center" gap={1}>
          {topLinks.map(({ label, to, icon: IconCmp }) => (
            <Button
              key={to}
              as={RouterLink}
              to={to}
              variant="ghost"
              size="sm"
              h="36px"
              px={3}
              fontWeight="medium"
              color="blackAlpha.700"
              leftIcon={IconCmp ? <IconCmp size={15} /> : undefined}
            >
              {label}
            </Button>
          ))}
          {topRight}
        </Flex>
      </Flex>

      <Flex flex="1" minH={0}>
        <Flex
          as="aside"
          w="232px"
          direction="column"
          justify="space-between"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor="blackAlpha.100"
          px={3}
          py={4}
          bg="white"
          display={{ base: 'none', md: 'flex' }}
        >
          <Box>
            {/* Quick search */}
            <Box as="form" onSubmit={buscar} mb={2.5}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none" h="36px">
                  <Icon as={Search} boxSize={3.5} color="blackAlpha.400" />
                </InputLeftElement>
                <Input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    if (msg) setMsg('')
                  }}
                  placeholder={searchPlaceholder}
                  aria-label="Búsqueda rápida del panel"
                  h="36px"
                  pl={9}
                  borderRadius="md"
                  borderColor="blackAlpha.200"
                  bg="blackAlpha.50"
                  fontSize="sm"
                  isDisabled={buscando}
                  _placeholder={{ color: 'blackAlpha.500' }}
                  _focus={{ bg: 'white', borderColor: 'brand.primary' }}
                />
                <InputRightElement w="auto" pr={1.5} h="36px" pointerEvents="none">
                  <Kbd fontSize="9px" bg="white" borderColor="blackAlpha.200" color="blackAlpha.600">
                    Ctrl K
                  </Kbd>
                </InputRightElement>
              </InputGroup>
              {msg ? (
                <Text fontSize="xs" color="blackAlpha.500" mt={1.5} px={1}>
                  {msg}
                </Text>
              ) : null}
            </Box>

            {/* CTA tipo “New project” */}
            {ctaNav ? (
              <Button
                as={RouterLink}
                to={ctaNav.to}
                variant="outline"
                justifyContent="flex-start"
                w="full"
                h="36px"
                mb={3}
                px={2.5}
                fontSize="sm"
                fontWeight="medium"
                borderColor="blackAlpha.200"
                bg="white"
                color="brand.ink"
                borderRadius="md"
                leftIcon={CtaIcon ? <CtaIcon size={16} strokeWidth={1.75} /> : undefined}
                _hover={{ bg: 'brand.soft', borderColor: 'blackAlpha.300' }}
              >
                {ctaNav.label}
              </Button>
            ) : null}

            {/* Nav agrupada */}
            <VStack as="nav" align="stretch" spacing={0.5}>
              {navSections.map((group, gi) => (
                <Box key={gi}>
                  {gi > 0 ? <Divider my={2.5} borderColor="blackAlpha.100" /> : null}
                  {group.map(({ to, end, label, icon: IconCmp, dataTour }) => (
                    <Button
                      key={to}
                      as={NavLink}
                      to={to}
                      end={end}
                      leftIcon={IconCmp ? <IconCmp size={16} strokeWidth={1.75} /> : undefined}
                      data-tour={dataTour}
                      {...navBtn}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              ))}
            </VStack>
          </Box>

          {planWidget ? <Box mt={4}>{planWidget}</Box> : null}
        </Flex>

        <Box as="main" flex="1" overflowY="auto" px={{ base: 5, md: 10, xl: 14 }} py={{ base: 8, md: 10 }}>
          <Flex
            display={{ base: 'flex', md: 'none' }}
            gap={1}
            mb={6}
            overflowX="auto"
            pb={1}
            sx={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {navSections.flat().map(({ to, end, label }) => (
              <Button
                key={to}
                as={NavLink}
                to={to}
                end={end}
                size="sm"
                variant="outline"
                flexShrink={0}
                h="32px"
                fontSize="xs"
                borderRadius="full"
                borderColor="blackAlpha.200"
                _activeLink={{
                  bg: 'blackAlpha.100',
                  borderColor: 'transparent',
                  color: 'brand.ink',
                  fontWeight: 'semibold',
                }}
              >
                {label}
              </Button>
            ))}
          </Flex>
          {banner}
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export function PlanWidget({ titulo, planLabel, cta, to, meta }) {
  return (
    <Box
      borderRadius="lg"
      p={3.5}
      bg="brand.wash"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      backgroundImage="linear-gradient(145deg, rgba(238,240,252,1) 0%, rgba(250,250,250,1) 100%)"
    >
      <Text fontSize="xs" color="blackAlpha.600" mb={0.5}>
        {titulo}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="brand.ink" mb={3} textTransform="capitalize">
        {planLabel}
      </Text>
      {cta && to ? (
        <Button
          as={RouterLink}
          to={to}
          size="sm"
          w="full"
          h="32px"
          mb={meta ? 3 : 0}
          variant="outline"
          borderColor="blackAlpha.200"
          bg="white"
          fontSize="xs"
          fontWeight="semibold"
        >
          {cta}
        </Button>
      ) : null}
      {meta ? (
        <Text fontSize="xs" color="blackAlpha.600" lineHeight="1.4">
          {meta}
        </Text>
      ) : null}
    </Box>
  )
}
