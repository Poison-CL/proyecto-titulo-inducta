import { Box, Button, Grid, Heading, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { EncabezadoRecurso } from '../../layouts/RecursosLayout'

const PAGINAS = {
  capacitaciones: {
    titulo: 'Capacitaciones',
    bajada:
      'Su empresa crea sus propias capacitaciones y pruebas. Inducta Chile le da la plataforma para armarlas, asignarlas y medirlas.',
    secciones: [
      {
        titulo: 'Cómo se arma una capacitación',
        numerada: true,
        items: [
          { t: 'Cree el contenido', d: 'Escriba las etapas con el material que su equipo necesita aprender.' },
          { t: 'Agregue una prueba', d: 'Arme las preguntas con las que comprobará lo aprendido.' },
          { t: 'Asígnela por cargo o área', d: 'Cada colaborador ve solo las capacitaciones que le corresponden.' },
          { t: 'Revise los resultados', d: 'Vea quién la completó, cómo le fue en la prueba y en qué fecha.' },
        ],
      },
      {
        titulo: 'Lo que decide su empresa',
        items: [
          { t: 'El contenido', d: 'Qué se enseña y en qué orden. El material es suyo; nosotros no lo creamos ni lo modificamos.' },
          { t: 'Las preguntas', d: 'Qué se evalúa en cada prueba.' },
          { t: 'A quién se asigna', d: 'Por cargo, por área o a personas específicas.' },
        ],
      },
    ],
  },
  cumplimiento: {
    titulo: 'Cumplimiento',
    bajada:
      'Cada inducción y capacitación deja registro. Cuando le pidan evidencia en una auditoría o fiscalización, ya la tiene.',
    secciones: [
      {
        titulo: 'Qué queda registrado',
        items: [
          { t: 'Quién', d: 'El colaborador, su cargo y su área.' },
          { t: 'Qué', d: 'El programa asignado y sus contenidos.' },
          { t: 'Cuándo', d: 'La fecha en que completó cada etapa.' },
          { t: 'Resultado', d: 'Si terminó el programa y cómo le fue en las pruebas.' },
        ],
      },
      {
        titulo: 'Dónde suele pedirse esta evidencia',
        items: [
          {
            t: 'Ley 16.744 y DS 44',
            d: 'Informar a cada trabajador los riesgos de su puesto y las medidas preventivas al ingresar.',
          },
          {
            t: 'Ley 21.643 (Ley Karin)',
            d: 'Difundir el protocolo de prevención del acoso laboral, sexual y la violencia en el trabajo.',
          },
          {
            t: 'Reglamento interno',
            d: 'Dar a conocer el reglamento interno de orden, higiene y seguridad a cada colaborador.',
          },
        ],
      },
    ],
    nota: 'Esta información es referencial. Valide los requisitos de su empresa con su asesor legal o de prevención de riesgos.',
  },
}

export default function RecursoInfoPage({ pagina }) {
  const { titulo, bajada, secciones, nota } = PAGINAS[pagina]

  return (
    <Box>
      <EncabezadoRecurso titulo={titulo} bajada={bajada}>
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
