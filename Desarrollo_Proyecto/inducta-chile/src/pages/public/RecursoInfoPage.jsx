import { Box, Button, Grid, Heading, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { EncabezadoRecurso } from '../../layouts/RecursosLayout'
import { PAGINAS } from '../../lib/recursos'

export default function RecursoInfoPage({ pagina }) {
  const { titulo, bajada, secciones, nota } = PAGINAS[pagina]

  return (
    <Box>
      <EncabezadoRecurso
        titulo={titulo}
        bajada={bajada}
        migas={[
          { label: 'Recursos', to: { pathname: '/recursos' } },
          { label: 'Plataforma', to: '/recursos/capacitaciones' },
          { label: titulo },
        ]}
      >
        <HStack spacing={2} flexShrink={0}>
          <Button as={RouterLink} to="/contacto" size="sm" px={4}>
            Agendar demo
          </Button>
          <Button as={RouterLink} to="/precios" size="sm" variant="outline" px={4}>
            Ver planes
          </Button>
        </HStack>
      </EncabezadoRecurso>

      {secciones.map((s) => (
        <Box as="section" key={s.titulo} mb={10}>
          <Heading as="h2" fontSize="lg" fontWeight="semibold" letterSpacing="-0.01em" mb={4}>
            {s.titulo}
          </Heading>
          <Box as={s.numerada ? 'ol' : 'ul'} listStyleType="none" borderTopWidth="1px" borderColor="blackAlpha.100">
            {s.items.map((item, i) => (
              <Grid
                as="li"
                key={item.t}
                templateColumns={{ base: '1fr', md: 'minmax(0, 18rem) minmax(0, 1fr)' }}
                gap={{ base: 1, md: 8 }}
                py={4}
                borderBottomWidth="1px"
                borderColor="blackAlpha.100"
              >
                <HStack spacing={3} align="baseline">
                  {s.numerada && (
                    <Text fontWeight="semibold" color="brand.primary" minW="1.25rem" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {i + 1}
                    </Text>
                  )}
                  <Text fontWeight="semibold" color="brand.ink">
                    {item.t}
                  </Text>
                </HStack>
                <Text color="blackAlpha.700" lineHeight="1.6" pl={{ base: s.numerada ? 8 : 0, md: 0 }}>
                  {item.d}
                </Text>
              </Grid>
            ))}
          </Box>
        </Box>
      ))}

      {nota && (
        <Text fontSize="sm" color="blackAlpha.600" lineHeight="1.6" pt={4} borderTopWidth="1px" borderColor="blackAlpha.100">
          {nota}
        </Text>
      )}
    </Box>
  )
}
