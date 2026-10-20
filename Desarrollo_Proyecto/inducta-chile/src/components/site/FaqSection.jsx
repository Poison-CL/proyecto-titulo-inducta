import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { ArrowRight, Plus } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const preguntas = [
  {
    q: '¿Qué es Inducta Chile?',
    a: 'Una plataforma para gestionar las inducciones y capacitaciones de su personal. Reúne los programas en un solo lugar, registra el avance de cada colaborador y guarda la evidencia que piden las auditorías.',
  },
  {
    q: '¿Para qué empresas está pensada?',
    a: 'Para empresas en Chile que necesitan ordenar el ingreso de nuevos colaboradores y poder demostrar que las capacitaciones se realizaron. Funciona igual con equipos chicos y grandes.',
  },
  {
    q: '¿Puedo probar la plataforma antes de contratar?',
    a: 'Sí. Puede agendar una demo sin costo y recorrer el flujo completo con su equipo antes de decidir.',
  },
  {
    q: '¿Cómo se organizan los contenidos?',
    a: 'Por área, cargo o normativa, como le acomode a su empresa. Cada programa deja registro de quién completó cada etapa y en qué fecha.',
  },
  {
    q: '¿Cómo acceden los colaboradores?',
    a: 'Usted crea los accesos desde el panel de su empresa. Cada colaborador entra con su correo y ve únicamente los programas asignados a su cargo.',
  },
  {
    q: '¿Cómo pido soporte?',
    a: 'Escríbanos a contacto@inductachile.cl o use la sección Contacto del sitio. Respondemos en días hábiles.',
  },
]

const entrada = (delay) => ({
  animation: `${fadeUp} 0.3s cubic-bezier(0.32, 0.72, 0, 1) ${delay}s both`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
})

export default function FaqSection() {
  return (
    <Box as="section" id="preguntas" bg="white" py={{ base: 16, md: 24 }}>
      <Container maxW="6xl" px={{ base: 4, md: 8 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: 'minmax(0, 4fr) minmax(0, 8fr)' }}
          gap={{ base: 8, lg: 16 }}
          alignItems="start"
        >
          <Box sx={entrada(0)}>
            <Heading
              as="h2"
              color="brand.ink"
              fontWeight="semibold"
              letterSpacing="-0.03em"
              lineHeight="1.1"
              fontSize={{ base: '1.9rem', md: '2.4rem' }}
              mb={4}
            >
              Preguntas frecuentes
            </Heading>
            <Text color="blackAlpha.700" lineHeight="1.6" maxW="34ch" mb={5}>
              ¿No encuentra lo que busca? Revise la documentación o escríbanos.
            </Text>
            <Flex gap={5} wrap="wrap" fontSize="sm" fontWeight="semibold">
              <Link as={RouterLink} to="/recursos/soporte" color="brand.primary" display="inline-flex" alignItems="center" gap={1}>
                Ir a soporte <ArrowRight size={15} aria-hidden />
              </Link>
              <Link as={RouterLink} to="/contacto" color="brand.primary">
                Contacto
              </Link>
            </Flex>
          </Box>

          <Accordion allowToggle borderBottomWidth="1px" borderColor="blackAlpha.200" sx={entrada(0.06)}>
            {preguntas.map((item) => (
              <AccordionItem key={item.q} borderTopWidth="1px" borderBottomWidth="0" borderColor="blackAlpha.200">
                {({ isExpanded }) => (
                  <>
                    <h3>
                      <AccordionButton px={0} py={5} gap={4} _hover={{ bg: 'transparent', color: 'brand.primary' }} color="brand.ink">
                        <Box
                          as="span"
                          flex="1"
                          textAlign="left"
                          fontWeight="semibold"
                          fontSize={{ base: 'md', md: 'lg' }}
                          letterSpacing="-0.01em"
                          transition="color 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                        >
                          {item.q}
                        </Box>
                        <Box
                          as="span"
                          color="brand.primary"
                          flexShrink={0}
                          transform={isExpanded ? 'rotate(45deg)' : 'none'}
                          transition="transform 250ms cubic-bezier(0.32, 0.72, 0, 1)"
                          sx={{ '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
                        >
                          <Plus size={20} aria-hidden />
                        </Box>
                      </AccordionButton>
                    </h3>
                    <AccordionPanel px={0} pt={0} pb={6} pr={{ md: 12 }} color="blackAlpha.700" lineHeight="1.7" maxW="65ch">
                      {item.a}
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </Grid>
      </Container>
    </Box>
  )
}
