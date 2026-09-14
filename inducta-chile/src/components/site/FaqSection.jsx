import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Heading,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

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

export default function FaqSection() {
  return (
    <Box as="section" id="preguntas" bg="white" py={{ base: 16, md: 24 }}>
      <Container maxW="4xl" px={{ base: 4, md: 8 }}>
        <Heading
          as="h2"
          textAlign="center"
          color="brand.primary"
          fontWeight="bold"
          fontSize={{ base: '1.9rem', md: '2.5rem' }}
          mb={{ base: 8, md: 12 }}
          sx={{ animation: `${fadeUp} 0.4s ease both` }}
        >
          Preguntas frecuentes
        </Heading>

        <Accordion
          allowToggle
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ animation: `${fadeUp} 0.45s ease 0.06s both` }}
        >
          {preguntas.map((item) => (
            <AccordionItem key={item.q} border="none">
              {({ isExpanded }) => (
                // Todo el estilo va en este elemento porque es el unico que sabe
                // si la pregunta esta abierta; repartirlo recorta las esquinas
                <Box
                  bg="white"
                  borderRadius={isExpanded ? '2xl' : 'full'}
                  boxShadow="0 1px 3px rgba(13, 13, 13, 0.08)"
                  overflow="hidden"
                  transition="border-radius 0.2s ease, box-shadow 0.2s ease"
                  _hover={{ boxShadow: '0 4px 14px rgba(13, 13, 13, 0.10)' }}
                >
                  <h3>
                    <AccordionButton
                      px={{ base: 5, md: 7 }}
                      py={4}
                      _hover={{ bg: 'brand.soft' }}
                    >
                      <Box
                        as="span"
                        flex="1"
                        textAlign="left"
                        fontWeight="semibold"
                        color="brand.ink"
                        fontSize={{ base: 'sm', md: 'md' }}
                        pr={3}
                      >
                        {item.q}
                      </Box>
                      <AccordionIcon color="brand.primary" boxSize={6} />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel
                    px={{ base: 5, md: 7 }}
                    pt={0}
                    pb={5}
                    color="blackAlpha.700"
                    fontSize="sm"
                    lineHeight="1.7"
                  >
                    {item.a}
                  </AccordionPanel>
                </Box>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Box>
  )
}
