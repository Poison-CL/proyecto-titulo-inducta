import { useEffect, useState } from 'react'
import { Box, Flex, Heading, HStack, Icon, Link, LinkBox, LinkOverlay, ListItem, Text, UnorderedList } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ARTICULOS, TIPOS, fechaLarga, getArticulo } from '../../lib/recursos'
import NoEncontradaPage from './NoEncontradaPage'

const anclaDe = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const relacionadosDe = (a) =>
  ARTICULOS.filter((x) => x.tipo === a.tipo && x.slug !== a.slug)
    .sort((x, y) => (y.categoria === a.categoria) - (x.categoria === a.categoria))
    .slice(0, 3)

if (import.meta.env.DEV) {
  const a = ARTICULOS[0]
  const r = relacionadosDe(a)
  if (r.some((x) => x.slug === a.slug || x.tipo !== a.tipo) || r.length > 3) throw new Error('articulo: relacionados')
}

export default function ArticuloPage() {
  const articulo = getArticulo(useParams().slug)
  const subtitulos = articulo ? articulo.cuerpo.filter((b) => b.h).map((b) => b.h) : []
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    if (!subtitulos.length) return
    // ponytail: recorre los h2 en cada scroll; con artículos de decenas de secciones conviene IntersectionObserver.
    const alScroll = () => {
      const tope = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-h')) || 72) + 40
      let actual = null
      for (const h of subtitulos) {
        const el = document.getElementById(anclaDe(h))
        if (el && el.getBoundingClientRect().top <= tope) actual = h
      }
      setActivo(actual)
    }
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articulo?.slug])

  if (!articulo) return <NoEncontradaPage />

  const tipo = TIPOS[articulo.tipo]
  const relacionados = relacionadosDe(articulo)

  return (
    <Flex gap={12} align="flex-start">
      <Box as="article" flex="1" minW={0} maxW="68ch">
        <HStack spacing={1} fontSize="sm" color="blackAlpha.600" mb={4} flexWrap="wrap">
          <Link as={RouterLink} to="/recursos?tipo=guias" color="blackAlpha.600">
            Recursos
          </Link>
          <Icon as={ChevronRight} boxSize={3.5} />
          <Link as={RouterLink} to={`/recursos?tipo=${articulo.tipo}`} color="blackAlpha.600">
            {tipo.titulo}
          </Link>
          <Icon as={ChevronRight} boxSize={3.5} />
          <Link
            as={RouterLink}
            to={`/recursos?tipo=${articulo.tipo}&categoria=${encodeURIComponent(articulo.categoria)}`}
            color="brand.primary"
            fontWeight="medium"
          >
            {articulo.categoria}
          </Link>
        </HStack>

        <Heading as="h1" fontSize={{ base: '1.75rem', md: '2.1rem' }} fontWeight="semibold" lineHeight="1.15" letterSpacing="-0.02em" mb={3}>
          {articulo.titulo}
        </Heading>
        <Text fontSize="sm" color="blackAlpha.600" pb={6} mb={8} borderBottomWidth="1px" borderColor="blackAlpha.100">
          Actualizado el {fechaLarga(articulo.fecha)} · {articulo.minutos} min de lectura
        </Text>

        <Box fontSize="md" lineHeight="1.75" color="brand.ink">
          {articulo.cuerpo.map((b, i) =>
            typeof b === 'string' ? (
              <Text key={i} mb={5}>
                {b}
              </Text>
            ) : b.h ? (
              <Heading
                key={i}
                id={anclaDe(b.h)}
                as="h2"
                fontSize="xl"
                fontWeight="semibold"
                letterSpacing="-0.01em"
                mt={10}
                mb={3}
                sx={{ scrollMarginTop: 'calc(var(--site-header-h, 72px) + 24px)' }}
              >
                {b.h}
              </Heading>
            ) : (
              <UnorderedList key={i} spacing={2} mb={5} pl={1}>
                {b.lista.map((item) => (
                  <ListItem key={item}>{item}</ListItem>
                ))}
              </UnorderedList>
            ),
          )}
        </Box>

        <Box mt={14} pt={6} borderTopWidth="1px" borderColor="blackAlpha.100">
          <Text fontWeight="semibold" color="brand.ink">
            ¿No resolvió su duda?
          </Text>
          <Text fontSize="sm" color="blackAlpha.700" mt={1}>
            Cuéntenos qué necesita y le respondemos en días hábiles.{' '}
            <Link as={RouterLink} to="/contacto?motivo=soporte" color="brand.primary" fontWeight="semibold">
              Escribir a soporte
            </Link>
          </Text>
        </Box>

        {relacionados.length > 0 && (
          <Box as="section" mt={12}>
            <Heading as="h2" fontSize="lg" fontWeight="semibold" letterSpacing="-0.01em" mb={2}>
              Más en {tipo.titulo}
            </Heading>
            {relacionados.map((r) => (
              <LinkBox
                key={r.slug}
                as="article"
                display="flex"
                alignItems="center"
                gap={4}
                py={4}
                borderBottomWidth="1px"
                borderColor="blackAlpha.100"
                role="group"
              >
                <Box flex="1" minW={0}>
                  <Text fontSize="sm" fontWeight="medium" color="brand.primary">
                    {r.categoria}
                  </Text>
                  <Text as="h3" fontWeight="semibold" color="brand.ink" lineHeight="1.35">
                    <LinkOverlay as={RouterLink} to={`/recursos/${r.slug}`}>
                      {r.titulo}
                    </LinkOverlay>
                  </Text>
                </Box>
                <Box
                  color="blackAlpha.500"
                  transition="transform 200ms cubic-bezier(0.32, 0.72, 0, 1)"
                  _groupHover={{ transform: 'translateX(3px)', color: 'brand.primary' }}
                >
                  <ChevronRight size={18} aria-hidden />
                </Box>
              </LinkBox>
            ))}
          </Box>
        )}
      </Box>

      {subtitulos.length > 0 && (
        <Box
          as="aside"
          aria-label="En esta página"
          display={{ base: 'none', xl: 'block' }}
          w="200px"
          flexShrink={0}
          position="sticky"
          top="calc(var(--site-header-h, 72px) + 24px)"
        >
          <Text fontSize="xs" fontWeight="semibold" color="blackAlpha.600" mb={2}>
            En esta página
          </Text>
          <Box borderLeftWidth="1px" borderColor="blackAlpha.100">
            {subtitulos.map((h) => {
              const es = h === activo
              return (
                <Link
                  key={h}
                  href={`#${anclaDe(h)}`}
                  aria-current={es ? 'location' : undefined}
                  display="block"
                  fontSize="sm"
                  py={1}
                  pl={3}
                  ml="-1px"
                  borderLeftWidth="2px"
                  borderColor={es ? 'brand.primary' : 'transparent'}
                  color={es ? 'brand.primary' : 'blackAlpha.700'}
                  fontWeight={es ? 'semibold' : 'normal'}
                  transition="color 150ms, border-color 150ms"
                >
                  {h}
                </Link>
              )
            })}
          </Box>
        </Box>
      )}
    </Flex>
  )
}
