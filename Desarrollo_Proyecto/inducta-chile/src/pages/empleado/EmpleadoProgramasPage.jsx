import {
  Badge,
  Box,
  Flex,
  Heading,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import { BookOpen } from 'lucide-react'

const PROGRAMAS_PLACEHOLDER = [
  {
    id: 1,
    nombre: 'Inducción General',
    descripcion: 'Conoce la empresa, sus valores y procesos básicos.',
    progreso: 0,
    estado: 'pendiente',
    etapas: 5,
    etapasCompletadas: 0,
  },
  {
    id: 2,
    nombre: 'Seguridad y Prevención',
    descripcion: 'Protocolos de seguridad laboral según normativa vigente.',
    progreso: 0,
    estado: 'pendiente',
    etapas: 3,
    etapasCompletadas: 0,
  },
]

const estadoColor = {
  pendiente: 'gray',
  'en-progreso': 'blue',
  completado: 'green',
}

const estadoLabel = {
  pendiente: 'Pendiente',
  'en-progreso': 'En progreso',
  completado: 'Completado',
}

export default function EmpleadoProgramasPage() {
  return (
    <Box maxW="48rem" mx="auto">
      <Flex align="center" gap={3} mb={6}>
        <BookOpen size={20} strokeWidth={1.75} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mis Programas
        </Heading>
      </Flex>

      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Aquí aparecerán los programas de inducción y capacitación que tu empresa
        te haya asignado.
      </Text>

      <VStack spacing={4} align="stretch">
        {PROGRAMAS_PLACEHOLDER.map((p) => (
          <ProgramaCard key={p.id} programa={p} />
        ))}
      </VStack>
    </Box>
  )
}

function ProgramaCard({ programa }) {
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      bg="white"
      _hover={{ borderColor: 'blackAlpha.200', shadow: 'sm' }}
      transition="all 0.15s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Text fontWeight="semibold" color="brand.ink" fontSize="sm">
          {programa.nombre}
        </Text>
        <Badge
          colorScheme={estadoColor[programa.estado]}
          fontSize="10px"
          borderRadius="full"
          px={2}
          flexShrink={0}
          ml={3}
        >
          {estadoLabel[programa.estado]}
        </Badge>
      </Flex>

      <Text color="blackAlpha.600" fontSize="sm" mb={4}>
        {programa.descripcion}
      </Text>

      <Progress
        value={programa.progreso}
        size="sm"
        borderRadius="full"
        colorScheme="blue"
        mb={1.5}
      />
      <Flex justify="space-between">
        <Text fontSize="xs" color="blackAlpha.500">
          {programa.etapasCompletadas} / {programa.etapas} etapas
        </Text>
        <Text fontSize="xs" color="blackAlpha.500">
          {programa.progreso}%
        </Text>
      </Flex>
    </Box>
  )
}
