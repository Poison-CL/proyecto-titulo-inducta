import { Box, Flex, Heading, HStack, Icon, Link, ListItem, Text, UnorderedList } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { TIPOS, fechaLarga, getArticulo } from '../../lib/recursos'
import NoEncontradaPage from './NoEncontradaPage'

const anclaDe = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function ArticuloPage() {
  const articulo = getArticulo(useParams().slug)
  if (!articulo) return <NoEncontradaPage />

  const tipo = TIPOS[articulo.tipo]
  const subtitulos = articulo.cuerpo.filter((b) => b.h).map((b) => b.h)

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
          {subtitulos.map((h) => (
            <Link key={h} href={`#${anclaDe(h)}`} display="block" fontSize="sm" color="blackAlpha.700" py={1}>
              {h}
            </Link>
          ))}
        </Box>
      )}
    </Flex>
  )
}
