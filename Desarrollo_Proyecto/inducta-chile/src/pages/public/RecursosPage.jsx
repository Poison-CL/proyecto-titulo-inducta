import { useState } from 'react'
import {
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ArrowRight, Search, X } from 'lucide-react'
import { Link as RouterLink, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import LinkAlPanel from '../../components/auth/LinkAlPanel'
import { useDocsToc } from '../../hooks/useDocsToc'
import { EncabezadoRecurso } from '../../layouts/RecursosLayout'
import { TIPOS, buscar, fechaCorta } from '../../lib/recursos'

const COLUMNAS = { base: '1fr', md: 'minmax(0, 1fr) 160px 110px 60px' }

const TOC = [
  { id: 'que-es', label: 'Qué es Inducta' },
  { id: 'flujo', label: 'Flujo de trabajo' },
  { id: 'evidencia', label: 'Evidencia y cumplimiento' },
]
const TOC_IDS = TOC.map((t) => t.id)

const FLUJO = [
  {
    t: 'Defina programas por cargo',
    d: 'Separe lo general de lo específico. Cada colaborador ve solo lo que necesita para su puesto.',
  },
  {
    t: 'Cree accesos y asigne',
    d: 'Alta con correo, asignación del programa y un responsable para la primera semana.',
  },
  {
    t: 'Siga el avance',
    d: 'Revise quién completó cada etapa, cuándo y cómo le fue en las pruebas.',
  },
  {
    t: 'Muestre evidencia',
    d: 'Ante una auditoría o fiscalización, el registro ya está listo en el panel.',
  },
]

export function CabeceraTemas() {
  return (
    <Grid
      display={{ base: 'none', md: 'grid' }}
      templateColumns={COLUMNAS}
      gap={6}
      px={0}
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
      px={0}
      py={4}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      _hover={{ bg: 'blackAlpha.50' }}
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
    <InputGroup w={{ base: 'full', md: '280px' }} flexShrink={0}>
      <InputLeftElement pointerEvents="none">
        <Icon as={Search} boxSize={4} color="blackAlpha.500" />
      </InputLeftElement>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        borderRadius="md"
        borderColor="blackAlpha.200"
        focusBorderColor="brand.primary"
        size="sm"
        h="40px"
      />
    </InputGroup>
  )
}

export function SinResultados({ consulta }) {
  return (
    <Box py={12}>
      <Text fontWeight="semibold" color="brand.ink">
        No encontramos resultados para “{consulta}”
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" mt={1}>
        Pruebe con otra palabra o{' '}
        <Link as={RouterLink} to="/contacto?motivo=soporte" color="brand.primary" fontWeight="semibold">
          escríbanos
        </Link>
        .
      </Text>
    </Box>
  )
}

const TOC_ITEM_H = 32 // px; alineado con py + line-height del link

function TocLateral({ activo, onIr }) {
  const idx = Math.max(0, TOC.findIndex((t) => t.id === activo))

  return (
    <Box
      as="aside"
      display={{ base: 'none', xl: 'block' }}
      w="200px"
      flexShrink={0}
      position="sticky"
      top="calc(var(--docs-header-h, 56px) + 24px)"
      alignSelf="flex-start"
    >
      <Text fontSize="xs" fontWeight="semibold" color="blackAlpha.500" letterSpacing="0.04em" textTransform="uppercase" mb={3}>
        En esta página
      </Text>
      <Box position="relative" borderLeftWidth="1px" borderColor="blackAlpha.100">
        <Box
          aria-hidden
          position="absolute"
          left="-1px"
          top={`${idx * TOC_ITEM_H}px`}
          w="2px"
          h={`${TOC_ITEM_H}px`}
          bg="brand.primary"
          borderRadius="1px"
          transition="top 280ms cubic-bezier(0.32, 0.72, 0, 1)"
          sx={{ '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
        />
        <VStack align="stretch" spacing={0}>
          {TOC.map((t) => {
            const es = activo === t.id
            return (
              <Link
                key={t.id}
                href={`#${t.id}`}
                onClick={(e) => onIr(t.id, e)}
                aria-current={es ? 'location' : undefined}
                h={`${TOC_ITEM_H}px`}
                display="flex"
                alignItems="center"
                fontSize="sm"
                color={es ? 'brand.primary' : 'blackAlpha.600'}
                fontWeight={es ? 'semibold' : 'normal'}
                pl={3}
                _hover={{ color: 'brand.primary', textDecoration: 'none' }}
                transition="color 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                sx={{ '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
              >
                {t.label}
              </Link>
            )
          })}
        </VStack>
      </Box>
      <Box mt={6}>
        <LinkAlPanel
          as={Link}
          fontSize="sm"
          fontWeight="semibold"
          color="brand.primary"
          display="inline-flex"
          alignItems="center"
          gap={1}
          _hover={{ textDecoration: 'underline' }}
        >
          Abrir panel <Icon as={ArrowRight} boxSize={3.5} />
        </LinkAlPanel>
      </Box>
    </Box>
  )
}

function RecursosIntro() {
  const { activo, irA } = useDocsToc(TOC_IDS)

  return (
    <Flex gap={{ base: 8, xl: 14 }} align="flex-start">
      <Box as="article" flex="1" minW={0} maxW="68ch">
        <EncabezadoRecurso
          titulo="Introducción a Inducta"
          bajada="Programe inducciones por cargo, siga el avance de cada colaborador y tenga evidencia lista para auditorías, desde un solo panel."
          migas={[
            { label: 'Recursos', to: '/recursos' },
            { label: 'Primeros pasos' },
          ]}
        />

        <Box fontSize="md" lineHeight="1.75" color="brand.ink">
          <Heading
            id="que-es"
            as="h2"
            fontSize="xl"
            fontWeight="semibold"
            letterSpacing="-0.01em"
            mb={3}
            sx={{ scrollMarginTop: 'calc(var(--docs-header-h, 56px) + 24px)' }}
          >
            Qué es Inducta
          </Heading>
          <Text mb={5} color="blackAlpha.800">
            Inducta Chile es la plataforma para inducción y capacitación en empresas. Cada organización administra programas, accesos, avance y evidencia desde el panel.
          </Text>
          <Text mb={10} color="blackAlpha.800">
            Los colaboradores entran con su correo, ven solo lo asignado a su cargo y dejan registro de cada etapa completada.
          </Text>

          <Heading
            id="flujo"
            as="h2"
            fontSize="xl"
            fontWeight="semibold"
            letterSpacing="-0.01em"
            mb={4}
            sx={{ scrollMarginTop: 'calc(var(--docs-header-h, 56px) + 24px)' }}
          >
            Flujo de trabajo
          </Heading>
          <VStack align="stretch" spacing={3} mb={10}>
            {FLUJO.map((paso, i) => (
              <Flex key={paso.t} gap={4} p={4} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="lg" align="flex-start">
                <Flex
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="brand.wash"
                  color="brand.primary"
                  fontSize="sm"
                  fontWeight="bold"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  {i + 1}
                </Flex>
                <Box>
                  <Text fontWeight="semibold" color="brand.ink" mb={0.5}>
                    {paso.t}
                  </Text>
                  <Text fontSize="sm" color="blackAlpha.700" lineHeight="1.55">
                    {paso.d}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>

          <Heading
            id="evidencia"
            as="h2"
            fontSize="xl"
            fontWeight="semibold"
            letterSpacing="-0.01em"
            mb={3}
            sx={{ scrollMarginTop: 'calc(var(--docs-header-h, 56px) + 24px)' }}
          >
            Evidencia y cumplimiento
          </Heading>
          <Box as="ul" pl={0} listStyleType="none" mb={10}>
            {[
              'Quién recibió cada programa y en qué fecha.',
              'Qué contenidos incluía y si completó cada etapa.',
              'Resultado de pruebas cuando la capacitación las tiene.',
              'Registro listo para fiscalizaciones (p. ej. seguridad laboral o protocolos internos).',
            ].map((item) => (
              <Text as="li" key={item} display="flex" gap={2} mb={2} color="blackAlpha.800">
                <Text as="span" color="brand.primary" fontWeight="bold">
                  ·
                </Text>
                {item}
              </Text>
            ))}
          </Box>
        </Box>

        <Flex align="center" justify="space-between" pt={6} borderTopWidth="1px" borderColor="blackAlpha.100" gap={4} flexWrap="wrap">
          <Text fontSize="sm" color="blackAlpha.500">
            Siguiente
          </Text>
          <Link
            as={RouterLink}
            to="/recursos/guias"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontWeight="semibold"
            color="brand.primary"
            _hover={{ textDecoration: 'underline' }}
          >
            Guías de inducción <Icon as={ArrowRight} boxSize={4} />
          </Link>
        </Flex>
      </Box>

      <TocLateral activo={activo} onIr={irA} />
    </Flex>
  )
}

function RecursosLista({ tipo }) {
  const [params] = useSearchParams()
  const categoria = params.get('categoria')
  const [consulta, setConsulta] = useState('')
  const articulos = buscar(tipo, consulta).filter((a) => !categoria || a.categoria === categoria)

  return (
    <Box maxW="56rem">
      <EncabezadoRecurso
        titulo={TIPOS[tipo].titulo}
        bajada={TIPOS[tipo].bajada}
        migas={[
          { label: 'Recursos', to: '/recursos' },
          { label: 'Primeros pasos', to: '/recursos' },
          { label: TIPOS[tipo].titulo },
        ]}
      >
        <Buscador
          value={consulta}
          onChange={setConsulta}
          placeholder="Buscar en esta sección"
          label={`Buscar en ${TIPOS[tipo].titulo}`}
        />
      </EncabezadoRecurso>

      <Text fontSize="sm" color="blackAlpha.600" mb={3}>
        {categoria ? `${categoria} · ` : ''}
        {articulos.length} {articulos.length === 1 ? 'tema' : 'temas'}
        {categoria ? (
          <Link as={RouterLink} to={`/recursos/${tipo}`} ml={3} color="brand.primary" fontWeight="medium">
            Ver todos <Icon as={X} boxSize={3.5} display="inline" mb="-2px" />
          </Link>
        ) : null}
      </Text>

      <CabeceraTemas />
      {articulos.length === 0 ? <SinResultados consulta={consulta} /> : articulos.map((a) => <FilaArticulo key={a.slug} articulo={a} />)}
    </Box>
  )
}

/** @param {{ tipo?: 'guias' | 'documentacion' }} props */
export default function RecursosPage({ tipo: tipoProp } = {}) {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  // Derivado del path por si React reutiliza la misma instancia entre rutas hermanas
  const tipo =
    tipoProp ??
    (pathname.startsWith('/recursos/guias')
      ? 'guias'
      : pathname.startsWith('/recursos/documentacion')
        ? 'documentacion'
        : null)

  // Legacy: /recursos?tipo=guias → /recursos/guias
  const legacy = params.get('tipo')
  if (!tipo && (legacy === 'guias' || legacy === 'documentacion')) {
    const cat = params.get('categoria')
    const search = cat ? `?categoria=${encodeURIComponent(cat)}` : ''
    return <Navigate to={`/recursos/${legacy}${search}`} replace />
  }
  return tipo ? <RecursosLista tipo={tipo} /> : <RecursosIntro />
}
