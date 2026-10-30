import {
  Box,
  Flex,
  Heading,
  Progress,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Text,
  VStack,
} from '@chakra-ui/react'
import { TrendingUp } from 'lucide-react'

const PROGRESO_PLACEHOLDER = [
  {
    id: 1,
    programa: 'Inducción General',
    porcentaje: 0,
    etapas: [
      { titulo: 'Bienvenida a la empresa', completada: false },
      { titulo: 'Política interna y valores', completada: false },
      { titulo: 'Sistemas y herramientas', completada: false },
      { titulo: 'Procesos del área', completada: false },
      { titulo: 'Evaluación final', completada: false },
    ],
  },
  {
    id: 2,
    programa: 'Seguridad y Prevención',
    porcentaje: 0,
    etapas: [
      { titulo: 'Introducción a la seguridad', completada: false },
      { titulo: 'Protocolos de emergencia', completada: false },
      { titulo: 'Evaluación práctica', completada: false },
    ],
  },
]

export default function EmpleadoProgresosPage() {
  return (
    <Box maxW="48rem" mx="auto">
      <Flex align="center" gap={3} mb={6}>
        <TrendingUp size={20} strokeWidth={1.75} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mi Progreso
        </Heading>
      </Flex>

      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Seguimiento detallado de cada etapa dentro de tus programas asignados.
      </Text>

      <VStack spacing={6} align="stretch">
        {PROGRESO_PLACEHOLDER.map((prog) => (
          <ProgresoCard key={prog.id} prog={prog} />
        ))}
      </VStack>
    </Box>
  )
}

function ProgresoCard({ prog }) {
  const activeStep = prog.etapas.filter((e) => e.completada).length

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      bg="white"
    >
      <Text fontWeight="semibold" color="brand.ink" fontSize="sm" mb={1}>
        {prog.programa}
      </Text>

      <Flex align="center" gap={3} mb={4}>
        <Progress
          value={prog.porcentaje}
          flex="1"
          size="sm"
          borderRadius="full"
          colorScheme="blue"
        />
        <Text fontSize="xs" color="blackAlpha.500" flexShrink={0}>
          {prog.porcentaje}%
        </Text>
      </Flex>

      <Stepper index={activeStep} orientation="vertical" gap="0" size="sm">
        {prog.etapas.map((etapa, i) => (
          <Step key={i}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink="0" pb={4}>
              <StepTitle>
                <Text fontSize="sm" color="brand.ink">
                  {etapa.titulo}
                </Text>
              </StepTitle>
              <StepDescription>
                <Text fontSize="xs" color="blackAlpha.500">
                  {etapa.completada ? 'Completada' : 'Pendiente'}
                </Text>
              </StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
