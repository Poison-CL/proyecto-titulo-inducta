import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react'
import { TrendingUp } from 'lucide-react'

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
        Seguimiento por etapa de cada programa asignado.
      </Text>

      <Box
        p={10}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        textAlign="center"
      >
        <Icon as={TrendingUp} boxSize={10} color="blackAlpha.200" mb={4} />
        <Text fontWeight="semibold" color="brand.ink" mb={2}>
          Sin avance todavía
        </Text>
        <Text fontSize="sm" color="blackAlpha.600" maxW="36ch" mx="auto">
          El progreso aparece cuando tengas un programa asignado y completes sus etapas.
        </Text>
      </Box>
    </Box>
  )
}
