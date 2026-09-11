import { Box, Flex, Grid, HStack, Icon, Progress, Text, VStack } from '@chakra-ui/react'
import {
  Award,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Search,
  ShieldCheck,
} from 'lucide-react'

// Los mockups del hero son solo decoracion, los datos que muestran son inventados.
const HIGHLIGHT = '#9BD4F0'

const iconTile = [
  { label: 'Induccion', icon: ClipboardList, bg: '#E3F2FD', color: '#1565C0' },
  { label: 'Seguridad', icon: ShieldCheck, bg: '#E8F5E9', color: '#2E7D32' },
  { label: 'Documentos', icon: FileText, bg: '#FFF3E0', color: '#EF6C00' },
  { label: 'Certificados', icon: Award, bg: '#F3E5F5', color: '#7B1FA2' },
]

// Pantalla del telefono
export function PhoneMock() {
  return (
    <Box
      w={{ md: '210px', lg: '230px' }}
      bg="white"
      borderRadius="2xl"
      // El resplandor azul es lo que despega la tarjeta del fondo
      boxShadow="0 24px 48px rgba(0, 30, 70, 0.4), 0 0 60px rgba(120, 200, 255, 0.55)"
      overflow="hidden"
      position="relative"
      zIndex={3}
      borderWidth="1px"
      borderColor="white"
    >
      <Box px={3.5} pt={4} pb={2}>
        <Flex align="center" justify="space-between" mb={3}>
          <HStack spacing={2.5}>
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="brand.primary"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="sm" fontWeight="bold" color="white">
                C
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" color="blackAlpha.500" lineHeight="1.1">
                Â¡Buen dia!
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.ink" lineHeight="1.2">
                Camila R.
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Search} boxSize={3.5} color="blackAlpha.400" />
            <Icon as={Bell} boxSize={3.5} color="blackAlpha.500" />
          </HStack>
        </Flex>

        <Box bg="brand.soft" borderRadius="lg" px={3} py={2.5} mb={3}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="10px" fontWeight="semibold" color="brand.ink">
              Tu induccion
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="brand.primary">
              62%
            </Text>
          </Flex>
          <Progress
            value={62}
            size="sm"
            borderRadius="full"
            bg="blackAlpha.100"
            sx={{ '& > div': { bg: HIGHLIGHT } }}
          />
        </Box>

        <VStack align="stretch" spacing={2}>
          {iconTile.map((item) => (
            <HStack
              key={item.label}
              bg="white"
              borderRadius="lg"
              px={2.5}
              py={2.5}
              spacing={3}
              boxShadow="0 1px 3px rgba(0,0,0,0.06)"
              borderWidth="1px"
              borderColor="blackAlpha.50"
            >
              <Flex
                w="32px"
                h="32px"
                borderRadius="md"
                bg={item.bg}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={item.icon} boxSize={4} color={item.color} />
              </Flex>
              <Text flex="1" fontSize="xs" fontWeight="semibold" color="brand.ink">
                {item.label}
              </Text>
              <Icon as={CheckCircle2} boxSize={4} color="green.400" opacity={0.85} />
            </HStack>
          ))}
        </VStack>
      </Box>
      <Box h="10px" />
    </Box>
  )
}

// Dashboard de escritorio
export function DesktopMock() {
  return (
    <Box
      w={{ md: '600px', lg: '680px', xl: '760px' }}
      bg="white"
      borderRadius="xl"
      boxShadow="0 28px 64px rgba(0, 30, 60, 0.38)"
      overflow="hidden"
      position="relative"
      zIndex={1}
    >
      {/* Barra superior */}
      <Flex
        align="center"
        gap={1.5}
        px={3}
        py={2}
        bg="#F7FAFC"
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
      >
        <Box w="8px" h="8px" borderRadius="full" bg="#FF5F57" />
        <Box w="8px" h="8px" borderRadius="full" bg="#FEBC2E" />
        <Box w="8px" h="8px" borderRadius="full" bg="#28C840" />
        <Text ml={2} fontSize="10px" color="blackAlpha.400" noOfLines={1}>
          panel.inductachile.cl
        </Text>
      </Flex>

      <HStack
        spacing={0}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        px={4}
        bg="white"
      >
        {['Programas', 'Avance', 'Evidencia'].map((tab, i) => (
          <Text
            key={tab}
            fontSize="xs"
            fontWeight={i === 1 ? 'bold' : 'medium'}
            color={i === 1 ? 'brand.primary' : 'blackAlpha.500'}
            px={3}
            py={2.5}
            borderBottomWidth="2px"
            borderColor={i === 1 ? 'brand.primary' : 'transparent'}
            mb="-1px"
          >
            {tab}
          </Text>
        ))}
      </HStack>

      <Grid templateColumns="1.15fr 0.95fr" gap={3} p={3.5}>
        {/* Columna izquierda: detalle */}
        <Box>
          <Text fontSize="10px" color="blackAlpha.500" mb={2} fontWeight="medium">
            Completados este mes
          </Text>
          {[
            { name: 'Induccion general', meta: '148 / 160', pct: 92 },
            { name: 'Seguridad laboral', meta: '125 / 160', pct: 78 },
            { name: 'Onboarding area', meta: '86 / 160', pct: 54 },
          ].map((row) => (
            <Box
              key={row.name}
              mb={2}
              p={2}
              borderRadius="md"
              bg="brand.soft"
              _last={{ mb: 0 }}
            >
              <Flex justify="space-between" mb={0.5}>
                <Text fontSize="10px" color="brand.ink" fontWeight="semibold">
                  {row.name}
                </Text>
                <Text fontSize="10px" color="brand.primary" fontWeight="bold">
                  {row.pct}%
                </Text>
              </Flex>
              <Text fontSize="9px" color="blackAlpha.500" mb={1}>
                {row.meta} colaboradores
              </Text>
              <Progress
                value={row.pct}
                size="xs"
                borderRadius="full"
                bg="blackAlpha.100"
                sx={{ '& > div': { bg: 'brand.primary' } }}
              />
            </Box>
          ))}
        </Box>

        {/* Columna derecha: widgets */}
        <VStack align="stretch" spacing={2.5}>
          <Flex
            bg="brand.soft"
            borderRadius="lg"
            p={3}
            align="center"
            gap={3}
          >
            {/* Anillo de cumplimiento */}
            <Box
              w="56px"
              h="56px"
              borderRadius="full"
              flexShrink={0}
              bg={`conic-gradient(${HIGHLIGHT} 0 86%, #D6E4EF 86% 100%)`}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Flex
                w="40px"
                h="40px"
                borderRadius="full"
                bg="white"
                align="center"
                justify="center"
                direction="column"
              >
                <Text fontSize="xs" fontWeight="bold" color="brand.primary" lineHeight="1">
                  86%
                </Text>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="10px" color="blackAlpha.500">
                Cumplimiento
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.ink" lineHeight="1.2">
                Equipo al dia
              </Text>
              <Text fontSize="9px" color="blackAlpha.500">
                124 colaboradores
              </Text>
            </Box>
          </Flex>

          <Box
            borderRadius="lg"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            p={2.5}
            bg="white"
          >
            <HStack mb={2} spacing={2}>
              <Flex
                w="28px"
                h="28px"
                borderRadius="full"
                bg="#FFE8E8"
                align="center"
                justify="center"
              >
                <Icon as={Award} boxSize={3.5} color="brand.accent" />
              </Flex>
              <Text fontSize="10px" fontWeight="bold" color="brand.ink">
                Reconocimiento
              </Text>
            </HStack>
            <Text fontSize="10px" color="blackAlpha.600" lineHeight="1.4">
              â€œComplete la induccion en 2 dias. Todo claro y ordenado.â€
            </Text>
            <Text fontSize="9px" color="brand.primary" mt={1} fontWeight="semibold">
              â€” Mateo M.
            </Text>
          </Box>
        </VStack>
      </Grid>

      {/* Tabla archivos */}
      <Box px={3.5} pb={3}>
        <Flex
          bg="brand.soft"
          borderRadius="md"
          px={2.5}
          py={1.5}
          mb={1.5}
          justify="space-between"
        >
          <Text fontSize="9px" fontWeight="semibold" color="blackAlpha.500" flex="1">
            Carpeta
          </Text>
          <Text fontSize="9px" fontWeight="semibold" color="blackAlpha.500" w="52px">
            Fecha
          </Text>
          <Text fontSize="9px" fontWeight="semibold" color="blackAlpha.500" w="40px" textAlign="right">
            Peso
          </Text>
        </Flex>
        {[
          { name: 'Certificados', date: 'Hoy', size: '2.1 MB' },
          { name: 'Asistencia', date: 'Ayer', size: '840 KB' },
          { name: 'Evaluaciones', date: '03 mar', size: '1.4 MB' },
        ].map((f) => (
          <HStack key={f.name} px={2.5} py={1.5} spacing={2}>
            <Icon as={FolderOpen} boxSize={3.5} color="brand.primary" />
            <Text flex="1" fontSize="10px" color="brand.ink" fontWeight="medium" noOfLines={1}>
              {f.name}
            </Text>
            <Text fontSize="9px" color="blackAlpha.500" w="52px">
              {f.date}
            </Text>
            <Text fontSize="9px" color="blackAlpha.400" w="40px" textAlign="right">
              {f.size}
            </Text>
          </HStack>
        ))}
      </Box>
    </Box>
  )
}

