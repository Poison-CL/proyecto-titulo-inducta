import { Box, Flex, Grid, HStack, Icon, Progress, Text, VStack } from '@chakra-ui/react'
import {
  Award,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react'

// Los mockups del hero son solo decoracion, los datos que muestran son inventados.
const iconTile = [
  { label: 'Inducción', icon: ClipboardList },
  { label: 'Seguridad', icon: ShieldCheck },
  { label: 'Documentos', icon: FileText },
  { label: 'Certificados', icon: Award },
]

export function PhoneMock() {
  return (
    <Box
      w={{ md: '210px', lg: '230px' }}
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      zIndex={3}
      borderWidth="1px"
      borderColor="blackAlpha.100"
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
                ¡Buen día!
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.ink" lineHeight="1.2">
                Fabiana M.
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
              Tu inducción
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
            sx={{ '& > div': { bg: 'brand.accent' } }}
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
                bg="brand.wash"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={item.icon} boxSize={4} color="brand.primary" />
              </Flex>
              <Text flex="1" fontSize="xs" fontWeight="semibold" color="brand.ink">
                {item.label}
              </Text>
              <Icon as={CheckCircle2} boxSize={4} color="brand.accent" />
            </HStack>
          ))}
        </VStack>
      </Box>
      <Box h="10px" />
    </Box>
  )
}

// El telefono pisa 32px del borde izquierdo, asi que el contenido arranca mas adentro
const PL = 10

export function DesktopMock() {
  return (
    <Box
      w="full"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      zIndex={1}
      borderWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Flex
        align="center"
        gap={1.5}
        pl={PL}
        pr={3}
        py={2}
        bg="brand.soft"
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
      >
        <Text fontSize="10px" color="blackAlpha.400" noOfLines={1}>
          panel.inductachile.cl
        </Text>
      </Flex>

      <HStack
        spacing={0}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        pl={PL}
        pr={4}
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

      <Grid templateColumns="1.15fr 0.95fr" gap={3} pl={PL} pr={3.5} py={3.5}>
        <Box>
          <Text fontSize="10px" color="blackAlpha.500" mb={2} fontWeight="medium">
            Completados este mes
          </Text>
          {[
            { name: 'Inducción general', meta: '148 / 160', pct: 92 },
            { name: 'Seguridad laboral', meta: '125 / 160', pct: 78 },
            { name: 'Onboarding área', meta: '86 / 160', pct: 54 },
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

        <VStack align="stretch" spacing={2.5}>
          <Flex
            bg="brand.soft"
            borderRadius="lg"
            p={3}
            align="center"
            gap={3}
          >
            <Box
              w="56px"
              h="56px"
              borderRadius="full"
              flexShrink={0}
              bg="conic-gradient(#4260E6 0 86%, #DDE1F7 86% 100%)"
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
                Equipo al día
              </Text>
              <Text fontSize="9px" color="blackAlpha.500">
                124 colaboradores
              </Text>
            </Box>
          </Flex>
        </VStack>
      </Grid>

    </Box>
  )
}

