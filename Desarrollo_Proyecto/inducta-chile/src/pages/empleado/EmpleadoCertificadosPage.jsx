import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Award, Download } from 'lucide-react'

const CERTIFICADOS_PLACEHOLDER = []

export default function EmpleadoCertificadosPage() {
  return (
    <Box maxW="48rem" mx="auto">
      <Flex align="center" gap={3} mb={6}>
        <Award size={20} strokeWidth={1.75} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mis Certificados
        </Heading>
      </Flex>

      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Cuando completes un programa de inducción recibirás un certificado que
        podrás descargar desde aquí.
      </Text>

      {CERTIFICADOS_PLACEHOLDER.length === 0 ? (
        <EstadoVacio />
      ) : (
        <VStack spacing={4} align="stretch">
          {CERTIFICADOS_PLACEHOLDER.map((cert) => (
            <CertificadoCard key={cert.id} cert={cert} />
          ))}
        </VStack>
      )}
    </Box>
  )
}

function EstadoVacio() {
  return (
    <Box
      p={10}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      textAlign="center"
    >
      <Icon as={Award} boxSize={10} color="blackAlpha.200" mb={4} />
      <Text fontWeight="semibold" color="brand.ink" mb={2}>
        Sin certificados aún
      </Text>
      <Text fontSize="sm" color="blackAlpha.600" maxW="28ch" mx="auto">
        Completa tu primer programa de inducción para obtener tu certificado.
      </Text>
    </Box>
  )
}

function CertificadoCard({ cert }) {
  return (
    <Flex
      p={4}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      align="center"
      gap={4}
      bg="white"
    >
      <Icon as={Award} boxSize={8} color="brand.primary" flexShrink={0} />
      <Box flex="1">
        <Text fontWeight="semibold" color="brand.ink" fontSize="sm">
          {cert.programa}
        </Text>
        <Text fontSize="xs" color="blackAlpha.500">
          Emitido el {cert.fecha}
        </Text>
      </Box>
      <Button
        size="sm"
        variant="outline"
        leftIcon={<Download size={14} />}
        borderColor="blackAlpha.200"
        onClick={() => window.open(cert.url, '_blank')}
      >
        Descargar
      </Button>
    </Flex>
  )
}
