import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react'
import { BookOpen } from 'lucide-react'

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
        Aquí aparecerán los programas de inducción y capacitación que tu empresa te asigne.
      </Text>

      <Box
        p={10}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        textAlign="center"
      >
        <Icon as={BookOpen} boxSize={10} color="blackAlpha.200" mb={4} />
        <Text fontWeight="semibold" color="brand.ink" mb={2}>
          Sin programas asignados
        </Text>
        <Text fontSize="sm" color="blackAlpha.600" maxW="36ch" mx="auto">
          Cuando tu administrador te asigne una inducción o capacitación, la verás en esta lista.
        </Text>
      </Box>
    </Box>
  )
}
