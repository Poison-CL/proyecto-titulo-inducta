import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ArrowLeft, ExternalLink, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import LinkAlPanel from '../components/auth/LinkAlPanel'
import { ARTICULOS, TIPOS, buscarTodo, getArticulo } from '../lib/recursos'

const esArticuloTipo = (pathname, tipo) => {
  const slug = pathname.replace(/^\/recursos\/?/, '')
  if (!slug || slug.includes('/')) return false
  if (['guias', 'documentacion', 'capacitaciones', 'cumplimiento', 'soporte'].includes(slug)) return false
  return getArticulo(slug)?.tipo === tipo
}

const GRUPOS = [
  {
    titulo: 'Primeros pasos',
    items: [
      {
        key: 'inicio',
        label: 'Introducción',
        to: '/recursos',
        match: (p, q) => (p === '/recursos' || p === '/recursos/') && !q.get('q'),
      },
      {
        key: 'guias',
        label: 'Guías de inducción',
        to: '/recursos/guias',
        match: (p) => p.startsWith('/recursos/guias') || esArticuloTipo(p, 'guias'),
      },
      {
        key: 'documentacion',
        label: 'Documentación',
        to: '/recursos/documentacion',
        match: (p) => p.startsWith('/recursos/documentacion') || esArticuloTipo(p, 'documentacion'),
      },
    ],
  },
  {
    titulo: 'Plataforma',
    items: [
      { key: 'capacitaciones', label: 'Capacitaciones', to: '/recursos/capacitaciones', match: (p) => p.startsWith('/recursos/capacitaciones') },
      { key: 'cumplimiento', label: 'Cumplimiento', to: '/recursos/cumplimiento', match: (p) => p.startsWith('/recursos/cumplimiento') },
    ],
  },
  {
    titulo: 'Ayuda',
    items: [
      { key: 'soporte', label: 'Soporte', to: '/recursos/soporte', match: (p) => p.startsWith('/recursos/soporte') },
    ],
  },
]

function seccionActiva(pathname, params) {
  for (const g of GRUPOS) {
    for (const item of g.items) {
      if (item.match(pathname, params)) return item.key
    }
  }
  const resto = pathname.replace(/^\/recursos\/?/, '')
  if (!resto) return 'inicio'
  if (['guias', 'documentacion', 'capacitaciones', 'cumplimiento', 'soporte'].includes(resto)) return resto
  return getArticulo(resto)?.tipo ?? 'inicio'
}

const itemLateral = (activo) => ({
  display: 'block',
  px: 3,
  py: 1.5,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: activo ? 'semibold' : 'normal',
  color: activo ? 'brand.ink' : 'blackAlpha.700',
  bg: activo ? 'blackAlpha.100' : 'transparent',
  _hover: { bg: activo ? 'blackAlpha.100' : 'blackAlpha.50', textDecoration: 'none', color: 'brand.ink' },
})

export function EncabezadoRecurso({ titulo, bajada, migas, children }) {
  return (
    <Box mb={8}>
      {migas?.length ? (
        <HStack spacing={1.5} fontSize="sm" color="blackAlpha.500" mb={4} flexWrap="wrap">
          {migas.map((m, i) => (
            <HStack key={m.label} spacing={1.5}>
              {i > 0 ? <Text as="span">/</Text> : null}
              {m.to ? (
                <Link as={RouterLink} to={m.to} color="blackAlpha.500" _hover={{ color: 'brand.primary' }}>
                  {m.label}
                </Link>
              ) : (
                <Text color="blackAlpha.700">{m.label}</Text>
              )}
            </HStack>
          ))}
        </HStack>
      ) : null}
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={4}>
        <Box>
          <Heading as="h1" fontSize={{ base: '1.85rem', md: '2.15rem' }} fontWeight="semibold" lineHeight="1.15" letterSpacing="-0.03em" color="brand.ink">
            {titulo}
          </Heading>
          {bajada ? (
            <Text color="blackAlpha.700" mt={2} lineHeight="1.65" maxW="54ch" fontSize={{ base: 'md', md: 'lg' }}>
              {bajada}
            </Text>
          ) : null}
        </Box>
        {children}
      </Flex>
    </Box>
  )
}

function ResultadosBusqueda({ consulta, onLimpiar }) {
  const resultados = useMemo(() => buscarTodo(consulta), [consulta])

  return (
    <Box>
      <EncabezadoRecurso
        titulo={`Resultados para “${consulta}”`}
        bajada={`${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'} en el hub de recursos.`}
        migas={[{ label: 'Recursos', to: '/recursos' }, { label: 'Búsqueda' }]}
      >
        <Button variant="outline" size="sm" onClick={onLimpiar}>
          Limpiar
        </Button>
      </EncabezadoRecurso>

      {resultados.length === 0 ? (
        <Box py={8}>
          <Text fontWeight="semibold">No encontramos resultados</Text>
          <Text fontSize="sm" color="blackAlpha.600" mt={1}>
            Pruebe otra palabra o{' '}
            <Link as={RouterLink} to="/contacto?motivo=soporte" color="brand.primary" fontWeight="semibold">
              escríbanos
            </Link>
            .
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={0} borderTopWidth="1px" borderColor="blackAlpha.100">
          {resultados.map((r) => (
            <Link
              key={`${r.kind}-${r.slug}`}
              as={RouterLink}
              to={r.to}
              display="block"
              py={4}
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              _hover={{ bg: 'blackAlpha.50', textDecoration: 'none' }}
            >
              <Text fontSize="xs" fontWeight="semibold" color="brand.primary" mb={0.5}>
                {r.etiqueta}
              </Text>
              <Text fontWeight="semibold" color="brand.ink">
                {r.titulo}
              </Text>
              <Text fontSize="sm" color="blackAlpha.600" mt={0.5} noOfLines={2}>
                {r.resumen}
              </Text>
            </Link>
          ))}
        </VStack>
      )}
    </Box>
  )
}

export default function RecursosLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const activa = seccionActiva(pathname, params)
  const qUrl = params.get('q') ?? ''
  const [consulta, setConsulta] = useState(qUrl)
  const [filtroNav, setFiltroNav] = useState('')
  const inputRef = useRef(null)
  const buscando = qUrl.trim().length > 0

  const enLista = pathname.startsWith('/recursos/guias') || pathname.startsWith('/recursos/documentacion')
  const tipoLista = pathname.startsWith('/recursos/documentacion')
    ? 'documentacion'
    : pathname.startsWith('/recursos/guias')
      ? 'guias'
      : null
  const categoriaActiva = enLista && !buscando ? params.get('categoria') : null
  const categorias =
    tipoLista && TIPOS[tipoLista]
      ? [...new Set(ARTICULOS.filter((a) => a.tipo === tipoLista).map((a) => a.categoria))].map((c) => ({
          nombre: c,
          total: ARTICULOS.filter((a) => a.tipo === tipoLista && a.categoria === c).length,
        }))
      : []

  useEffect(() => {
    setConsulta(qUrl)
  }, [qUrl])

  useEffect(() => {
    document.documentElement.style.setProperty('--docs-header-h', '56px')
    return () => document.documentElement.style.removeProperty('--docs-header-h')
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function enviarBusqueda(valor) {
    const v = valor.trim()
    if (!v) {
      navigate({ pathname: '/recursos' })
      return
    }
    navigate({ pathname: '/recursos', search: `?q=${encodeURIComponent(v)}` })
  }

  const filtroN = filtroNav.trim().toLowerCase()
  const gruposVisibles = GRUPOS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !filtroN || i.label.toLowerCase().includes(filtroN)),
  })).filter((g) => g.items.length > 0)

  return (
    <Flex direction="column" minH="100vh" bg="white">
      {/* Topbar docs (reemplaza navbar del sitio) */}
      <Flex
        as="header"
        h="56px"
        px={{ base: 4, md: 6 }}
        align="center"
        gap={4}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        position="sticky"
        top={0}
        zIndex={40}
        bg="white"
      >
        <HStack spacing={2} flexShrink={0}>
          <Button
            as={RouterLink}
            to="/"
            size="sm"
            h="36px"
            variant="ghost"
            fontWeight="medium"
            leftIcon={<ArrowLeft size={16} aria-hidden />}
            px={{ base: 2, sm: 3 }}
          >
            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
              Inicio
            </Text>
          </Button>
          <Link as={RouterLink} to="/recursos" display="flex" alignItems="center" gap={2} _hover={{ textDecoration: 'none', opacity: 0.85 }}>
            <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="22px" w="auto" />
            <Text fontSize="sm" fontWeight="semibold" color="brand.ink" display={{ base: 'none', md: 'inline' }}>
              Docs
            </Text>
          </Link>
        </HStack>

        <InputGroup maxW="420px" flex="1" mx={{ md: 'auto' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={Search} boxSize={4} color="blackAlpha.400" />
          </InputLeftElement>
          <Input
            ref={inputRef}
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') enviarBusqueda(consulta)
            }}
            placeholder="Buscar"
            aria-label="Buscar en recursos"
            size="sm"
            h="36px"
            borderRadius="md"
            borderColor="blackAlpha.200"
            focusBorderColor="brand.primary"
            bg="blackAlpha.50"
            pr={14}
          />
          <InputRightElement w="auto" pr={2} pointerEvents="none" h="36px">
            <Kbd fontSize="10px" display={{ base: 'none', md: 'inline-block' }}>
              Ctrl K
            </Kbd>
          </InputRightElement>
        </InputGroup>

        <HStack spacing={2} flexShrink={0} display={{ base: 'none', md: 'flex' }}>
          <Button type="button" size="sm" variant="ghost" fontWeight="medium" onClick={() => navigate('/recursos/guias')}>
            Guías
          </Button>
          <Button type="button" size="sm" variant="ghost" fontWeight="medium" onClick={() => navigate('/recursos/soporte')}>
            Soporte
          </Button>
          <LinkAlPanel size="sm" h="36px" px={4} rightIcon={<ExternalLink size={14} aria-hidden />}>
            Panel
          </LinkAlPanel>
        </HStack>
      </Flex>

      <Flex flex="1" minH={0}>
        {/* Sidebar */}
        <Flex
          as="nav"
          aria-label="Secciones de recursos"
          display={{ base: 'none', lg: 'flex' }}
          w="260px"
          flexShrink={0}
          direction="column"
          borderRightWidth="1px"
          borderColor="blackAlpha.100"
          px={4}
          py={5}
          position="sticky"
          top="56px"
          h="calc(100vh - 56px)"
          overflowY="auto"
        >
          <InputGroup size="sm" mb={5}>
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} boxSize={3.5} color="blackAlpha.400" />
            </InputLeftElement>
            <Input
              value={filtroNav}
              onChange={(e) => setFiltroNav(e.target.value)}
              placeholder="Filtrar secciones"
              aria-label="Filtrar secciones"
              borderRadius="md"
              borderColor="blackAlpha.200"
            />
          </InputGroup>

          <VStack align="stretch" spacing={5} flex="1">
            {gruposVisibles.map((grupo) => (
              <Box key={grupo.titulo}>
                <Text fontSize="xs" fontWeight="semibold" color="blackAlpha.500" letterSpacing="0.04em" textTransform="uppercase" px={3} mb={1.5}>
                  {grupo.titulo}
                </Text>
                <VStack align="stretch" spacing={0.5}>
                  {grupo.items.map((s) => (
                    <Box key={s.key}>
                      <Box
                        as="button"
                        type="button"
                        textAlign="left"
                        w="full"
                        cursor="pointer"
                        onClick={() => navigate(s.to)}
                        {...itemLateral(activa === s.key && !categoriaActiva && !buscando)}
                      >
                        {s.label}
                      </Box>
                      {activa === s.key && !buscando && categorias.length > 0 && (s.key === 'guias' || s.key === 'documentacion') ? (
                        <Box ml={3} mt={0.5} borderLeftWidth="1px" borderColor="blackAlpha.100" pl={1}>
                          {categorias.map((c) => (
                            <Box
                              key={c.nombre}
                              as="button"
                              type="button"
                              textAlign="left"
                              w="full"
                              cursor="pointer"
                              onClick={() =>
                                navigate({
                                  pathname: `/recursos/${s.key}`,
                                  search: `?categoria=${encodeURIComponent(c.nombre)}`,
                                })
                              }
                              {...itemLateral(categoriaActiva === c.nombre)}
                              fontSize="xs"
                              py={1}
                            >
                              {c.nombre}
                            </Box>
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>

          <Box mt={6} p={4} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="lg">
            <Text fontSize="sm" fontWeight="semibold" color="brand.ink" mb={1}>
              ¿Necesita ayuda?
            </Text>
            <Text fontSize="sm" color="blackAlpha.600" mb={3} lineHeight="1.5">
              Lea las guías o abra el panel de su empresa.
            </Text>
            <LinkAlPanel size="sm" w="full">
              Abrir panel
            </LinkAlPanel>
          </Box>
        </Flex>

        {/* Contenido */}
        <Box flex="1" minW={0} px={{ base: 5, md: 10, xl: 14 }} py={{ base: 8, md: 10 }}>
          {/* Nav móvil */}
          <HStack spacing={2} mb={6} overflowX="auto" display={{ base: 'flex', lg: 'none' }} pb={1}>
            {GRUPOS.flatMap((g) => g.items).map((s) => (
              <Button
                key={s.key}
                type="button"
                size="sm"
                variant={activa === s.key ? 'solid' : 'outline'}
                flexShrink={0}
                onClick={() => navigate(s.to)}
              >
                {s.label}
              </Button>
            ))}
          </HStack>

          {buscando ? (
            <ResultadosBusqueda consulta={qUrl.trim()} onLimpiar={() => navigate('/recursos')} />
          ) : (
            <Outlet key={pathname} />
          )}
        </Box>
      </Flex>

      <Box as="footer" borderTopWidth="1px" borderColor="blackAlpha.100" px={6} py={4}>
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <Text fontSize="sm" color="blackAlpha.500">
            Inducta Docs · © {new Date().getFullYear()}
          </Text>
          <Button as={RouterLink} to="/" size="sm" variant="ghost" leftIcon={<ArrowLeft size={14} aria-hidden />}>
            Volver al inicio
          </Button>
        </HStack>
      </Box>
    </Flex>
  )
}
