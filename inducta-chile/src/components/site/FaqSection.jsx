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
    q: '¿Que es Inducta Chile y para que sirve?',
    a: 'Es una plataforma para gestionar inducciones y capacitaciones de personal. Centraliza los programas, registra el avance de cada colaborador y guarda la evidencia necesaria para auditorias.',
  },
  {
    q: '¿Para que tipo de empresas esta pensada?',
    a: 'Para empresas y organizaciones en Chile que necesitan estandarizar el ingreso de colaboradores y acreditar el cumplimiento formativo, sin importar el tamano del equipo.',
  },
  {
    q: '¿Puedo probar la plataforma antes de contratar?',
    a: 'Si. Puede agendar una demo sin costo para revisar el flujo completo con su equipo antes de tomar una decision.',
  },
  {
    q: '¿Como se organizan los contenidos?',
    a: 'Por area, cargo o normativa. Cada programa deja trazabilidad de quien completo cada etapa y en que fecha.',
  },
  {
    q: '¿Como acceden los colaboradores?',
    a: 'La empresa crea los accesos desde su panel. Cada colaborador entra con su correo y ve solo los programas asignados a su cargo.',
  },
  {
    q: '¿Donde pido soporte?',
    a: 'Escriba a contacto@inductachile.cl o use la seccion Contacto del sitio. Respondemos en horario habil.',
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
            <AccordionItem
              key={item.q}
              border="none"
              bg="white"
              borderRadius="full"
              boxShadow="0 1px 6px rgba(0, 40, 80, 0.10)"
              overflow="hidden"
              _expanded={{ borderRadius: '2xl' }}
            >
              {({ isExpanded }) => (
                <Box borderRadius={isExpanded ? '2xl' : 'full'} bg="white">
                  <h3>
                    <AccordionButton
                      px={{ base: 5, md: 7 }}
                      py={{ base: 4, md: 4 }}
                      borderRadius={isExpanded ? '2xl' : 'full'}
                      _hover={{ bg: 'brand.soft' }}
                    >
                      <Box
                        as="span"
                        flex="1"
                        textAlign="left"
                        fontWeight="medium"
                        color="brand.primary"
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
