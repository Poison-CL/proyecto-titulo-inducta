import { Box, Container, Flex, Heading, HStack, Icon, Link, Text } from '@chakra-ui/react'
import { BookOpen, ChevronRight, FileText, HelpCircle, Layers, ShieldCheck } from 'lucide-react'
import { Link as RouterLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { ARTICULOS, TIPOS, getArticulo } from '../lib/recursos'

const SECCIONES = [
  { key: 'guias', label: 'Guías de inducción', to: '/recursos?tipo=guias', icon: BookOpen },
  { key: 'documentacion', label: 'Documentación', to: '/recursos?tipo=documentacion', icon: FileText },
  { key: 'capacitaciones', label: 'Capacitaciones', to: '/recursos/capacitaciones', icon: Layers },
  { key: 'cumplimiento', label: 'Cumplimiento', to: '/recursos/cumplimiento', icon: ShieldCheck },
  { key: 'soporte', label: 'Soporte', to: '/recursos/soporte', icon: HelpCircle },
]

function seccionActiva(pathname, params) {
  const resto = pathname.replace(/^\/recursos\/?/, '')
  if (!resto) return params.get('tipo') === 'documentacion' ? 'documentacion' : 'guias'
  if (SECCIONES.some((s) => s.key === resto)) return resto
  return getArticulo(resto)?.tipo ?? 'guias'
}

export function EncabezadoRecurso({ titulo, bajada, children }) {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'flex-end' }}
      justify="space-between"
      gap={4}
      pb={6}
      mb={6}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Box>
        <HStack spacing={1} fontSize="sm" color="blackAlpha.600" mb={2}>
          <Link as={RouterLink} to="/recursos?tipo=guias" color="blackAlpha.600">
            Recursos
          </Link>
          <Icon as={ChevronRight} boxSize={3.5} />
          <Text color="brand.ink">{titulo}</Text>
        </HStack>
        <Heading as="h1" fontSize={{ base: '1.6rem', md: '1.9rem' }} fontWeight="semibold" lineHeight="1.15" letterSpacing="-0.02em">
          {titulo}
        </Heading>
        {bajada && (
          <Text color="blackAlpha.700" mt={1.5} lineHeight="1.6">
            {bajada}
          </Text>
        )}
      </Box>
      {children}
    </Flex>
  )
}

const itemLateral = (activo) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 2.5,
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  whiteSpace: 'nowrap',
  fontWeight: activo ? 'semibold' : 'medium',
  color: activo ? 'brand.primary' : 'brand.ink',
  bg: activo ? 'brand.wash' : 'transparent',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: { bg: activo ? 'brand.wash' : 'blackAlpha.50', color: activo ? 'brand.primary' : 'brand.ink' },
})

export default function RecursosLayout() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const activa = seccionActiva(pathname, params)
  const categoriaActiva = pathname === '/recursos' ? params.get('categoria') : null
  const categorias = TIPOS[activa]
    ? [...new Set(ARTICULOS.filter((a) => a.tipo === activa).map((a) => a.categoria))].map((c) => ({
        nombre: c,
        total: ARTICULOS.filter((a) => a.tipo === activa && a.categoria === c).length,
      }))
    : []

  return (
    <Box bg="white" minH="70vh">
      <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, lg: 12 }} align="flex-start">
          <Box
            as="nav"
            aria-label="Recursos"
            w={{ base: 'full', lg: '232px' }}
            flexShrink={0}
            position={{ lg: 'sticky' }}
            top={{ lg: 'calc(var(--site-header-h, 72px) + 24px)' }}
          >
            <Text display={{ base: 'none', lg: 'block' }} fontSize="xs" fontWeight="semibold" color="blackAlpha.600" px={3} mb={2}>
              Recursos
            </Text>
            <Flex
              direction={{ base: 'row', lg: 'column' }}
              gap={0.5}
              overflowX={{ base: 'auto', lg: 'visible' }}
              mx={{ base: -1, lg: 0 }}
              pb={{ base: 1, lg: 0 }}
            >
              {SECCIONES.map((s) => (
                <Box key={s.key}>
                  <Link as={RouterLink} to={s.to} aria-current={activa === s.key ? 'page' : undefined} {...itemLateral(activa === s.key && !categoriaActiva)}>
                    <Icon as={s.icon} boxSize={4} />
                    {s.label}
                  </Link>
                  {activa === s.key && categorias.length > 0 && (
                    <Box display={{ base: 'none', lg: 'block' }} ml={6} mt={0.5} mb={2} borderLeftWidth="1px" borderColor="blackAlpha.100">
                      {categorias.map((c) => (
                        <Link
                          key={c.nombre}
                          as={RouterLink}
                          to={`/recursos?tipo=${s.key}&categoria=${encodeURIComponent(c.nombre)}`}
                          {...itemLateral(categoriaActiva === c.nombre)}
                          borderRadius="0 6px 6px 0"
                          justifyContent="space-between"
                          py={1.5}
                        >
                          {c.nombre}
                          <Text as="span" fontSize="xs" color="blackAlpha.500" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {c.total}
                          </Text>
                        </Link>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Flex>
          </Box>

          <Box key={activa} flex="1" minW={0} w="full">
            <Outlet />
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
