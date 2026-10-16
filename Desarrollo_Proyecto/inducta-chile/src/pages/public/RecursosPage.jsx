import { useState } from 'react'
import { Box, Grid, Icon, Input, InputGroup, InputLeftElement, Link, LinkBox, LinkOverlay, Text } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { EncabezadoRecurso } from '../../layouts/RecursosLayout'
import { TIPOS, buscar, fechaCorta } from '../../lib/recursos'

const COLUMNAS = { base: '1fr', md: 'minmax(0, 1fr) 160px 110px 60px' }

export function CabeceraTemas() {
  return (
    <Grid
      display={{ base: 'none', md: 'grid' }}
      templateColumns={COLUMNAS}
      gap={6}
      px={3}
      pb={2}
      fontSize="xs"
      fontWeight="semibold"
      color="blackAlpha.600"
      borderBottomWidth="1px"
      borderColor="blackAlpha.200"
    >
      <Text>Tema</Text>
      <Text>Categoría</Text>
      <Text>Actualizado</Text>
      <Text textAlign="right">Lectura</Text>
    </Grid>
  )
}

export function FilaArticulo({ articulo: a, nivel = 'h2' }) {
  return (
    <LinkBox
      as="article"
      display="grid"
      gridTemplateColumns={COLUMNAS}
      gap={{ base: 1, md: 6 }}
      alignItems="center"
      px={3}
      py={4}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      transition="background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ bg: 'brand.soft' }}
      _active={{ bg: 'blackAlpha.50' }}
    >
      <Box minW={0}>
        <Text as={nivel} fontSize="md" fontWeight="semibold" lineHeight="1.35" color="brand.ink">
          <LinkOverlay as={RouterLink} to={`/recursos/${a.slug}`}>
            {a.titulo}
          </LinkOverlay>
        </Text>
        <Text fontSize="sm" color="blackAlpha.600" mt={0.5} noOfLines={1}>
          {a.resumen}
        </Text>
      </Box>
      <Text fontSize="sm" fontWeight="medium" color="brand.primary">
        {a.categoria}
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" whiteSpace="nowrap" display={{ base: 'none', md: 'block' }}>
        {fechaCorta(a.fecha)}
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" textAlign="right" display={{ base: 'none', md: 'block' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {a.minutos} min
      </Text>
    </LinkBox>
  )
}

export function Buscador({ value, onChange, placeholder, label }) {
  return (
    <InputGroup w={{ base: 'full', md: '300px' }} flexShrink={0}>
      <InputLeftElement pointerEvents="none">
        <Icon as={Search} boxSize={4} color="blackAlpha.500" />
      </InputLeftElement>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        borderRadius="lg"
        borderColor="blackAlpha.200"
        focusBorderColor="brand.primary"
      />
    </InputGroup>
  )
}

export function SinResultados({ consulta }) {
  return (
    <Box py={12} px={3}>
      <Text fontWeight="semibold" color="brand.ink">
        No encontramos resultados para “{consulta}”
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" mt={1}>
        Pruebe con otra palabra o{' '}
        <Link as={RouterLink} to="/contacto" color="brand.primary" fontWeight="semibold">
          escríbanos
        </Link>
        .
      </Text>
    </Box>
  )
}

export default function RecursosPage() {
  const [params] = useSearchParams()
  const tipo = params.get('tipo') === 'documentacion' ? 'documentacion' : 'guias'
  const categoria = params.get('categoria')
  const [consulta, setConsulta] = useState('')
  const articulos = buscar(tipo, consulta).filter((a) => !categoria || a.categoria === categoria)

  return (
    <Box>
      <EncabezadoRecurso titulo={TIPOS[tipo].titulo} bajada={TIPOS[tipo].bajada}>
        <Buscador
          value={consulta}
          onChange={setConsulta}
          placeholder="Buscar temas"
          label={`Buscar en ${TIPOS[tipo].titulo}`}
        />
      </EncabezadoRecurso>

      <Text fontSize="sm" color="blackAlpha.600" mb={3} px={3}>
        {categoria ? `${categoria} · ` : ''}
        {articulos.length} {articulos.length === 1 ? 'tema' : 'temas'}
      </Text>

      <CabeceraTemas />
      {articulos.length === 0 ? (
        <SinResultados consulta={consulta} />
      ) : (
        articulos.map((a) => <FilaArticulo key={a.slug} articulo={a} />)
      )}
    </Box>
  )
}
